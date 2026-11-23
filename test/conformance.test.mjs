// Every conformance fixture through `dibber check` (DIB-5, DIB-6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkStore } from '../src/check.mjs';
import { STATUSES } from '../src/store.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIX = join(ROOT, 'conformance');
const fixtures = (kind) => readdirSync(join(FIX, kind)).sort().map((name) => ({ name, dir: join(FIX, kind, name), expect: JSON.parse(readFileSync(join(FIX, kind, name, 'expect.json'), 'utf8')) }));

for (const f of fixtures('valid')) {
  test(`valid/${f.name} passes`, () => {
    assert.equal(f.expect.valid, true);
    const { errors, store } = checkStore(f.dir);
    assert.deepEqual(errors, []);
    assert.ok(store.tickets.length > 0, 'the store holds at least one ticket');
  });
}

for (const f of fixtures('invalid')) {
  test(`invalid/${f.name} fails on ${f.expect.rule} in ${f.expect.file}`, () => {
    assert.equal(f.expect.valid, false);
    const { errors } = checkStore(f.dir);
    assert.ok(errors.length > 0, 'the store is rejected');
    const rules = new Set(errors.map((e) => e.rule));
    assert.deepEqual([...rules], [f.expect.rule], `breaks exactly one rule: ${JSON.stringify(errors)}`);
    assert.ok(errors.some((e) => e.file === f.expect.file), `names ${f.expect.file}: ${JSON.stringify(errors)}`);
  });
}

// The rules a validator can check from the files alone. Each needs an invalid fixture.
const CHECKABLE = ['R-DIB-1', 'R-DIB-3', 'R-DIB-4', 'R-DIB-5', 'R-DIB-6', 'R-DIB-8', 'R-DIB-14'];

test('every checkable rule has an invalid fixture', () => {
  const covered = new Set(fixtures('invalid').map((f) => f.expect.rule));
  assert.deepEqual(CHECKABLE.filter((r) => !covered.has(r)), []);
});

test('valid/every-key uses every status and every R-DIB-5 key', () => {
  const { store } = checkStore(join(FIX, 'valid', 'every-key'));
  const statuses = new Set(store.tickets.map((t) => t.meta.status));
  assert.deepEqual(STATUSES.filter((s) => !statuses.has(s)), []);
  const schema = JSON.parse(readFileSync(join(ROOT, 'ticket.schema.json'), 'utf8'));
  const keys = new Set(store.tickets.flatMap((t) => Object.keys(t.meta)));
  assert.deepEqual(Object.keys(schema.properties).filter((k) => !keys.has(k)), []);
});

test("this repository's own store passes", () => {
  const { errors } = checkStore(ROOT);
  assert.deepEqual(errors, []);
});

test("every id in this repository's store uses the prefix .dibber/config.json names (DIB-1)", () => {
  const { store } = checkStore(ROOT);
  assert.equal(store.settings.prefix, 'DIB');
  assert.deepEqual(store.tickets.map((t) => t.meta.id).filter((id) => !id.startsWith('DIB-')), []);
});
