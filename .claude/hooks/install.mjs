// SessionStart: make a fresh cloud session ready (pnpm + dependencies). No-op on local machines.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { projectDir, readEvent } from './lib.mjs';

if (process.env.CLAUDE_CODE_REMOTE !== 'true') process.exit(0);

const root = projectDir(readEvent());
const shell = process.platform === 'win32';
const run = (command, args) =>
  spawnSync(command, args, { cwd: root, stdio: 'inherit', shell }).status === 0;

const hasPnpm = spawnSync('pnpm', ['--version'], { stdio: 'ignore', shell }).status === 0;
if (!hasPnpm && !run('corepack', ['enable'])) {
  process.stderr.write('SessionStart: pnpm is missing and corepack could not enable it.\n');
  process.exit(0);
}
if (
  !existsSync(join(root, 'node_modules', '.modules.yaml')) &&
  !run('pnpm', ['install', '--frozen-lockfile'])
) {
  process.stderr.write('SessionStart: pnpm install failed; run it manually.\n');
}
