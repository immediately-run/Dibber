// Import tracker exports into a Dibber store ([DIB-16](../tickets/DIB-16.md)).
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { parse } from 'csv-parse/sync';
import { checkStore } from './check.mjs';
import { rel } from './store.mjs';
import { allocateTicketId, frontmatterYaml, Refusal, today } from './tickets.mjs';

const asArray = (value) => Array.isArray(value) ? value : value?.nodes ?? [];
const present = (values) => values.filter((value) => value !== undefined && value !== null && value !== '');
const csvValues = (value) => present(Array.isArray(value) ? value : [value]);
const list = (value) => csvValues(value).flatMap((entry) => entry.split(/[,;]\s*/)).map((entry) => entry.trim()).filter(Boolean);
const ref = (value) => value && (typeof value === 'object'
  ? ref(value.issue ?? value.relatedIssue ?? value.number ?? value.identifier ?? value.key ?? value.id) : String(value));
const label = (value) => typeof value === 'string' ? value : value?.name ?? value?.title;
const person = (value) => typeof value === 'string' ? value : value?.login ?? value?.name ?? value?.displayName;
const quote = (value) => String(value).replace(/\r\n?/g, '\n').split('\n').map((line) => `> ${line}`).join('\n');

function statusFor(status, closed = false) {
  const word = String(status ?? '').trim().toLowerCase().replace(/[-_]/g, ' ');
  if (['duplicate', 'superseded'].includes(word)) return 'superseded';
  if (['canceled', 'cancelled', 'withdrawn', 'not planned', "won't do"].includes(word)) return 'withdrawn';
  if (closed || ['done', 'completed', 'closed', 'resolved'].includes(word)) return 'done';
  if (['in progress', 'started', 'doing'].includes(word)) return 'in-progress';
  if (['in review', 'review'].includes(word)) return 'in-review';
  return 'available';
}

function github(row) {
  return {
    key: ref(row.number), aliases: present([ref(row.id), row.url, row.html_url]),
    title: row.title, body: row.body, url: row.html_url ?? row.url,
    status: statusFor(row.stateReason ?? row.state_reason, row.closed || row.state?.toLowerCase() === 'closed'),
    tags: asArray(row.labels).map(label), project: label(row.milestone ?? asArray(row.projectItems)[0]),
    assignee: person(row.assignee ?? asArray(row.assignees)[0]),
    parent: ref(row.parent), children: asArray(row.subIssues).map(ref),
    waits: asArray(row.blockedBy ?? row.blocked_by).map(ref), comments: asArray(row.comments),
  };
}

function linear(row) {
  const state = row.state ?? row.Status;
  return {
    key: ref(row.identifier ?? row.ID ?? row.id), aliases: present([ref(row.id)]),
    title: row.title ?? row.Title, body: row.description ?? row.Description, url: row.url ?? row.URL,
    status: statusFor(row.canceledAt || row.Canceled ? 'canceled' : state?.name ?? state,
      Boolean(row.completedAt || row.Completed || state?.type === 'completed')),
    tags: row.Labels ? list(row.Labels) : asArray(row.labels).map(label),
    project: label(row.project ?? row.Project ?? row['Project Milestone']),
    assignee: person(row.assignee ?? row.Assignee),
    parent: ref(row.parent ?? row['Parent issue']),
    children: asArray(row.children).map(ref),
    waits: [...asArray(row.blockedBy).map(ref), ...list(row['Blocked by'])],
    comments: asArray(row.comments),
  };
}

function jira(row) {
  return {
    key: ref(row['Issue key']), aliases: present([ref(row['Issue id'])]),
    title: row.Summary, body: row.Description, url: row.URL ?? row['Issue URL'],
    status: statusFor(row.Resolution || row.Status, /^done$|^resolved$|^closed$/i.test(row.Status ?? '')),
    tags: list(row.Labels), project: row['Project name'] || row['Project key'],
    assignee: row.Assignee,
    parent: ref(row['Parent key'] || row.Parent || row['Epic Link']),
    waits: Object.entries(row)
      .filter(([name]) => /^(?:inward issue link \(blocks\)|blocked by)$/i.test(name))
      .flatMap(([, value]) => list(value)),
    comments: csvValues(row.Comment).map((comment) => {
      const [createdAt, author, ...body] = comment.split(';');
      return body.length ? { createdAt, author, body: body.join(';') } : { body: comment };
    }),
  };
}

const adapters = { github, linear, jira };

function readExport(source, path) {
  try {
    const data = readFileSync(path, 'utf8');
    if (source === 'jira' || (source === 'linear' && extname(path).toLowerCase() === '.csv')) {
      return parse(data, { bom: true, columns: true, group_columns_by_name: true, skip_empty_lines: true });
    }
    const value = JSON.parse(data);
    const issues = value?.data?.issues ?? value?.issues ?? value;
    const rows = Array.isArray(issues) ? issues : issues?.nodes;
    if (!Array.isArray(rows)) throw new Error('expected an issue list');
    return rows.filter((row) => source !== 'github' || !row?.pull_request);
  } catch (error) {
    throw new Refusal(`cannot read ${source} export: ${error.message}`);
  }
}

