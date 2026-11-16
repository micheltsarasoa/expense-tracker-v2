#!/usr/bin/env node
// Fails when a Markdown file links to a repo file that does not exist.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';

const files = execFileSync('git', ['ls-files', '*.md'], { encoding: 'utf8' })
  .split('\n')
  .filter(
    (file) => file && !file.startsWith('.claude/skills/') && !file.startsWith('docs/archive/'),
  );

const link = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const broken = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, raw] of text.matchAll(link)) {
    if (/^(https?:|mailto:|#)/.test(raw)) continue;
    const target = decodeURIComponent(raw.split('#')[0]);
    if (!target) continue;
    const path = target.startsWith('/') ? join('.', target) : join(dirname(file), target);
    if (!existsSync(path)) broken.push(`${file}: ${raw}`);
  }
}

if (broken.length > 0) {
  console.error(`Broken links (${broken.length}):\n${broken.join('\n')}`);
  process.exit(1);
}
console.log(`Links OK in ${files.length} Markdown files.`);
