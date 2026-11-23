// The dibber CLI end to end, in throwaway git repositories (DIB-7, DIB-8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, writeFileSync, readdirSync, lstatSync, readlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run } from '../src/cli.mjs';
import { checkStore } from '../src/check.mjs';

function repo(name = 'recipe-app') {
  const dir = join(mkdtempSync(join(tmpdir(), 'dibber-')), name);
  execFileSync('mkdir', ['-p', dir]);
  const git = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  git('init', '-q', '-b', 'main');
  git('config', 'user.name', 'Sam Example');
  git('config', 'user.email', 'sam@example.invalid');
  return { dir, git };
}
const dibber = async (dir, ...args) => run(args, { cwd: dir, interactive: false });
const tree = (dir) => execFileSync('find', ['.', '-path', './.git', '-prune', '-o', '(', '-type', 'f', '-o', '-type', 'l', ')', '-print'], { cwd: dir, encoding: 'utf8' }).split('\n').filter(Boolean).sort();
const snapshot = (dir) => tree(dir).map((f) => [f, lstatSync(join(dir, f)).isSymbolicLink() ? `-> ${readlinkSync(join(dir, f))}` : readFileSync(join(dir, f), 'utf8')]);

test('init --yes in an empty repository: check passes and list shows the first ticket', async () => {
  const { dir } = repo();
  const r = await dibber(dir, 'init', '--yes');
  assert.equal(r.code, 0, r.stderr);
  assert.ok(existsSync(join(dir, '.dibber', 'config.json')));
  assert.deepEqual(JSON.parse(readFileSync(join(dir, '.dibber', 'config.json'), 'utf8')), { store: 'tickets', prefix: 'RA' });
  assert.equal((await dibber(dir, 'check')).code, 0);
  const list = JSON.parse((await dibber(dir, 'list', '--json')).stdout);
  assert.deepEqual(list.map((x) => x.id), ['RA-1']);
  for (const p of ['AGENTS.md', 'CLAUDE.md', '.agents/skills/dibber-work-ticket/SKILL.md', '.claude/skills/dibber-overview/SKILL.md']) assert.ok(existsSync(join(dir, p)), p);
});

test('init keeps one copy of each skill: .claude/skills links to .agents/skills', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  for (const name of ['dibber-new-ticket', 'dibber-overview', 'dibber-work-ticket']) {
    const link = join(dir, '.claude/skills', name);
    assert.ok(lstatSync(link).isSymbolicLink(), name);
    assert.equal(readlinkSync(link), join('..', '..', '.agents', 'skills', name));
    assert.ok(lstatSync(join(dir, '.agents/skills', name, 'SKILL.md')).isFile());
  }
});

test('init --copy-skills writes real copies, for checkouts without symlinks', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP', '--copy-skills');
  const link = join(dir, '.claude/skills/dibber-overview');
  assert.ok(!lstatSync(link).isSymbolicLink());
  assert.equal(readFileSync(join(link, 'SKILL.md'), 'utf8'), readFileSync(join(dir, '.agents/skills/dibber-overview/SKILL.md'), 'utf8'));
});

test('init --update-skills refreshes .agents/skills and leaves the links alone', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  writeFileSync(join(dir, '.agents/skills/dibber-overview/SKILL.md'), 'stale\n');
  const r = JSON.parse((await dibber(dir, 'init', '--yes', '--prefix', 'APP', '--update-skills', '--json')).stdout);
  assert.deepEqual(r.updated, ['.agents/skills/dibber-overview/SKILL.md']);
  assert.notEqual(readFileSync(join(dir, '.claude/skills/dibber-overview/SKILL.md'), 'utf8'), 'stale\n');
});

test('init twice changes nothing the second time', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  const before = snapshot(dir);
  const r = await dibber(dir, 'init', '--yes', '--prefix', 'APP', '--json');
  assert.deepEqual(JSON.parse(r.stdout).created, []);
  const after = snapshot(dir);
  assert.deepEqual(after, before);
});

