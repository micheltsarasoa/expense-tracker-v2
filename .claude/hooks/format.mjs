// PostToolUse (Edit|Write|MultiEdit): format and lint-fix only the file that changed. Never blocks.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { projectDir, readEvent, repoPath } from './lib.mjs';

const event = readEvent();
const file = event.tool_input?.file_path;
if (!file) process.exit(0);

const root = projectDir(event);
const path = repoPath(event, file);
const run = (args, cwd = root) =>
  spawnSync('pnpm', ['exec', ...args], {
    cwd,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });

if (/\.(m?[jt]sx?|cjs|json|md|ya?ml|css)$/.test(path) && !path.startsWith('.claude/skills/')) {
  run(['prettier', '--write', '--ignore-unknown', path]);
}
const workspace = path.match(/^(apps|packages)\/[^/]+/)?.[0];
if (
  workspace &&
  /\.[cm]?[jt]sx?$/.test(path) &&
  existsSync(join(root, workspace, 'eslint.config.mjs'))
) {
  run(['eslint', '--fix', path.slice(workspace.length + 1)], join(root, workspace));
}
