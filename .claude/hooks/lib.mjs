// Shared helpers for Claude Code hooks: read the JSON event, block with a reason.
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

export function readEvent() {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
}

export function projectDir(event) {
  return resolve(process.env.CLAUDE_PROJECT_DIR || event.cwd || process.cwd());
}

export function repoPath(event, file) {
  return relative(projectDir(event), resolve(projectDir(event), file))
    .split('\\')
    .join('/');
}

export function block(reason) {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}
