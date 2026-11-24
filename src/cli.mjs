// cli.mjs — the `dibber` command ([DIB-7](../tickets/DIB-7.md)). Optional: the format needs no tool (SPEC.md), and every
// command here does what a person could do by editing files. `--json` on every command, for
// agents.

import { createInterface } from 'node:readline/promises';
import { resolve } from 'node:path';
import { checkStore } from './check.mjs';
import { Refusal, newTicket, setStatus, claim, listTickets, STATUSES } from './tickets.mjs';
import { init, defaultPrefix } from './init.mjs';

const HELP = `dibber — Git as your issue tracker: an open format built on Markdown (https://github.com/immediately-run/dibber)

Usage: dibber <command> [options]        (every command takes --json and --root <dir>)

  init [--prefix P] [--store DIR] [--yes] [--no-agents] [--update-skills] [--link-skills]
      [--no-immediately-run]       set this repository up: .dibber/config.json, the store,
                                   a first ticket, AGENTS.md, the agent skills, and the files
                                   that open the store as a board on immediately.run;
                                   --link-skills links .claude/skills/ to .agents/skills/
                                   instead of copying; --no-immediately-run leaves the board
                                   files out
  check [--strict]                 check the store against the Dibber spec; --strict fails
                                   on warnings too
  list [--ready] [--status S] [--all]
                                   the overview: what is ready, in progress and waiting
  new --title "…" [--why "…"] [--what "…"] [--criterion "…"]… [--depends-on ID,…]
      [--parent ID] [--tags a,b] [--project P] [--order N] [--brief "…"] [--mdx]
                                   file a ticket with the next free id
  claim <id> [--as NAME] [--force] available → in-progress, with you as assignee
  set <id> <status> [--pr URL] [--note "…"]
                                   change a status; the file stays where it is
  done <id> [--pr URL] [--note "…"]
                                   close a ticket as done; the file stays where it is

Statuses: ${STATUSES.join(', ')}.
Dibber alone fits one person driving a coding agent on their own machine. Several runners,
several people or several LLM providers at once: add a coordinator such as Baton
(https://github.com/immediately-run/baton). Claims here are advisory, not locks.
`;

const FLAGS_WITH_VALUES = new Set(['prefix', 'store', 'status', 'title', 'why', 'what', 'criterion', 'depends-on', 'parent', 'tags', 'project', 'order', 'brief', 'as', 'pr', 'note', 'root', 'description', 'assignee']);
const REPEATABLE = new Set(['criterion']);

export function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h') { flags.help = true; continue; }
    if (!a.startsWith('--')) { positional.push(a); continue; }
    let [name, value] = a.slice(2).split(/=(.*)/s, 2);
    if (FLAGS_WITH_VALUES.has(name)) {
      if (value === undefined) {
        if (i + 1 >= argv.length) throw new Refusal(`--${name} needs a value`);
        value = argv[++i];
      }
      if (REPEATABLE.has(name)) (flags[name] ??= []).push(value);
      else flags[name] = value;
    } else flags[name] = true;
  }
  return { flags, positional };
}

const csv = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);

function printProblems(out, list, mark) {
  for (const p of list) out.push(`${mark} ${p.file}: ${p.rule} — ${p.message}`);
}

function formatList(rows) {
  if (!rows.length) return 'No tickets. File one: dibber new --title "…"';
  const groups = [
    ['Ready to start', (r) => r.ready],
    ['In progress', (r) => r.status === 'in-progress'],
    ['In review', (r) => r.status === 'in-review'],
    ['Waiting', (r) => r.status === 'available' && !r.ready],
    ['Parked', (r) => r.status === 'deprioritized'],
    ['Closed', (r) => r.closed],
  ];
  const out = [];
  for (const [label, pick] of groups) {
    const g = rows.filter(pick);
    if (!g.length) continue;
    out.push(`${label} (${g.length})`);
    for (const r of g) {
      const extra = [];
      if (r.assignee) extra.push(`@${r.assignee}`);
      if (label === 'Waiting') extra.push(`waits on ${r.waits.map((w) => `${w.id} (${w.why})`).join(', ')}`);
      if (label === 'Closed') extra.push(r.status);
      out.push(`  ${r.title}${extra.length ? `  — ${extra.join('; ')}` : ''}`);
    }
    out.push('');
  }
  return out.join('\n').trimEnd();
}

async function ask(question, fallback) {
  if (!process.stdin.isTTY) return fallback;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const a = (await rl.question(`${question} [${fallback}] `)).trim();
    return a || fallback;
  } finally {
    rl.close();
  }
}

