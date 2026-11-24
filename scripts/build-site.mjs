#!/usr/bin/env node
// Build Dibber's website into one self-contained page ([DIB-22](../tickets/DIB-22.md)).
//
//   node scripts/build-site.mjs           writes site/index.html
//   node scripts/build-site.mjs --check   exits 1 if site/index.html is out of date
//
// The Pages cache job (.github/workflows/cache.yml, `landing-html`) publishes exactly one file
// as the site's root page, so everything is inlined: the CSS, the script and the icons.
// Analytics: `analytics.plausibleScript` in site/site.json is the site's Plausible script id
// (`pa-…`, from Plausible's install snippet); null loads nothing.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'site', 'src');
const OUT = join(ROOT, 'site', 'index.html');

export function buildSite() {
  const read = (f) => readFileSync(join(SRC, f), 'utf8');
  const dataUri = (f, type) => `data:${type};base64,${readFileSync(join(SRC, f)).toString('base64')}`;
  const config = JSON.parse(readFileSync(join(ROOT, 'site', 'site.json'), 'utf8'));
  const script = config.analytics?.plausibleScript;
  if (script != null && !/^pa-[A-Za-z0-9_-]+$/.test(script)) throw new Error(`site.json: plausibleScript ${JSON.stringify(script)} is not a Plausible script id (pa-…)`);
  // Plausible's install snippet, as its dashboard gives it, with the script id filled in.
  const analytics = script
    ? `<script async src="https://plausible.io/js/${script}.js"></script>\n<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>`
    : '';
  const note = script ? 'Visits are counted with <a href="https://plausible.io/data-policy">Plausible</a>: no cookies, no personal data.' : '';
  const values = {
    STYLE: read('style.css'),
    SCRIPT: read('site.js'),
    ICON: dataUri('dibber-640.webp', 'image/webp'),
    FAVICON: dataUri('favicon-48.png', 'image/png'),
    ANALYTICS: analytics,
    ANALYTICS_NOTE: note,
  };
  let html = read('index.html').replace(/<!-- Dibber's website:[\s\S]*?-->/, '<!-- Built by scripts/build-site.mjs from site/src/: edit those files and run `npm run site`, not this one. -->');
  html = html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
    if (!(k in values)) throw new Error(`unknown placeholder ${m}`);
    return values[k];
  });
  return html;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = buildSite();
  if (process.argv.includes('--check')) {
    let current = '';
    try { current = readFileSync(OUT, 'utf8'); } catch {}
    if (current !== html) {
      console.error('✗ site/index.html is out of date: run `npm run site`');
      process.exit(1);
    }
    console.log('✓ site/index.html is up to date');
  } else {
    writeFileSync(OUT, html);
    console.log(`✓ wrote site/index.html (${Math.round(html.length / 1024)} KB)`);
  }
}
