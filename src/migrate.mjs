// Upgrade a store in place while preserving ticket paths and bodies ([DIB-27](../tickets/DIB-27.md)).
import { writeFileSync } from 'node:fs';
import { checkStore, legacyPageKind, TICKET_SCHEMA } from './check.mjs';
import { splitFrontmatter, readStore } from './store.mjs';
import { Refusal } from './tickets.mjs';

export function migrateStore(root) {
  const store = readStore(root);
  if (!store.exists) throw new Refusal(`there is no store at ${store.storeRel}/`);
  const updates = [];

  for (const entry of [...store.pages, ...store.tickets]) {
    const { doc, body, meta } = splitFrontmatter(entry.text);
    const kind = legacyPageKind(meta);
    if (kind !== undefined) {
      doc.set('page', kind);
      doc.delete('kind');
    } else if (meta.id !== undefined && meta.status !== undefined && meta.page === undefined) {
      if (!Object.hasOwn(meta, 'type') || TICKET_SCHEMA.properties.type.enum.includes(meta.type)) continue;
      if (Object.hasOwn(meta, 'legacy_type')) {
        throw new Refusal(`${entry.file} already has legacy_type; resolve the two values before migrating`);
      }
      doc.set('legacy_type', doc.get('type', true));
      doc.delete('type');
    } else continue;
    updates.push({ entry, text: `---\n${doc.toString({ lineWidth: 0 })}---\n${body}` });
  }

  if (!updates.length) return [];
  const written = [];
  try {
    for (const { entry, text } of updates) {
      written.push(entry);
      writeFileSync(entry.path, text);
    }
    const { errors } = checkStore(root);
    if (errors.length) {
      throw new Refusal(errors.map(({ file, message }) => `${file}: ${message}`).join('\n'));
    }
  } catch (error) {
    for (const entry of written) writeFileSync(entry.path, entry.text);
    throw new Refusal(`migration failed: ${error.message}`);
  }
  return updates.map(({ entry }) => entry.file);
}