/** Run the CLI. Returns `{ code, stdout, stderr }` so tests can drive it in-process. */
export async function run(argv, { cwd = process.cwd(), interactive = true } = {}) {
  const stdout = [];
  const stderr = [];
  let code = 0;
  try {
    const { flags, positional } = parseArgs(argv);
    const [cmd, ...rest] = positional;
    const root = resolve(cwd, flags.root ?? '.');
    const json = (v) => stdout.push(JSON.stringify(v, null, 2));
    if (!cmd || flags.help || cmd === 'help') {
      stdout.push(HELP);
    } else if (cmd === 'check') {
      const { errors, warnings, store } = checkStore(root);
      if (flags.json) json({ ok: errors.length === 0 && !(flags.strict && warnings.length), store: store.storeRel, tickets: store.tickets.length, errors, warnings });
      else {
        printProblems(stdout, errors, '✗');
        printProblems(stdout, warnings, '!');
        const n = `${store.tickets.length} ticket${store.tickets.length === 1 ? '' : 's'}`;
        stdout.push(errors.length ? `${errors.length} problem${errors.length === 1 ? '' : 's'} in ${store.storeRel}/ (${n}).` : `✓ ${store.storeRel}/: ${n}, no problems${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? '' : 's'})` : ''}.`);
      }
      code = errors.length || (flags.strict && warnings.length) ? 1 : 0;
    } else if (cmd === 'list') {
      const rows = listTickets(root, { ready: flags.ready, status: flags.status, closed: flags.all });
      if (flags.json) json(rows);
      else stdout.push(formatList(rows));
    } else if (cmd === 'new') {
      const r = newTicket(root, {
        title: flags.title, why: flags.why, what: flags.what, criteria: flags.criterion ?? [],
        dependsOn: csv(flags['depends-on']), parent: flags.parent, tags: csv(flags.tags), project: flags.project,
        order: flags.order, brief: flags.brief, description: flags.description, assignee: flags.assignee, mdx: flags.mdx,
      });
      if (flags.json) json(r);
      else stdout.push(`filed ${r.id}: ${r.file}`);
    } else if (cmd === 'claim') {
      if (!rest[0]) throw new Refusal('which ticket? dibber claim <id>');
      const r = claim(root, rest[0], { as: flags.as, force: flags.force });
      if (flags.json) json(r);
      else stdout.push(`${r.id} is in progress (advisory: a claim here is not a lock)`);
    } else if (cmd === 'set' || cmd === 'done') {
      const id = rest[0];
      const status = cmd === 'done' ? 'done' : rest[1];
      if (!id || !status) throw new Refusal(cmd === 'done' ? 'which ticket? dibber done <id>' : 'dibber set <id> <status>');
      const r = setStatus(root, id, status, { pr: flags.pr, note: flags.note });
      if (flags.json) json(r);
      else stdout.push(`${r.id} is ${r.status}: ${r.file}`);
    } else if (cmd === 'init') {
      let prefix = flags.prefix;
      if (!prefix && !flags.yes && interactive) prefix = (await ask('Ticket id prefix (e.g. APP for APP-1)?', defaultPrefix(root))).toUpperCase();
      const r = init(root, { prefix, store: flags.store, agents: !flags['no-agents'], updateSkills: flags['update-skills'], linkSkills: flags['link-skills'], immediatelyRun: !flags['no-immediately-run'] });
      if (flags.json) json(r);
      else {
        for (const f of r.created) stdout.push(`  created ${f}`);
        for (const f of r.updated) stdout.push(`  updated ${f}`);
        for (const f of r.repaired) stdout.push(`  repaired ${f} (it was broken; written again)`);
        for (const f of r.skipped) stdout.push(`  kept    ${f} (already there)`);
        stdout.push(`\nDibber is set up: tickets in ${r.store}/, ids ${r.prefix}-1, ${r.prefix}-2, …\nNext: ask your agent "what's on the board?", or run: dibber list`);
        if (r.created.includes(`${r.store}/immediately.run.json`)) {
          stdout.push(`Once pushed to a public GitHub repository, the board opens at https://immediately.run/present/github/${r.repo ?? '<owner>/<repo>'}/main/bundle/${r.store}/home.mdx`);
        }
      }
    } else {
      throw new Refusal(`unknown command \`${cmd}\`; dibber --help lists them`);
    }
  } catch (e) {
    if (!(e instanceof Refusal) && !(e instanceof Error && /prefix/.test(e.message))) throw e;
    stderr.push(`dibber: ${e.message}`);
    code = 2;
  }
  return { code, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
}
