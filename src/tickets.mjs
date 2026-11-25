// tickets.mjs — write tickets: file a new one, change its status, close it.
// Tickets: [DIB-7](../tickets/DIB-7.md), [DIB-2](../tickets/DIB-2.md), [DIB-24](../tickets/DIB-24.md).
// Every write changes one ticket's own file in place (R-DIB-2, R-DIB-7). Nothing here touches
// git's index: the person or agent doing the work stages and commits the ticket with the work,
// like any other file they changed.

import { randomInt } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { Document, visit } from 'yaml';
import { readStore, splitFrontmatter, rel, LIVE, CLOSED, STATUSES, ID_RE, QUALIFIED_RE, idNumber, asList, byOrderThenId } from './store.mjs';
import { checkStore } from './check.mjs';

export class Refusal extends Error {}

export const today = () => new Date().toISOString().slice(0, 10);

function git(root, ...args) {
  try {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/** Ids already taken on other branches (local and remote-tracking), for R-DIB-4's allocation. */
function idsOnBranches(root, storeRel) {
  const refs = git(root, 'for-each-ref', '--format=%(refname)', 'refs/heads', 'refs/remotes');
  if (!refs) return [];
  const ids = [];
  for (const ref of refs.split('\n').filter(Boolean)) {
    const files = git(root, 'ls-tree', '-r', '--name-only', ref, '--', storeRel);
    if (!files) continue;
    for (const f of files.split('\n')) {
      const id = basename(f).replace(/\.mdx?$/, '');
      if (id !== basename(f) && ID_RE.test(id)) ids.push(id);
    }
  }
  return ids;
}

/** The store's prefix: the settings', else the one its ids share (R-DIB-14). */
export function storePrefix(store) {
  if (store.settings.prefix) return store.settings.prefix;
  const counts = new Map();
  for (const t of store.tickets) {
    const p = String(t.meta.id).split('-')[0];
    counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best) throw new Refusal('the store has no tickets and .dibber/config.json names no prefix; run `dibber init` or add `"prefix"` to .dibber/config.json');
  return best[0];
}

/** Allocate a free numeric or random id across the store and known branches ([DIB-26](../tickets/DIB-26.md)). */
export function nextId(root, store) {
  const prefix = storePrefix(store);
  const taken = new Set([...store.tickets.map((t) => String(t.meta.id)), ...idsOnBranches(root, store.storeRel)]);
  if (store.settings.raw?.ids === 'random') {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id;
    do {
      const suffix = alphabet[randomInt(26)] + Array.from({ length: 11 }, () => alphabet[randomInt(36)]).join('');
      id = `${prefix}-${suffix}`;
    } while (taken.has(id) || existsSync(join(root, store.storeRel, `${id}.md`)) || existsSync(join(root, store.storeRel, `${id}.mdx`)));
    return id;
  }
  const numbers = [...taken]
    .filter((id) => id.split('-')[0] === prefix)
    .map(idNumber)
    .filter(Number.isFinite);
  return `${prefix}-${(numbers.length ? Math.max(...numbers) : 0) + 1}`;
}

function frontmatterYaml(obj) {
  const doc = new Document(obj);
  visit(doc, { Seq(_, node) { node.flow = true; } });
  return doc.toString({ lineWidth: 0, flowCollectionPadding: false });
}

/** File a new ticket. Returns `{ id, file }`. */
export function newTicket(root, opts) {
  const store = readStore(root);
  if (!store.exists) throw new Refusal(`there is no store at \`${store.storeRel}/\`; run \`dibber init\` first`);
  if (!opts.title) throw new Refusal('a ticket needs a title: --title "what to do"');
  const id = nextId(root, store);
  const dependsOn = asList(opts.dependsOn);
  for (const d of dependsOn) {
    if (!ID_RE.test(d) && !QUALIFIED_RE.test(d)) throw new Refusal(`\`${d}\` is not a ticket id`);
    if (ID_RE.test(d) && !store.tickets.some((t) => t.meta.id === d)) throw new Refusal(`\`depends_on\` names \`${d}\`, which is not a ticket in this store`);
  }
  if (opts.parent && !store.tickets.some((t) => t.meta.id === opts.parent)) throw new Refusal(`\`parent\` names \`${opts.parent}\`, which is not a ticket in this store`);
  const meta = { id, title: `${id} — ${opts.title}`, status: 'available' };
  if (opts.description) meta.description = opts.description;
  meta.depends_on = dependsOn;
  if (opts.parent) meta.parent = opts.parent;
  if (opts.order !== undefined) meta.order = Number(opts.order);
  if (opts.tags?.length) meta.tags = asList(opts.tags);
  if (opts.project) meta.project = opts.project;
  if (opts.assignee) meta.assignee = opts.assignee;

  const date = today();
  const brief = opts.brief ? `**Brief:** ${opts.brief}\n` : '';
  const criteria = asList(opts.criteria);
  const body =
    opts.body ??
    [
      `${brief}**Depends on:** ${dependsOn.length ? dependsOn.join(', ') + '.' : 'none.'}`,
      '',
      '### Why',
      '',
      opts.why || '_Why this matters, in a sentence or two._',
      '',
      '### What to build',
      '',
      opts.what || '_What done looks like._',
      '',
      '### Exit criteria',
      '',
      ...(criteria.length ? criteria.map((c) => `- [ ] ${c}`) : ['- [ ] _a check that passes when this is done, such as a test or a command_']),
    ].join('\n');
  const text = `---\n${frontmatterYaml(meta)}---\n\n${body.trimEnd()}\n\n## Status\n\n_filed ${date}._\n`;
  const ext = opts.mdx ? '.mdx' : '.md';
  const path = join(store.storeDir, `${id}${ext}`);
  writeChecked(root, path, text);
  return { id, file: rel(root, path) };
}

/** Find a ticket by id, open or closed. */
export function findTicket(store, id) {
  const t = store.tickets.find((x) => x.meta.id === id);
  if (!t) throw new Refusal(`there is no ticket \`${id}\` in \`${store.storeRel}/\``);
  return t;
}

/** What satisfies a dependency (R-DIB-8): done, or superseded, whose work goes on in the
 *  ticket that replaced it ([DIB-20](../tickets/DIB-20.md)). */
export const SATISFIES_DEPENDENCY = ['done', 'superseded'];

/** Ready: live, available, and every local dependency done or superseded (R-DIB-8). */
export function readiness(store, t) {
  const waits = [];
  for (const d of asList(t.meta.depends_on)) {
    if (QUALIFIED_RE.test(d)) {
      waits.push({ id: d, why: 'in another repository' });
      continue;
    }
    const dep = store.tickets.find((x) => x.meta.id === d);
    if (!dep) waits.push({ id: d, why: 'not found' });
    else if (!SATISFIES_DEPENDENCY.includes(dep.meta.status)) waits.push({ id: d, why: dep.meta.status });
  }
  return { ready: t.meta.status === 'available' && waits.length === 0, waits };
}

function appendStatus(body, line) {
  const trimmed = body.trimEnd();
  if (/^## Status\s*$/m.test(trimmed)) return `${trimmed}\n\n${line}\n`;
  return `${trimmed}\n\n## Status\n\n${line}\n`;
}

/**
 * Write `text` to `path`, then put the file back as it was (or remove a new one) and refuse if
 * the ticket no longer checks. The file is written in place: never moved, never staged.
 */
function writeChecked(root, path, text) {
  const before = existsSync(path) ? readFileSync(path, 'utf8') : null;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  const file = rel(root, path);
  const mine = checkStore(root).errors.filter((e) => e.file === file);
  if (mine.length) {
    if (before === null) rmSync(path, { force: true });
    else writeFileSync(path, before);
    throw new Refusal(`the change would break the ticket:\n${mine.map((e) => `  ${e.rule}: ${e.message}`).join('\n')}`);
  }
}

/**
 * Change a ticket's status, in place (R-DIB-2): closing it changes the status, never the path
 * ([DIB-24](../tickets/DIB-24.md)).
 * A closed ticket is not reopened. Returns `{ id, file, status }`.
 */
export function setStatus(root, id, status, opts = {}) {
  if (!STATUSES.includes(status)) throw new Refusal(`\`${status}\` is not a Dibber status: ${STATUSES.join(', ')}`);
  const store = readStore(root);
  const t = findTicket(store, id);
  if (t.closed) throw new Refusal(`\`${id}\` is closed (\`${t.meta.status}\`); file a new ticket instead of reopening it`);
  const parts = splitFrontmatter(t.text);
  const doc = parts.doc;
  doc.set('status', status);
  if (opts.assignee !== undefined) doc.set('assignee', opts.assignee);
  if (opts.pr) {
    const prs = asList(doc.toJS().prs);
    if (!prs.includes(opts.pr)) prs.push(opts.pr);
    const node = doc.createNode(prs);
    node.flow = true;
    doc.set('prs', node);
  }
  if (CLOSED.includes(status) || opts.touch) doc.set('updated', today());
  const what = opts.note ?? (status === 'done' ? 'done' : `${status}${opts.assignee ? ` (${opts.assignee})` : ''}`);
  const line = `_${today()}: ${what.replace(/\.$/, '')}${opts.pr ? `, ${opts.pr}` : ''}._`;
  const yaml = doc.toString({ lineWidth: 0, flowCollectionPadding: false });
  const text = `---\n${yaml}---\n${appendStatus(parts.body, line)}`;
  writeChecked(root, t.path, text);
  return { id, file: t.file, status };
}

/** Claim: available → in-progress, with an advisory assignee. Refuses a ticket that is not ready. */
export function claim(root, id, opts = {}) {
  const store = readStore(root);
  const t = findTicket(store, id);
  const { ready, waits } = readiness(store, t);
  if (!ready && !opts.force) {
    if (t.meta.status !== 'available') throw new Refusal(`\`${id}\` is \`${t.meta.status}\`, not available`);
    throw new Refusal(`\`${id}\` waits on ${waits.map((w) => `${w.id} (${w.why})`).join(', ')}; pass --force to claim it anyway`);
  }
  const who = opts.as || git(root, 'config', 'user.name') || process.env.USER || 'me';
  return setStatus(root, id, 'in-progress', { assignee: who, note: `claimed by ${who}` });
}

/** The overview: every ticket with its readiness, in reading order. */
export function listTickets(root, filter = {}) {
  const store = readStore(root);
  const rows = store.tickets
    .filter((t) => (filter.closed ? true : !t.closed))
    .sort(byOrderThenId)
    .map((t) => {
      const { ready, waits } = readiness(store, t);
      return {
        id: t.meta.id,
        title: String(t.meta.title ?? ''),
        status: t.meta.status,
        ready,
        waits,
        assignee: t.meta.assignee ?? null,
        parent: t.meta.parent ?? null,
        project: t.meta.project ?? null,
        tags: asList(t.meta.tags),
        order: t.meta.order ?? null,
        file: t.file,
        closed: t.closed,
      };
    });
  return rows.filter((r) => (!filter.ready || r.ready) && (!filter.status || r.status === filter.status));
}

export { LIVE, CLOSED, STATUSES };
