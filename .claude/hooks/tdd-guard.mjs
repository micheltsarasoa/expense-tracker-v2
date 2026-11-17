// PreToolUse (Edit|Write|MultiEdit): no source change before a neighbouring test changed (D-26).
// A test counts if it is modified in the working tree or was edited earlier in this session.
// Switch off for one session with TDD_GUARD=off.
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix } from 'node:path';

import { block, projectDir, readEvent, repoPath } from './lib.mjs';

if (process.env.TDD_GUARD === 'off') process.exit(0);

const event = readEvent();
const file = event.tool_input?.file_path;
if (!file) process.exit(0);

const path = repoPath(event, file);
const isTest = (p) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(p);
const isSource =
  /^(apps|packages)\/[^/]+\/.+\.[cm]?[jt]sx?$/.test(path) &&
  !/\.d\.ts$/.test(path) &&
  !/(^|\/)[^/]+\.config\.[cm]?[jt]s$/.test(path) &&
  !/\.stories\.[jt]sx?$/.test(path) &&
  !/(^|\/)(migrations|scripts|components\/ui|e2e)\//.test(path) &&
  !/(^|\/)(instrumentation|next-env\.d|middleware|proxy)\.ts$/.test(path);

const state = join(tmpdir(), 'claude-tdd-guard', `${event.session_id ?? 'default'}.log`);

if (isTest(path)) {
  mkdirSync(dirname(state), { recursive: true });
  appendFileSync(state, `${path}\n`);
  process.exit(0);
}
if (!isSource) process.exit(0);

let changed = [];
try {
  changed = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd: projectDir(event),
    encoding: 'utf8',
  })
    .split('\n')
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
} catch {
  process.exit(0);
}
const session = existsSync(state) ? readFileSync(state, 'utf8').split('\n').filter(Boolean) : [];
const tests = [...changed, ...session].filter(isTest);

const workspace = path.split('/').slice(0, 2).join('/');
const covered = tests.some((test) => {
  for (
    let dir = posix.dirname(path);
    dir.startsWith(workspace) && dir !== workspace;
    dir = posix.dirname(dir)
  ) {
    const testDir = posix.dirname(test);
    if (testDir === dir || testDir === `${dir}/__tests__` || testDir === `${dir}/test`) return true;
  }
  return false;
});

if (!covered) {
  block(
    `TDD: write or update the failing test first for ${path} ` +
      `(same folder, its __tests__/ or test/ folder, or a parent's). See .claude/rules/tdd.md.`,
  );
}
