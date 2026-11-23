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

test('site/index.html is built from site/src (run `npm run site` after editing)', () => {
  assert.equal(html, buildSite());
});

test('the page is self-contained: the only external load is the Plausible script, when configured', () => {
  const config = JSON.parse(readFileSync(join(ROOT, 'site', 'site.json'), 'utf8'));
  const external = [...html.matchAll(/<(script|img|link)\b[^>]*\b(src|href)="(https?:)?\/\/[^"]+"/g)].map((m) => m[0]);
  if (config.analytics.plausibleScript) assert.deepEqual(external, [`<script async src="https://plausible.io/js/${config.analytics.plausibleScript}.js"`]);
  else assert.deepEqual(external, []);
  assert.ok(!html.includes('{{'), 'no unfilled placeholder');
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
