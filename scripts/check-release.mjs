#!/usr/bin/env node
// check-release.mjs — the package, the Claude Code plugin and its marketplace entry carry one
// version, and (given a release tag) the tag is that version: `v0.2.0` for 0.2.0.
// Ticket: [DIB-21](../tickets/DIB-21.md).
//
//   node scripts/check-release.mjs            versions agree
//   node scripts/check-release.mjs v0.2.0     ... and match the tag
//   node scripts/check-release.mjs --sync     copy package.json's version into .claude-plugin/
//                                             (npm version runs this; see docs/releasing.md)

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

export function versions() {
  const marketplace = read('.claude-plugin/marketplace.json');
  return {
    'package.json': read('package.json').version,
    '.claude-plugin/plugin.json': read('.claude-plugin/plugin.json').version,
    '.claude-plugin/marketplace.json': marketplace.plugins.find((p) => p.name === 'dibber')?.version,
  };
}

export function problems(tag) {
  const v = versions();
  const out = [];
  const pkg = v['package.json'];
  for (const [file, ver] of Object.entries(v)) if (ver !== pkg) out.push(`${file} says ${ver}, package.json says ${pkg}`);
  if (tag !== undefined && tag !== `v${pkg}`) out.push(`the release tag is ${tag}, but the version is ${pkg}: tag it v${pkg}, or bump the version (npm version <x.y.z> updates package.json; set the same in .claude-plugin/)`);
  return out;
}

export function sync() {
  const v = read('package.json').version;
  const plugin = read('.claude-plugin/plugin.json');
  plugin.version = v;
  writeFileSync(join(ROOT, '.claude-plugin/plugin.json'), JSON.stringify(plugin, null, 2) + '\n');
  const marketplace = read('.claude-plugin/marketplace.json');
  for (const p of marketplace.plugins) if (p.name === 'dibber') p.version = v;
  writeFileSync(join(ROOT, '.claude-plugin/marketplace.json'), JSON.stringify(marketplace, null, 2) + '\n');
  return v;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--sync') {
    console.log(`✓ .claude-plugin/ set to ${sync()}`);
    process.exit(0);
  }
  const found = problems(process.argv[2]);
  for (const p of found) console.error(`✗ ${p}`);
  if (found.length) process.exit(1);
  console.log(`✓ version ${versions()['package.json']}${process.argv[2] ? `, tag ${process.argv[2]}` : ''}`);
}
