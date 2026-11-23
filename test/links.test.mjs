// Code links to its tickets with Markdown links that resolve ([DIB-25](../tickets/DIB-25.md)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = ['src', 'bin', 'scripts', 'test', '.github/workflows', 'action.yml'];
const LINK = /\[([A-Z][A-Z0-9]*-\d+[a-z0-9]*)\]\(([^)\s]+\.mdx?)\)/g;

function files(p) {
  const abs = join(ROOT, p);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isFile()) return [abs];
  return readdirSync(abs).flatMap((n) => files(join(p, n)));
}

const links = SOURCES.flatMap(files).flatMap((f) =>
  [...readFileSync(f, 'utf8').matchAll(LINK)].map((m) => ({ from: relative(ROOT, f), id: m[1], target: resolve(dirname(f), m[2]) })),
);

test('this repository links its source to tickets', () => {
  assert.ok(links.length >= 8, `found ${links.length} links`);
});

test('every ticket link in the source resolves to that ticket', () => {
  const broken = links.filter((l) => !existsSync(l.target) || !l.target.endsWith(`/${l.id}.md`) && !l.target.endsWith(`/${l.id}.mdx`));
  assert.deepEqual(broken.map((l) => `${l.from}: ${l.id} → ${relative(ROOT, l.target)}`), []);
});
