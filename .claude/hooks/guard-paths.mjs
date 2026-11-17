// PreToolUse (Edit|Write|MultiEdit|NotebookEdit): protect secrets, applied migrations and the lockfile.
import { basename } from 'node:path';

import { block, readEvent, repoPath } from './lib.mjs';

const event = readEvent();
const file = event.tool_input?.file_path ?? event.tool_input?.notebook_path;
if (!file) process.exit(0);

const path = repoPath(event, file);
const name = basename(path);

if (name.startsWith('.env') && name !== '.env.example') {
  block(
    `Blocked: ${path} may hold secrets. Edit .env.example and the schema in apps/web/lib/env.ts instead.`,
  );
}
if (/(^|\/)packages\/db\/migrations\//.test(path)) {
  block(
    `Blocked: migrations are generated, never edited. Change the schema and run 'pnpm --filter db generate'.`,
  );
}
if (name === 'pnpm-lock.yaml') {
  block('Blocked: pnpm-lock.yaml is written by pnpm only.');
}
