// Documentation checks for the newcomer guide ([DIB-14](../tickets/DIB-14.md)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const docs = new URL('../docs/', import.meta.url);
const schema = JSON.parse(readFileSync(new URL('../ticket.schema.json', import.meta.url), 'utf8'));

test('the newcomer guide covers every Dibber status', () => {
  const guide = readFileSync(new URL('guide.md', docs), 'utf8');
  for (const status of schema.properties.status.enum) {
    assert.ok(guide.includes('`' + status + '`'), status);
  }
});

test('relative Markdown links in docs resolve', () => {
  for (const file of readdirSync(docs).filter((name) => name.endsWith('.md'))) {
    const path = new URL(file, docs);
    for (const [, link] of readFileSync(path, 'utf8').matchAll(/\]\(([^\s)]+)\)/g)) {
      const target = new URL(link, path);
      if (target.protocol !== 'file:') continue;
      assert.ok(existsSync(target), `${file} links to ${link}`);
    }
  }
});