function originalUrl(source, issue, sourceUrl) {
  const key = encodeURIComponent(issue.key);
  const url = issue.url || (sourceUrl && ({
    github: `${sourceUrl}/issues/${key}`,
    linear: `${sourceUrl}/issue/${key}`,
    jira: `${sourceUrl}/browse/${key}`,
  })[source]);
  if (!url) throw new Refusal(`${issue.key} has no URL in the export; pass --source-url`);
  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
    return parsed.href;
  } catch {
    throw new Refusal(`${issue.key} has an invalid source URL`);
  }
}

function render(issue, meta, source, url) {
  const comments = issue.comments.map((comment) => {
    const rawDate = comment.createdAt ?? comment.created_at ?? '';
    const date = /^\d{4}-\d{2}-\d{2}/.exec(rawDate)?.[0] ?? (rawDate || 'date unavailable');
    const author = person(comment.author ?? comment.user);
    return quote(`${date}${author ? ` · ${author}` : ''}\n\n${comment.body ?? ''}`);
  });
  return [
    `---\n${frontmatterYaml(meta)}---`,
    `**Imported from:** ${source} ${issue.key} — <${url}>`,
    `**Depends on:** ${meta.depends_on.length ? meta.depends_on.join(', ') + '.' : 'none.'}`,
    ...(issue.body ? [`### Original description\n\n${quote(issue.body)}`] : []),
    '## Status',
    `_Imported ${today()}._`,
    ...comments,
  ].join('\n\n') + '\n';
}

export function importTickets(root, source, path, sourceUrl) {
  if (!Object.hasOwn(adapters, source)) throw new Refusal('import source must be github, linear, or jira');
  const rows = readExport(source, path);
  if (rows.some((row) => row === null || typeof row !== 'object' || Array.isArray(row))) {
    throw new Refusal(`${source} export contains a malformed issue`);
  }
  const issues = rows.map(adapters[source]);
  const { store, errors } = checkStore(root);
  if (errors.length) throw new Refusal('fix the existing store with dibber check before importing');
  const imported = new Set(store.tickets.flatMap(({ body }) =>
    [...body.matchAll(/^\*\*Imported from:\*\* [^\n]* — <([^>\n]+)>$/gm)].map((match) => match[1])));
  const refs = new Map();
  for (const issue of issues) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(issue.key ?? '') || typeof issue.title !== 'string' || !issue.title.trim()) {
      throw new Refusal(`${source} export contains an issue without a key or title`);
    }
    for (const key of new Set([issue.key, ...issue.aliases])) {
      if (refs.has(key)) throw new Refusal(`the export repeats issue key ${key}`);
      refs.set(key, issue);
    }
    issue.originalUrl = originalUrl(source, issue, sourceUrl?.replace(/\/+$/, ''));
    if (imported.has(issue.originalUrl)) throw new Refusal(`${issue.key} was already imported`);
    imported.add(issue.originalUrl);
  }
  const resolveRef = (key, issue) => {
    const target = refs.get(key);
    if (!target) throw new Refusal(`${issue.key} references ${key}, which is missing from the export`);
    return target;
  };
  for (const issue of issues) {
    for (const key of issue.children ?? []) {
      const child = resolveRef(key, issue);
      if (child.parent && resolveRef(child.parent, child) !== issue) {
        throw new Refusal(`${child.key} has conflicting parents`);
      }
      child.parent = issue.key;
    }
  }
  for (const issue of issues) {
    issue.dependencies = present(issue.waits).map((key) => resolveRef(key, issue));
    if (issue.parent) issue.parentIssue = resolveRef(issue.parent, issue);
  }
  const staged = { ...store, tickets: [...store.tickets] };
  for (const issue of issues) {
    issue.id = allocateTicketId(root, staged);
    staged.tickets.push({ meta: { id: issue.id } });
  }
  const written = [];
  try {
    for (const issue of issues) {
      const meta = {
        id: issue.id, title: `${issue.id} — ${issue.title.trim()}`, status: issue.status,
        depends_on: [...new Set(issue.dependencies.map((dep) => dep.id))],
        ...(issue.parentIssue && { parent: issue.parentIssue.id }),
        ...(issue.tags.some(Boolean) && { tags: [...new Set(issue.tags.filter(Boolean))] }),
        ...(issue.project && { project: issue.project }),
        ...(issue.assignee && { assignee: issue.assignee }),
      };
      const filename = join(store.storeDir, `${issue.id}.md`);
      writeFileSync(filename, render(issue, meta, source, issue.originalUrl), { flag: 'wx' });
      written.push({ id: issue.id, original: issue.key, file: rel(root, filename), filename });
    }
    const checked = checkStore(root);
    if (checked.errors.length) {
      throw new Refusal(checked.errors.map((error) => `${error.file}: ${error.message}`).join('\n'));
    }
  } catch (error) {
    for (const { filename } of written) unlinkSync(filename);
    throw new Refusal(`import failed: ${error.message}`);
  }
  return written.map(({ filename, ...entry }) => entry);
}
