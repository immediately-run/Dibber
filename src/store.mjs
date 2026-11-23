// store.mjs — read a Dibber store from disk: the repository's settings (R-DIB-14), every
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

export const ID_RE = /^[A-Z][A-Z0-9]*-[0-9]+[a-z0-9]*$/;
export const QUALIFIED_RE = /^([a-z0-9][a-z0-9._-]*):([A-Z][A-Z0-9]*-[0-9]+[a-z0-9]*)$/;

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

/** The repository's settings: `.dibber/config.json` when present, else the defaults. */
export function readSettings(root) {
  const path = join(root, '.dibber', 'config.json');
  if (!existsSync(path)) return { path: null, store: 'tickets', prefix: null, raw: null };
  let raw;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    return { path, store: 'tickets', prefix: null, raw: null, error: `not valid JSON: ${e.message}` };
  }
  return {
    path,
    store: typeof raw?.store === 'string' ? raw.store : 'tickets',
    prefix: typeof raw?.prefix === 'string' ? raw.prefix : null,
    raw,
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
    const inStore = rel(storeDir, path);
    const archived = inStore.split('/').includes('archive');
    if (!parts) continue; // a page for people, with no frontmatter
    if (parts.error) {
      result.broken.push({ path, file, error: parts.error });
      continue;
    }
    const { meta } = parts;
    const isTicket = meta.id !== undefined && (meta.kind === undefined || meta.kind === 'ticket');
    const entry = { path, file, archived, meta, body: parts.body, text, ext: extname(path), name: basename(path, extname(path)) };
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
