// init.mjs — set a repository up for Dibber in one command (DIB-8): the settings, the store,
// its archive, a first ticket, and the agent instructions and skills every supported harness
// discovers. It never overwrites a file; it says what it skipped.

import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, appendFileSync, statSync, symlinkSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { today } from './tickets.mjs';
import { readStore } from './store.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = join(HERE, '..');
export const SKILLS_DIR = join(PACKAGE_ROOT, 'skills');
const TEMPLATES = join(PACKAGE_ROOT, 'templates');

/**
 * Where each agent harness discovers a repository's skills: `.agents/skills/` is read by
 * Codex, opencode and Antigravity, `.claude/skills/` by Claude Code. Both get real copies by
 * default. Users never edit the skills, and a copy works in every checkout, where a symlink
 * becomes a text file on Windows without git's symlink support and the skills silently
 * vanish. `linkSkills` makes each `.claude/skills/<name>` a symlink to `.agents/skills/<name>`
 * for those who want one copy.
 */
export const SKILL_HOME = '.agents/skills';
export const SKILL_LINK_HOME = '.claude/skills';
export const SKILL_HOMES = [SKILL_HOME, SKILL_LINK_HOME];

/**
 * What is wrong with an installed skill folder, or `null` when it is fine or absent. Catches
 * the Windows failure: a symlink checked out as a small text file holding its target's path.
 */
export function skillInstallProblem(path) {
  let st;
  try { st = lstatSync(path); } catch { return null; }
  if (st.isSymbolicLink()) return existsSync(join(path, 'SKILL.md')) ? null : 'is a symlink whose target is missing';
  if (st.isFile()) return 'is a file, not a folder (a symlink checked out without symlink support, as on Windows)';
  if (!existsSync(join(path, 'SKILL.md'))) return 'has no SKILL.md';
  return null;
}

/** Remove a broken skill install so it can be written again. */
function clearBroken(path, report) {
  if (!skillInstallProblem(path)) return;
  rmSync(path, { recursive: true, force: true });
  report.repaired.push(path);
}

export const AGENTS_MARKER = '<!-- dibber:agents -->';

/** A prefix from the repository's folder name: initials of its words, else its first letters. */
export function defaultPrefix(root) {
  const words = basename(root).toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
  let p = words.length > 1 ? words.map((w) => w[0]).join('').slice(0, 4) : (words[0] ?? '').slice(0, 3);
  p = p.replace(/^[0-9]+/, '');
  return /^[A-Z][A-Z0-9]*$/.test(p) ? p : 'T';
}

export function skillNames() {
  return readdirSync(SKILLS_DIR).filter((n) => statSync(join(SKILLS_DIR, n)).isDirectory()).sort();
}

function copyTree(from, to, report, overwrite) {
  for (const name of readdirSync(from).sort()) {
    const src = join(from, name);
    const dst = join(to, name);
    if (statSync(src).isDirectory()) copyTree(src, dst, report, overwrite);
    else writeOnce(dst, readFileSync(src, 'utf8'), report, overwrite);
  }
}

/**
 * Make `link` a relative symlink to the directory `target`. Falls back to a copy where the
 * file system or platform refuses symlinks (Windows without developer mode).
 */
function linkOrCopy(target, link, report, overwrite) {
  let existing = null;
  try { existing = lstatSync(link); } catch {}
  if (existing?.isSymbolicLink() || (existing && !overwrite)) {
    report.skipped.push(link);
    return;
  }
  if (existing) return copyTree(target, link, report, overwrite); // an older copy: refresh it
  mkdirSync(dirname(link), { recursive: true });
  try {
    symlinkSync(relative(dirname(link), target), link, 'dir');
    report.created.push(link);
    return;
  } catch {}
  copyTree(target, link, report, overwrite);
}

function writeOnce(path, content, report, overwrite = false) {
  if (existsSync(path) && (!overwrite || readFileSync(path, 'utf8') === content)) {
    report.skipped.push(path);
    return false;
  }
  mkdirSync(dirname(path), { recursive: true });
  const existed = existsSync(path);
  writeFileSync(path, content);
  (existed ? report.updated : report.created).push(path);
  return true;
}

