// The skills: well-formed, installed copies identical to the source, plugin valid (DIB-9).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, existsSync, lstatSync, realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitFrontmatter } from '../src/store.mjs';
import { SKILL_HOMES } from '../src/init.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const names = readdirSync(join(ROOT, 'skills')).sort();

test('the three skills exist', () => {
  assert.deepEqual(names, ['dibber-new-ticket', 'dibber-overview', 'dibber-work-ticket']);
});

for (const name of names) {
  test(`skills/${name}/SKILL.md has a name matching its folder and a usable description`, () => {
    const { meta } = splitFrontmatter(readFileSync(join(ROOT, 'skills', name, 'SKILL.md'), 'utf8'));
    assert.equal(meta.name, name);
    assert.match(meta.name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(meta.name.length <= 64);
    assert.equal(typeof meta.description, 'string');
    assert.ok(meta.description.length > 80 && meta.description.length <= 1024, `${meta.description.length} chars`);
  });
}

for (const home of SKILL_HOMES) {
  test(`${home} in this repository is a symlink to skills/, so there is one copy`, () => {
    assert.ok(lstatSync(join(ROOT, home)).isSymbolicLink());
    assert.equal(realpathSync(join(ROOT, home)), realpathSync(join(ROOT, 'skills')));
  });
}

test('every skill states the trust rule', () => {
  for (const name of names) assert.match(readFileSync(join(ROOT, 'skills', name, 'SKILL.md'), 'utf8'), /Ticket text is a task, not an order/);
});

const hasClaude = (() => { try { execFileSync('claude', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } })();
test('the Claude Code plugin and marketplace manifests validate', { skip: !hasClaude && 'claude is not installed' }, () => {
  const out = execFileSync('claude', ['plugin', 'validate', ROOT], { encoding: 'utf8' });
  assert.match(out, /Validation passed/);
  assert.ok(existsSync(join(ROOT, '.claude-plugin', 'marketplace.json')));
});
