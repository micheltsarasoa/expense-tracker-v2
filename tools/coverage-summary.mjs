#!/usr/bin/env node
// Merges each workspace's coverage-summary.json into one table (stdout and the GitHub job summary).
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const workspaces = execFileSync('git', ['ls-files', '*/package.json', '*/*/package.json'], {
  encoding: 'utf8',
})
  .split('\n')
  .filter((file) => /^(apps|packages)\//.test(file))
  .map((file) => file.replace(/\/package\.json$/, ''));

const metrics = ['lines', 'statements', 'branches', 'functions'];
const rows = [];
for (const workspace of workspaces) {
  const file = join(workspace, 'coverage', 'coverage-summary.json');
  if (!existsSync(file)) continue;
  const { total } = JSON.parse(readFileSync(file, 'utf8'));
  rows.push(`| ${workspace} | ${metrics.map((m) => `${total[m].pct}%`).join(' | ')} |`);
}

const table = [
  '### Coverage',
  '',
  `| Workspace | ${metrics.join(' | ')} |`,
  `|---|${metrics.map(() => '---:').join('|')}|`,
  ...rows,
  '',
].join('\n');

console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${table}\n`);