test('init appends to an existing AGENTS.md and CLAUDE.md once', async () => {
  const { dir } = repo();
  writeFileSync(join(dir, 'AGENTS.md'), '# Ours\n\nUse tabs.\n');
  writeFileSync(join(dir, 'CLAUDE.md'), '# Ours too\n');
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  const agents = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  assert.match(agents, /^# Ours\n\nUse tabs\.\n/);
  assert.equal(agents.split('<!-- dibber:agents -->').length, 2);
  assert.equal(readFileSync(join(dir, 'CLAUDE.md'), 'utf8').split('@AGENTS.md').length, 2);
});

test('new files the next id with a valid body; .md by default, .mdx on request (DIB-3)', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  const a = JSON.parse((await dibber(dir, 'new', '--title', 'Add a dark mode: with toggle', '--criterion', 'a test: the toggle flips the theme', '--tags', 'ui', '--json')).stdout);
  assert.deepEqual(a, { id: 'APP-2', file: 'tickets/APP-2.md' });
  const b = JSON.parse((await dibber(dir, 'new', '--title', 'Remember the theme', '--depends-on', 'APP-2', '--mdx', '--json')).stdout);
  assert.deepEqual(b, { id: 'APP-3', file: 'tickets/APP-3.mdx' });
  const text = readFileSync(join(dir, 'tickets/APP-2.md'), 'utf8');
  assert.match(text, /^---\nid: APP-2\ntitle: "?APP-2 — Add a dark mode: with toggle"?\nstatus: available\n/);
  assert.match(text, /- \[ \] a test: the toggle flips the theme/);
  assert.match(text, /## Status\n\n_filed \d{4}-\d\d-\d\d\._\n$/);
  const { errors, warnings } = checkStore(dir);
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('new skips a number taken on another local branch (DIB-2)', async () => {
  const { dir, git } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  git('add', '-A'); git('commit', '-qm', 'init');
  git('checkout', '-qb', 'other');
  await dibber(dir, 'new', '--title', 'On the other branch');
  git('add', '-A'); git('commit', '-qm', 'APP-2');
  git('checkout', '-q', 'main');
  const r = JSON.parse((await dibber(dir, 'new', '--title', 'On main', '--json')).stdout);
  assert.equal(r.id, 'APP-3');
});

test('new refuses a dependency on a ticket that does not exist', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  const r = await dibber(dir, 'new', '--title', 'x', '--depends-on', 'APP-9');
  assert.equal(r.code, 2);
  assert.match(r.stderr, /APP-9/);
  assert.equal(readdirSync(join(dir, 'tickets')).filter((n) => n.startsWith('APP-2')).length, 0);
});

test('claim, set and done: done moves the file to archive/ and check still passes', async () => {
  const { dir, git } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  git('add', '-A'); git('commit', '-qm', 'init');
  assert.equal((await dibber(dir, 'claim', 'APP-1')).code, 0);
  let t = readFileSync(join(dir, 'tickets/APP-1.md'), 'utf8');
  assert.match(t, /status: in-progress/);
  assert.match(t, /assignee: Sam Example/);
  assert.match(t, /claimed by Sam Example/);
  assert.equal((await dibber(dir, 'set', 'APP-1', 'in-review', '--pr', 'https://github.com/example/app/pull/1')).code, 0);
  const r = await dibber(dir, 'done', 'APP-1', '--json');
  assert.equal(r.code, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout), { id: 'APP-1', file: 'tickets/archive/APP-1.md', status: 'done' });
  assert.ok(!existsSync(join(dir, 'tickets/APP-1.md')));
  t = readFileSync(join(dir, 'tickets/archive/APP-1.md'), 'utf8');
  assert.match(t, /status: done/);
  assert.match(t, /prs: \["?https:\/\/github.com\/example\/app\/pull\/1"?\]/);
  assert.deepEqual(checkStore(dir).errors, []);
  assert.equal((await dibber(dir, 'list', '--json')).stdout.trim(), '[]');
  assert.equal((await dibber(dir, 'set', 'APP-1', 'available')).code, 2, 'a closed ticket is not reopened');
});

test('claim refuses a ticket that waits on another, unless forced', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  await dibber(dir, 'new', '--title', 'Later', '--depends-on', 'APP-1');
  const r = await dibber(dir, 'claim', 'APP-2');
  assert.equal(r.code, 2);
  assert.match(r.stderr, /waits on APP-1/);
  assert.equal((await dibber(dir, 'claim', 'APP-2', '--force')).code, 0);
});

test('set withdrawn closes into the archive (R-DIB-2)', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  const r = await dibber(dir, 'set', 'APP-1', 'withdrawn', '--note', 'not needed', '--json');
  assert.equal(JSON.parse(r.stdout).file, 'tickets/archive/APP-1.md');
  assert.match(readFileSync(join(dir, 'tickets/archive/APP-1.md'), 'utf8'), /not needed\._\n$/);
});

test('check --json reports problems with rule and file, and exits 1', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  writeFileSync(join(dir, 'tickets/APP-7.md'), '---\nid: APP-7\ntitle: x\nstatus: todo\n---\n');
  const r = await dibber(dir, 'check', '--json');
  assert.equal(r.code, 1);
  const out = JSON.parse(r.stdout);
  assert.equal(out.ok, false);
  assert.deepEqual(out.errors.map((e) => [e.rule, e.file]), [['R-DIB-6', 'tickets/APP-7.md']]);
});
