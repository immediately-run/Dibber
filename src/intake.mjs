// File outside GitHub reports without treating their text as work instructions ([DIB-10](../tickets/DIB-10.md)).
import { readFileSync } from 'node:fs';
import { readStore } from './store.mjs';
import { newTicket, Refusal } from './tickets.mjs';

export function intakeGitHub(root, path) {
  let issue;
  try {
    issue = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Refusal(`cannot read GitHub issue JSON: ${error.message}`);
  }
  const url = issue?.html_url ?? issue?.url ?? '';
  const match = /^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/issues\/(\d+)$/.exec(url);
  const author = issue?.author?.login ?? issue?.user?.login ?? '';
  if (!match || !/^[A-Za-z0-9-]+(?:\[bot\])?$/.test(author) || typeof issue.title !== 'string'
      || (issue.body != null && typeof issue.body !== 'string')) {
    throw new Refusal('expected one GitHub issue with a canonical URL, reporter login, title and body');
  }

  const signature = `**Brief:** GitHub issue [#${match[1]}](${url}), filed by outside reporter @${author}.`;
  const existing = readStore(root).tickets.find((ticket) =>
    ticket.body.trimStart().startsWith(signature + '\n'));
  if (existing) return { id: existing.meta.id, file: existing.file, existing: true };

  const report = `${issue.title}\n\n${issue.body ?? ''}`
    .replace(/\r\n?/g, '\n').split('\n').map((line) => `> ${line}`).join('\n');
  return newTicket(root, {
    title: `Triage GitHub issue #${match[1]}`,
    body: [
      signature,
      '**Depends on:** none.',
      '### Reported',
      report,
      '### What to build',
      'Confirm the report and decide what follow-up work is needed.',
      '### Exit criteria',
      '- [ ] Record the triage decision and link any follow-up ticket.',
    ].join('\n\n'),
  });
}
