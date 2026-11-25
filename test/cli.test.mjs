// The dibber CLI end to end, in throwaway git repositories (DIB-7, DIB-8).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, existsSync, writeFileSync, readdirSync, lstatSync, readlinkSync } from 'node:fs';
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
  const c = await dibber(dir, 'check');
  assert.equal(c.code, 0);
  assert.match(c.stdout, /tickets\/: 1 ticket, no problems/);
  const list = JSON.parse((await dibber(dir, 'list', '--json')).stdout);
  assert.deepEqual(list.map((x) => x.id), ['RA-1']);
  for (const p of ['AGENTS.md', 'CLAUDE.md', '.agents/skills/dibber-work-ticket/SKILL.md', '.claude/skills/dibber-overview/SKILL.md']) assert.ok(existsSync(join(dir, p)), p);
});

test('init copies the skills into both homes by default, so every checkout works', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  for (const name of ['dibber-new-ticket', 'dibber-overview', 'dibber-work-ticket']) {
    for (const home of ['.agents/skills', '.claude/skills']) {
      assert.ok(lstatSync(join(dir, home, name)).isDirectory(), `${home}/${name} is a real folder`);
      assert.ok(lstatSync(join(dir, home, name, 'SKILL.md')).isFile());
    }
  }
});

test('init --link-skills links .claude/skills to .agents/skills instead', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP', '--link-skills');
  const link = join(dir, '.claude/skills/dibber-overview');
  assert.ok(lstatSync(link).isSymbolicLink());
  assert.equal(readlinkSync(link), join('..', '..', '.agents', 'skills', 'dibber-overview'));
});

test('a skill link checked out as a text file: check warns, init repairs it as a copy', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP', '--link-skills');
  // What git writes on Windows without core.symlinks: a file holding the link's target.
  const broken = join(dir, '.claude/skills/dibber-overview');
  execFileSync('rm', [broken]);
  writeFileSync(broken, '../../.agents/skills/dibber-overview');
  const c = JSON.parse((await dibber(dir, 'check', '--json')).stdout);
  assert.deepEqual(c.warnings.map((w) => [w.rule, w.file]), [['setup', '.claude/skills/dibber-overview']]);
  assert.match(c.warnings[0].message, /dibber init --yes --update-skills/);
  const r = JSON.parse((await dibber(dir, 'init', '--yes', '--update-skills', '--json')).stdout);
  assert.deepEqual(r.repaired, ['.claude/skills/dibber-overview']);
  assert.ok(lstatSync(join(broken, 'SKILL.md')).isFile());
  assert.deepEqual(JSON.parse((await dibber(dir, 'check', '--json')).stdout).warnings, []);
});

test('init --update-skills refreshes stale copies', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  writeFileSync(join(dir, '.agents/skills/dibber-overview/SKILL.md'), 'stale\n');
  const r = JSON.parse((await dibber(dir, 'init', '--yes', '--prefix', 'APP', '--update-skills', '--json')).stdout);
  assert.deepEqual(r.updated, ['.agents/skills/dibber-overview/SKILL.md']);
  assert.notEqual(readFileSync(join(dir, '.agents/skills/dibber-overview/SKILL.md'), 'utf8'), 'stale\n');
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

test("claim, set and done: done closes the ticket in place and leaves git's index alone", async () => {
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
  assert.deepEqual(JSON.parse(r.stdout), { id: 'APP-1', file: 'tickets/APP-1.md', status: 'done' });
  t = readFileSync(join(dir, 'tickets/APP-1.md'), 'utf8');
  assert.match(t, /status: done/);
  assert.match(t, /prs: \["?https:\/\/github.com\/example\/app\/pull\/1"?\]/);
  assert.ok(!existsSync(join(dir, 'tickets/archive')), 'nothing is moved to an archive');
  // The bug this replaces: a move was staged and the rewrite was not, so a plain commit
  // recorded a half-closed ticket. Now nothing is staged; the change is an ordinary edit.
  assert.equal(git('diff', '--cached', '--name-only'), '');
  assert.equal(git('status', '--porcelain'), ' M tickets/APP-1.md\n');
  assert.deepEqual(checkStore(dir).errors, []);
  assert.equal((await dibber(dir, 'list', '--json')).stdout.trim(), '[]');
  assert.deepEqual(JSON.parse((await dibber(dir, 'list', '--all', '--json')).stdout).map((x) => [x.id, x.status, x.closed]), [['APP-1', 'done', true]]);
  assert.equal((await dibber(dir, 'set', 'APP-1', 'available')).code, 2, 'a closed ticket is not reopened');
});

test('a dependency closed in place counts as done', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  await dibber(dir, 'new', '--title', 'Later', '--depends-on', 'APP-1');
  await dibber(dir, 'done', 'APP-1');
  assert.deepEqual(JSON.parse((await dibber(dir, 'list', '--ready', '--json')).stdout).map((x) => x.id), ['APP-2']);
});

