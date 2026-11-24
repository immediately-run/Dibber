// The website and the agent install guide ([DIB-22](../tickets/DIB-22.md)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite } from '../scripts/build-site.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://immediately-run.github.io/dibber/';
const RAW = 'https://raw.githubusercontent.com/immediately-run/dibber/main/';
const html = readFileSync(join(ROOT, 'site', 'index.html'), 'utf8');

// What the Pages job publishes beside the page: `site-files` in the cache.yml stub, each file
// served at the site root under its own name. Name → repository path.
const siteFilesLine = readFileSync(join(ROOT, '.github', 'workflows', 'cache.yml'), 'utf8').match(/^ {6}site-files: '([^']*)'$/m);
const PUBLISHED = new Map((siteFilesLine?.[1].split(' ') ?? []).map((p) => [p.slice(p.lastIndexOf('/') + 1), p]));
/** The repository file a URL on the site serves, or `undefined` when the site does not publish it. */
const servedFile = (url) => {
  const name = url.startsWith(SITE_URL) ? url.slice(SITE_URL.length) : url;
  return PUBLISHED.has(name) ? join(ROOT, PUBLISHED.get(name)) : undefined;
};
const pngSize = (file) => { const b = readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };

test('site/index.html is built from site/src (run `npm run site` after editing)', () => {
  assert.equal(html, buildSite());
});

test('the page loads nothing from another site but the Plausible script, when configured', () => {
  const config = JSON.parse(readFileSync(join(ROOT, 'site', 'site.json'), 'utf8'));
  // `rel="canonical"` names the page's own address; it is metadata, not something the page loads.
  const external = [...html.matchAll(/<(script|img|link)\b[^>]*\b(src|href)="(https?:)?\/\/[^"]+"/g)].map((m) => m[0])
    .filter((tag) => !/\brel="canonical"/.test(tag));
  if (config.analytics.plausibleScript) assert.deepEqual(external, [`<script async src="https://plausible.io/js/${config.analytics.plausibleScript}.js"`]);
  else assert.deepEqual(external, []);
  assert.ok(!html.includes('{{'), 'no unfilled placeholder');
});

test('every file the page names on its own site is published there', () => {
  // Relative links and src attributes, and absolute URLs on the site: each must be a file the
  // Pages job publishes, and that file must exist, or the link is a 404 once deployed.
  const own = [
    ...[...html.matchAll(/\b(?:href|src)="(?![a-z]+:|\/\/|#|data:)([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(new RegExp(`"(${SITE_URL.replace(/[.\/]/g, '\\$&')}[^"]+)"`, 'g'))].map((m) => m[1]),
  ];
  assert.ok(own.length >= 6, own.join(' '));
  for (const url of own) {
    const file = servedFile(url);
    assert.ok(file, `${url} is in site-files in .github/workflows/cache.yml`);
    assert.ok(existsSync(file), `${url} is served from ${file}, which exists`);
  }
  for (const path of PUBLISHED.values()) assert.ok(existsSync(join(ROOT, path)), `site-files names ${path}, which exists`);
});

test('the head links a favicon for each size a browser asks for, and one search can crawl', () => {
  const icons = [...html.matchAll(/<link rel="icon" type="image\/png" sizes="(\d+)x\1" href="([^"]+)">/g)];
  assert.deepEqual(icons.map((m) => Number(m[1])), [16, 32, 48, 192]);
  for (const [, size, url] of icons) {
    assert.ok(!url.startsWith('data:'), `${url} is a URL a search engine can crawl`);
    assert.deepEqual(pngSize(servedFile(url)), [Number(size), Number(size)], `${url} is ${size}px square`);
  }
  // Google Search wants a square favicon whose side is a multiple of 48px.
  assert.ok(icons.some(([, size]) => Number(size) % 48 === 0 && Number(size) > 48));
});

test('the head carries what search engines and link previews read', () => {
  const meta = (attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1];
  assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL}">`));
  assert.equal(meta('property', 'og:url'), SITE_URL);
  for (const [attr, name] of [['name', 'description'], ['property', 'og:title'], ['property', 'og:description'], ['name', 'twitter:card'], ['property', 'og:image:alt']]) {
    assert.ok(meta(attr, name), `${name} is set`);
  }
  // The preview image is published on the site, at the size it declares.
  for (const url of [meta('property', 'og:image'), meta('name', 'twitter:image')]) {
    assert.ok(url.startsWith(SITE_URL), `${url} is an absolute URL on the site`);
    assert.deepEqual(pngSize(servedFile(url)), [Number(meta('property', 'og:image:width')), Number(meta('property', 'og:image:height'))]);
  }
  const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(ld['@type'], 'SoftwareApplication');
  assert.equal(ld.url, SITE_URL);
});

test('every in-page link has its target', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const missing = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((id) => !ids.has(id));
  assert.deepEqual(missing, []);
});

test('the paste line points agents at the site, which carries the install steps', () => {
  const lines = [...html.matchAll(/<code id="prompt2?">([^<]+)<\/code>/g)].map((m) => m[1]);
  assert.equal(lines.length, 2);
  for (const l of lines) assert.ok(l.endsWith(SITE_URL), l);
  assert.match(html, /<section class="agents" id="agents">/);
  for (const cmd of ['npx -y @immediately-run/dibber init --yes --prefix', 'npx -y @immediately-run/dibber check']) {
    assert.ok(html.includes(cmd), `page has ${cmd}`);
    assert.ok(readFileSync(join(ROOT, 'docs', 'install.md'), 'utf8').includes(cmd), `docs/install.md has ${cmd}`);
  }
});

test('llms.txt links only to files in this repository that exist, or to the site', () => {
  const links = [...readFileSync(join(ROOT, 'llms.txt'), 'utf8').matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1]);
  assert.ok(links.length >= 5);
  for (const l of links) {
    if (l === SITE_URL) continue;
    assert.ok(l.startsWith(RAW), l);
    assert.ok(existsSync(join(ROOT, l.slice(RAW.length))), `${l} exists in the repository`);
  }
});