/**
 * Set up `root`. Options: `prefix`, `store` (default `tickets`), `agents` (default true),
 * `updateSkills` (overwrite the installed skills with this version's), `linkSkills` (link
 * `.claude/skills/<name>` to `.agents/skills/<name>` instead of copying).
 * A broken skill install (see `skillInstallProblem`) is always repaired.
 * Returns `{ created, updated, skipped, repaired }` as paths relative to `root`.
 */
export function init(root, opts = {}) {
  const report = { created: [], updated: [], skipped: [], repaired: [] };
  const prefix = opts.prefix ?? defaultPrefix(root);
  if (!/^[A-Z][A-Z0-9]*$/.test(prefix)) throw new Error(`the prefix \`${prefix}\` must be upper-case letters and digits, starting with a letter (no dash)`);
  const storeRel = opts.store ?? 'tickets';

  const configPath = join(root, '.dibber', 'config.json');
  let config = { store: storeRel, prefix };
  if (existsSync(configPath)) {
    try { config = { ...config, ...JSON.parse(readFileSync(configPath, 'utf8')) }; } catch {}
  }
  writeOnce(configPath, JSON.stringify({ store: storeRel, prefix }, null, 2) + '\n', report);

  const store = join(root, config.store);
  writeOnce(join(store, 'archive', '.gitkeep'), '', report);
  if (readStore(root).tickets.length === 0) {
    const id = `${config.prefix}-1`;
    const sample = readFileSync(join(TEMPLATES, 'first-ticket.md'), 'utf8')
      .replaceAll('{{ID}}', id)
      .replaceAll('{{DATE}}', today())
      .replaceAll('{{STORE}}', config.store);
    writeOnce(join(store, `${id}.md`), sample, report);
  }

  if (opts.agents !== false) {
    for (const name of skillNames()) {
      const agentsDir = join(root, SKILL_HOME, name);
      const claudeDir = join(root, SKILL_LINK_HOME, name);
      clearBroken(agentsDir, report);
      clearBroken(claudeDir, report);
      copyTree(join(SKILLS_DIR, name), agentsDir, report, opts.updateSkills);
      if (opts.linkSkills) linkOrCopy(agentsDir, claudeDir, report, opts.updateSkills);
      else copyTree(join(SKILLS_DIR, name), claudeDir, report, opts.updateSkills);
    }
    const section = readFileSync(join(TEMPLATES, 'AGENTS.section.md'), 'utf8').replaceAll('{{STORE}}', config.store);
    const agentsPath = join(root, 'AGENTS.md');
    if (!existsSync(agentsPath)) writeOnce(agentsPath, `# Agent instructions\n\n${section}`, report);
    else if (!readFileSync(agentsPath, 'utf8').includes(AGENTS_MARKER)) {
      appendFileSync(agentsPath, `\n${section}`);
      report.updated.push(agentsPath);
    } else report.skipped.push(agentsPath);
    // Claude Code reads CLAUDE.md, not AGENTS.md: point it there.
    const claudePath = join(root, 'CLAUDE.md');
    const pointer = `${AGENTS_MARKER.replace('agents', 'claude')}\n@AGENTS.md\n`;
    if (!existsSync(claudePath)) writeOnce(claudePath, pointer, report);
    else {
      const text = readFileSync(claudePath, 'utf8');
      if (text.includes('@AGENTS.md')) report.skipped.push(claudePath);
      else {
        appendFileSync(claudePath, `\n${pointer}`);
        report.updated.push(claudePath);
      }
    }
  }

  const relp = (p) => p.slice(root.length + 1).split('\\').join('/');
  return { created: report.created.map(relp), updated: report.updated.map(relp), skipped: report.skipped.map(relp), repaired: report.repaired.map(relp), prefix: config.prefix, store: config.store };
}