test('a superseded dependency counts as done; a withdrawn or deferred one still holds (R-DIB-8, DIB-20)', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  await dibber(dir, 'new', '--title', 'Replaced', '--depends-on', 'APP-1');
  await dibber(dir, 'set', 'APP-1', 'superseded');
  assert.deepEqual(JSON.parse((await dibber(dir, 'list', '--ready', '--json')).stdout).map((x) => x.id), ['APP-2']);
  for (const status of ['withdrawn', 'deferred']) {
    const { dir: d } = repo();
    await dibber(d, 'init', '--yes', '--prefix', 'APP');
    await dibber(d, 'new', '--title', 'Waits', '--depends-on', 'APP-1');
    await dibber(d, 'set', 'APP-1', status);
    assert.deepEqual(JSON.parse((await dibber(d, 'list', '--ready', '--json')).stdout).map((x) => x.id), [], status);
  }
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

test('set withdrawn closes in place (R-DIB-2)', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  const r = await dibber(dir, 'set', 'APP-1', 'withdrawn', '--note', 'not needed', '--json');
  assert.equal(JSON.parse(r.stdout).file, 'tickets/APP-1.md');
  assert.match(readFileSync(join(dir, 'tickets/APP-1.md'), 'utf8'), /status: withdrawn[\s\S]*not needed\._\n$/);
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

test('init adds the board files to the store by default, and check still passes (DIB-13, DIB-32)', async () => {
  const { dir } = repo();
  const r = await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  assert.equal(r.code, 0, r.stderr);
  const marker = JSON.parse(readFileSync(join(dir, 'tickets', 'immediately.run.json'), 'utf8'));
  assert.deepEqual(marker.opensWith, { app: 'github:immediately-run/dibber-board', version: '1.0' });
  assert.match(readFileSync(join(dir, 'tickets', 'home.mdx'), 'utf8'), /<RoadmapBoard \/>/);
  assert.match(readFileSync(join(dir, 'tickets', '_layout.mdx'), 'utf8'), /<RoadmapMeta \/>/);
  // DIB-29: a project page lists its tickets; ProjectMembers renders nothing elsewhere.
  assert.match(readFileSync(join(dir, 'tickets', '_layout.mdx'), 'utf8'), /<ProjectMembers \/>/);
  assert.match(r.stdout, /immediately\.run\/present\/github\/<owner>\/<repo>\/main\/bundle\/tickets\/home\.mdx/);
  const c = await dibber(dir, 'check');
  assert.equal(c.code, 0, c.stdout + c.stderr);
  assert.match(c.stdout, /tickets\/: 1 ticket, no problems/);
  // --no-immediately-run writes none of them (DIB-32).
  const { dir: plain } = repo();
  const p = await dibber(plain, 'init', '--yes', '--prefix', 'APP', '--no-immediately-run');
  assert.equal(p.code, 0, p.stderr);
  for (const name of ['immediately.run.json', 'home.mdx', '_layout.mdx']) assert.ok(!existsSync(join(plain, 'tickets', name)), name);
  assert.doesNotMatch(p.stdout, /immediately\.run\/present/);
  // With no GitHub remote, the home page names no repository it cannot know.
  assert.match(readFileSync(join(dir, 'tickets', 'home.mdx'), 'utf8'), /^Welcome\. This is a \[Dibber\]\(https:\/\/github\.com\/immediately-run\/dibber\) board for this repository\./m);
});

test('init names the GitHub repository on the board home page', async () => {
  for (const url of ['https://github.com/acme/recipes.git', 'git@github.com:acme/recipes.git', 'ssh://git@github.com/acme/recipes']) {
    const { dir, git } = repo();
    git('remote', 'add', 'origin', url);
    const r = await dibber(dir, 'init', '--yes', '--prefix', 'APP', '--store', 'work');
    assert.equal(r.code, 0, r.stderr);
    const home = readFileSync(join(dir, 'work', 'home.mdx'), 'utf8');
    assert.match(home, /board for the \[acme\/recipes\]\(https:\/\/github\.com\/acme\/recipes\) repository\./, url);
    assert.match(home, /edit them \[here on immediately\.run\]\(https:\/\/immediately\.run\/edit\/github\/acme\/recipes\/main\/bundle\/work\/\)/);
    assert.match(home, /one Markdown file per ticket in\n`work\/`/);
    assert.ok(!home.includes('{{'), 'no placeholder is left');
    assert.match(r.stdout, /immediately\.run\/present\/github\/acme\/recipes\/main\/bundle\/work\/home\.mdx/);
  }
  // A remote that is not on GitHub is not a repository the board can link to.
  const { dir, git } = repo();
  git('remote', 'add', 'origin', 'https://gitlab.com/acme/recipes.git');
  await dibber(dir, 'init', '--yes', '--prefix', 'APP');
  assert.match(readFileSync(join(dir, 'tickets', 'home.mdx'), 'utf8'), /board for this repository\./);
});

test('init and new allocate distinct random ids (DIB-26)', async () => {
  const { dir } = repo();
  assert.equal((await dibber(dir, 'init', '--yes', '--prefix', 'tek', '--ids', 'random')).code, 0);
  const before = checkStore(dir).store.tickets.map((t) => t.meta.id);
  assert.equal((await dibber(dir, 'new', '--title', 'Random ticket')).code, 0);
  const { errors, store } = checkStore(dir);
  assert.deepEqual(errors, []);
  assert.equal(store.tickets.length, 2);
  assert.equal(before.length, 1);
  assert.ok(store.tickets.every((t) => /^tek-[a-z0-9]{4,}$/.test(t.meta.id)));
  assert.equal(new Set(store.tickets.map((t) => t.meta.id)).size, 2);
});

test('new uses the coordinator or takes the explicit offline path (DIB-33)', async () => {
  const { dir } = repo();
  await dibber(dir, 'init', '--yes');
  const path = join(dir, '.dibber/config.json');
  const config = JSON.parse(readFileSync(path, 'utf8'));
  const configure = (script) => writeFileSync(path, JSON.stringify({
    ...config, coordinator: { next: [process.execPath, '-e', script, '<prefix>'] },
  }));
  configure('if (process.argv[1] !== "RA") process.exit(1); console.log("reserved"); console.log(40)');
  const remote = await dibber(dir, 'new', '--title', 'Coordinated', '--json');
  assert.equal(JSON.parse(remote.stdout).id, 'RA-40');
  configure('process.exit(1)');
  assert.match((await dibber(dir, 'new', '--title', 'Refused')).stderr, /coordinator failed/);
  assert.match((await dibber(dir, 'new', '--title', 'Local', '--offline')).stdout, /RA-41.*offline/);
  assert.match((await dibber(dir, 'new', '--title', 'Preallocated', '--id', 'RA-50')).stdout, /RA-50/);
  assert.match((await dibber(dir, 'new', '--title', 'Duplicate', '--id', 'RA-50', '--mdx')).stderr, /already taken/);
  assert.match((await dibber(dir, 'new', '--title', 'Wrong prefix', '--id', 'Z-50')).stderr, /invalid reserved id/);
});

test('new and set use the conformance store schema for full tickets (DIB-33)', async () => {
  const { dir, git } = repo();
  cpSync(new URL('../conformance/valid/item-schema/tickets/', import.meta.url), join(dir, 'tickets'), { recursive: true });
  const prefix = checkStore(dir).store.tickets[0].meta.id.split('-')[0];
  const id = `${prefix}-99`;
  const body = join(dir, 'body.md');
  const document = '# Context\n\n## Status\n\nExisting entry.\n\n';
  writeFileSync(body, document);
  const base = ['new', '--title', 'Complete', '--id', id, '--body-file', body, '--field', 'priority=high'];
  assert.equal((await dibber(dir, ...base, '--field', 'repos=[org/repo]')).code, 0);
  const file = join(dir, 'tickets', `${id}.md`);
  const original = readFileSync(file, 'utf8');
  assert.ok(original.endsWith(document));
  assert.ok(original.startsWith('---\npriority: high\n'));
  assert.equal((await dibber(dir, 'set', id, '--field', 'priority=medium')).code, 0);
  const updated = readFileSync(file, 'utf8');
  assert.ok(updated.endsWith(document));
  assert.match(updated, /priority: medium/);
  for (const field of ['id=other', 'bogus=true', 'priority=invalid']) {
    assert.equal((await dibber(dir, 'set', id, '--field', field)).code, 2);
    assert.equal(readFileSync(file, 'utf8'), updated);
  }
  assert.equal((await dibber(dir, 'set', id, 'in-progress', '--field', 'priority=high')).code, 0);
  assert.deepEqual(checkStore(dir).errors, []);
  assert.equal(git('diff', '--cached', '--name-only'), '');
});
