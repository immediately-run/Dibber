// check.mjs — judge a store against Dibber 1: every rule that can be checked from the files.
// Each problem names the rule it breaks (R-DIB-n), the file, and what to do, in plain words.
//
// Errors break a rule. Warnings are conventions (R-DIB-10, R-DIB-11) a store may not follow
// yet; they never fail a check.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { readStore, rel, LIVE, CLOSED, CLOSED_WITHDRAWN, STATUSES, ID_RE, QUALIFIED_RE, asList } from './store.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TICKET_SCHEMA = JSON.parse(readFileSync(join(HERE, '..', 'ticket.schema.json'), 'utf8'));
const CONFIG_SCHEMA = JSON.parse(readFileSync(join(HERE, '..', 'config.schema.json'), 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
const validateTicket = ajv.compile(TICKET_SCHEMA);
const validateConfig = ajv.compile(CONFIG_SCHEMA);

function describeSchemaError(e) {
  const key = e.instancePath.replace(/^\//, '').replace(/\//g, '.') || null;
  if (e.keyword === 'required') return `the required key \`${e.params.missingProperty}\` is missing`;
  if (e.keyword === 'enum') return `\`${key}\` must be one of: ${e.params.allowedValues.join(', ')}`;
  return key ? `\`${key}\` ${e.message}` : e.message;
}

/**
 * Check the store in the repository at `root`.
 * @returns {{ store, errors: Problem[], warnings: Problem[] }} where Problem is
 *   `{ rule, file, message }`.
 */
export function checkStore(root) {
  const errors = [];
  const warnings = [];
  const err = (rule, file, message) => errors.push({ rule, file, message });
  const warn = (rule, file, message) => warnings.push({ rule, file, message });

  const store = readStore(root);
  const { settings } = store;

  // R-DIB-14: the settings file.
  if (settings.path) {
    const file = rel(root, settings.path);
    if (settings.error) err('R-DIB-14', file, settings.error);
    else if (!validateConfig(settings.raw)) {
      for (const e of validateConfig.errors) err('R-DIB-14', file, describeSchemaError(e));
    }
  }
  if (!store.exists) {
    err('R-DIB-14', settings.path ? rel(root, settings.path) : settings.store, `the store folder \`${settings.store}/\` does not exist`);
    return { store, errors, warnings };
  }

  // R-DIB-3: the store's own schema, if it carries one.
  let validateItem = null;
  const itemSchemaPath = join(store.storeDir, 'item.schema.json');
  if (existsSync(itemSchemaPath)) {
    try {
      validateItem = ajv.compile(JSON.parse(readFileSync(itemSchemaPath, 'utf8')));
    } catch (e) {
      err('R-DIB-3', rel(root, itemSchemaPath), `the store's item.schema.json does not load: ${e.message}`);
    }
  }

  for (const b of store.broken) err('R-DIB-5', b.file, `the frontmatter is not valid YAML (${b.error})`);

  // Per ticket.
  const prefixOK = settings.prefix && !settings.error && validateConfig(settings.raw ?? {});
  for (const t of store.tickets) {
    const { meta, file } = t;
    const id = meta.id;
    if (typeof id !== 'string' || !ID_RE.test(id)) {
      err('R-DIB-4', file, `the id \`${id}\` is not <PREFIX>-<n> (upper-case prefix, a dash, a number)`);
      continue;
    }
    if (t.name !== id) err('R-DIB-1', file, `the file is named \`${t.name}${t.ext}\` but its id is \`${id}\`; name it \`${id}${t.ext}\``);
    if (prefixOK && id.split('-')[0] !== settings.prefix) {
      err('R-DIB-14', file, `the id \`${id}\` does not use the prefix \`${settings.prefix}\` that .dibber/config.json names`);
    }
    if (!validateTicket(meta)) {
      for (const e of validateTicket.errors) {
        const rule = e.instancePath === '/status' ? 'R-DIB-6' : 'R-DIB-5';
        err(rule, file, describeSchemaError(e));
      }
    }
    if (validateItem && !validateItem(meta)) {
      for (const e of validateItem.errors) err('R-DIB-3', file, `the store's item.schema.json: ${describeSchemaError(e)}`);
    }
    const status = meta.status;
    if (STATUSES.includes(status)) {
      if (status === 'done' && !t.archived) err('R-DIB-6', file, '`done` is legal only in archive/; move the file there (`dibber done` does)');
      else if (CLOSED_WITHDRAWN.includes(status) && !t.archived) err('R-DIB-2', file, `\`${status}\` closes the ticket, so it belongs in archive/`);
      else if (LIVE.includes(status) && t.archived) err('R-DIB-2', file, `\`${status}\` is a live status, but the file is in archive/`);
    }
  }

  // Store-wide: ids unique (R-DIB-4), relations resolve and form no cycle (R-DIB-8).
  const byId = new Map();
  for (const t of store.tickets) {
    const id = t.meta.id;
    if (typeof id !== 'string') continue;
    const prev = byId.get(id);
    if (!prev) {
      byId.set(id, t);
      continue;
    }
    // Report the live copy when one of the two is archived, else the later path.
    const [keep, report] = prev.archived && !t.archived ? [prev, t] : !prev.archived && t.archived ? [t, prev] : [prev, t];
    const where = keep.archived ? 'in the archive' : `in ${keep.file}`;
    err('R-DIB-4', report.file, `the id \`${id}\` is already taken ${where}; an id is never reused`);
    byId.set(id, keep);
  }

  for (const t of store.tickets) {
    const deps = asList(t.meta.depends_on);
    for (const d of deps) {
      if (QUALIFIED_RE.test(d)) continue; // another repository's ticket: the reader's configuration resolves it
      if (!byId.has(d)) err('R-DIB-8', t.file, `\`depends_on\` names \`${d}\`, which is not a ticket in this store or its archive`);
    }
    const parent = t.meta.parent;
    if (typeof parent === 'string' && ID_RE.test(parent) && !byId.has(parent)) {
      err('R-DIB-8', t.file, `\`parent\` names \`${parent}\`, which is not a ticket in this store or its archive`);
    }
  }

  // Cycles over local depends_on edges; reported once, on the cycle's first file in path order.
  const state = new Map();
  const reported = new Set();
  const visit = (id, stack) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') {
      const cycle = stack.slice(stack.indexOf(id));
      const key = [...cycle].sort().join(',');
      if (!reported.has(key)) {
        reported.add(key);
        const files = cycle.map((c) => byId.get(c)).filter(Boolean).sort((a, b) => a.file.localeCompare(b.file));
        err('R-DIB-8', files[0].file, `dependencies form a cycle: ${[...cycle, id].join(' → ')}`);
      }
      return;
    }
    state.set(id, 'open');
    for (const d of asList(byId.get(id)?.meta.depends_on)) if (byId.has(d)) visit(d, [...stack, id]);
    state.set(id, 'done');
  };
  for (const id of [...byId.keys()].sort()) visit(id, []);

  // Conventions: warnings only.
  const projects = new Set(store.pages.filter((p) => p.meta.kind === 'project').map((p) => String(p.meta.id)));
  for (const t of store.tickets) {
    const project = t.meta.project;
    if (typeof project === 'string' && !projects.has(project)) {
      warn('R-DIB-10', t.file, `\`project\` names \`${project}\`, but no page in the store has \`kind: project\` and that id`);
    }
    const m = /^\*\*Depends on:\*\*\s*(.*)$/m.exec(t.body);
    if (m) {
      const deps = asList(t.meta.depends_on);
      const want = deps.length ? `${deps.join(', ')}.` : 'none.';
      const got = m[1].trim();
      const plainIds = got.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`/g, '');
      if (plainIds !== want) warn('R-DIB-11', t.file, `the **Depends on:** line says "${got}" but depends_on is ${deps.length ? `[${deps.join(', ')}]` : 'empty'}`);
    }
  }

  return { store, errors, warnings };
}

export { STATUSES, CLOSED };
