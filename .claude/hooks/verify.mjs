// Stop: typecheck and test the workspaces changed since HEAD; on failure the agent keeps working.
import { execFileSync, spawnSync } from 'node:child_process';

import { projectDir, readEvent } from './lib.mjs';

const event = readEvent();
if (event.stop_hook_active || process.env.VERIFY_ON_STOP === 'off') process.exit(0);

const root = projectDir(event);
let changed = '';
try {
  changed = execFileSync('git', ['status', '--porcelain', '--', 'apps', 'packages'], {
    cwd: root,
    encoding: 'utf8',
  });
} catch {
  process.exit(0);
}
if (!changed.trim()) process.exit(0);

const result = spawnSync(
  'pnpm',
  ['exec', 'turbo', 'run', 'typecheck', 'test', '--filter=...[HEAD]', '--output-logs=errors-only'],
  { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' },
);
if (result.status !== 0) {
  const output = `${result.stdout}\n${result.stderr}`.trim().split('\n').slice(-40).join('\n');
  process.stderr.write(
    `Typecheck or tests fail in the changed workspaces. Fix them before stopping.\n${output}\n`,
  );
  process.exit(2);
}
