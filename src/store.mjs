// store.mjs — read a Dibber store from disk ([DIB-1](../tickets/DIB-1.md), [DIB-24](../tickets/DIB-24.md), [DIB-31](../tickets/DIB-31.md)): the repository's settings (R-DIB-14), every
// ticket file under the store (R-DIB-1) and the pages beside them. No rule is judged here
// beyond what reading needs; check.mjs judges.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep, extname, basename } from 'node:path';
import { parseDocument } from 'yaml';

/** The statuses of R-DIB-6, by class. */
export const LIVE = ['available', 'in-progress', 'in-review', 'deprioritized'];
export const CLOSED_DONE = ['done'];
export const CLOSED_WITHDRAWN = ['withdrawn', 'superseded', 'deferred'];
export const CLOSED = [...CLOSED_DONE, ...CLOSED_WITHDRAWN];
export const STATUSES = [...LIVE, ...CLOSED];

/** A numeric id, `<PREFIX>-<n>` (R-DIB-4), with an older split suffix (`R3-51a`) accepted. */
export const ID_RE = /^[A-Z][A-Z0-9]*-[0-9]+[a-z0-9]*$/;
/** An orchestrator-assigned id (R-DIB-4): whatever the orchestrator gives, as long as it can
 *  name the ticket's file and stand in a qualified id — no `/`, `:` or whitespace. */
export const FILE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
/** `<repository>:<id>`. The local half is the file-safe form: the other repository's ids may be
 *  its orchestrator's. */
export const QUALIFIED_RE = /^([a-z0-9][a-z0-9._-]*):([A-Za-z0-9][A-Za-z0-9._-]*)$/;

/** The values of `ids` in `.dibber/config.json` (R-DIB-14): who makes a new ticket's id. */
export const ID_MODES = ['numeric', 'orchestrator'];

/** The orchestrator `ids: orchestrator` means. Baton is the only one that works with Dibber. */
export const ORCHESTRATOR = {
  name: 'Baton',
  settings: '.baton/baton.json',
  command: 'baton',
};

/** The id form the store's `ids` setting accepts (R-DIB-4). */
export const idPattern = (settings) => (settings.ids === 'orchestrator' ? FILE_ID_RE : ID_RE);

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(\r?\n|$)/;

/** Posix-style relative path, so messages and fixtures read the same on every OS. */
export const rel = (root, p) => relative(root, p).split(sep).join('/');

/**
 * Split a Markdown file into frontmatter and body. Returns `null` when the file has no
 * frontmatter block; `{ error }` when the block is not valid YAML.
 */
export function splitFrontmatter(text) {
  const m = FRONTMATTER_RE.exec(text);
  if (!m) return null;
  const doc = parseDocument(m[1], { prettyErrors: false });
  if (doc.errors.length) return { error: doc.errors[0].message.split('\n')[0], raw: m[1], body: text.slice(m[0].length) };
  const meta = doc.toJS() ?? {};
  if (typeof meta !== 'object' || Array.isArray(meta)) return { error: 'frontmatter is not a mapping', raw: m[1], body: text.slice(m[0].length) };
  return { meta, doc, raw: m[1], body: text.slice(m[0].length) };
}

/**
 * The orchestrator's own settings, `.baton/baton.json`, when the repository has them: the
 * store's folder (`items`) and the prefix it allocates under (`ticket_prefix`). `null` when the
 * file is absent; `{ error }` when it is there but unreadable, which still marks the repository
 * as orchestrated.
 */
export function readOrchestrator(root) {
  const path = join(root, ...ORCHESTRATOR.settings.split('/'));
  if (!existsSync(path)) return null;
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8'));
    return {
      path,
      store: typeof raw?.items === 'string' ? raw.items.replace(/\/$/, '') : null,
      prefix: typeof raw?.ticket_prefix === 'string' ? raw.ticket_prefix : null,
    };
  } catch (e) {
    return { path, store: null, prefix: null, error: `not valid JSON: ${e.message}` };
  }
}

/**
 * The repository's settings (R-DIB-14): `.dibber/config.json` when present, then the
 * orchestrator's settings for what it leaves out, then the defaults. `ids` is `orchestrator`
 * where `.baton/baton.json` is present and `.dibber/config.json` says nothing else, else
 * `numeric`.
 */
export function readSettings(root) {
  const orchestrator = readOrchestrator(root);
  const path = join(root, '.dibber', 'config.json');
  const fallback = {
    store: orchestrator?.store ?? 'tickets',
    prefix: orchestrator?.prefix ?? null,
    ids: orchestrator ? 'orchestrator' : 'numeric',
  };
  if (!existsSync(path)) return { path: null, ...fallback, idsSet: false, raw: null, orchestrator };
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    return { path, ...fallback, idsSet: false, raw: null, orchestrator, error: `not valid JSON: ${e.message}` };
  }
  const idsSet = ID_MODES.includes(raw?.ids);
  return {
    path,
    store: typeof raw?.store === 'string' ? raw.store : fallback.store,
    prefix: typeof raw?.prefix === 'string' ? raw.prefix : fallback.prefix,
    ids: idsSet ? raw.ids : fallback.ids,
    idsSet,
    raw,
    orchestrator,
  };
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (['.md', '.mdx'].includes(extname(name))) out.push(p);
  }
  return out;
}

/**
 * Read every Markdown file under the store. A file is a ticket when its frontmatter carries an
 * `id` and no `kind` other than `ticket` (R-DIB-1); a file whose frontmatter does not parse is
 * reported as `broken`, since it cannot be told apart.
 */
export function readStore(root) {
  const settings = readSettings(root);
  const storeDir = join(root, settings.store);
  const result = { root, settings, storeDir, storeRel: settings.store, exists: existsSync(storeDir), tickets: [], pages: [], broken: [] };
  if (!result.exists) return result;
  for (const path of walk(storeDir)) {
    const text = readFileSync(path, 'utf8');
    const parts = splitFrontmatter(text);
    const file = rel(root, path);
    if (!parts) continue; // a page for people, with no frontmatter
    if (parts.error) {
      result.broken.push({ path, file, error: parts.error });
      continue;
    }
    const { meta } = parts;
    const isTicket = meta.id !== undefined && (meta.kind === undefined || meta.kind === 'ticket');
    const closed = CLOSED.includes(meta.status); // closure is the status alone (R-DIB-2)
    const entry = { path, file, closed, meta, body: parts.body, text, ext: extname(path), name: basename(path, extname(path)) };
    (isTicket ? result.tickets : result.pages).push(entry);
  }
  return result;
}

/** Numeric part of an id, for ordering (`X-10` after `X-9`). */
export function idNumber(id) {
  const m = /-(\d+)/.exec(String(id));
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

export function byOrderThenId(a, b) {
  const oa = Number.isFinite(Number(a.meta.order)) && a.meta.order !== undefined ? Number(a.meta.order) : Infinity;
  const ob = Number.isFinite(Number(b.meta.order)) && b.meta.order !== undefined ? Number(b.meta.order) : Infinity;
  if (oa !== ob) return oa - ob;
  return idNumber(a.meta.id) - idNumber(b.meta.id) || String(a.meta.id).localeCompare(String(b.meta.id));
}

export const asList = (v) => (Array.isArray(v) ? v.map(String) : []);
