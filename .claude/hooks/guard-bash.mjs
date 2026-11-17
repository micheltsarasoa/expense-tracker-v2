// PreToolUse (Bash): second line behind the permission deny list for destructive commands.
import { block, readEvent } from './lib.mjs';

const command = readEvent().tool_input?.command ?? '';

const rules = [
  [/\bgit\s+push\b.*(\s--force(-with-lease)?\b|\s-f\b)/, 'force push rewrites shared history'],
  [/\bgit\s+reset\s+--hard\b/, 'git reset --hard discards work'],
  [/\bgit\s+clean\b/, 'git clean deletes untracked files'],
  [/\bgit\s+commit\b.*--no-verify\b/, 'hooks (lint, commitlint, DCO) must run'],
  [
    /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f?[a-zA-Z]*\s+(\/|~|\$HOME|\.)(\s|$)/,
    'recursive delete of a root, home or the whole project',
  ],
  [/\bdrizzle-kit\s+(push|drop)\b/, 'schema changes go through generated migrations'],
  [/\b(curl|wget)\b[^|]*\|\s*(ba|z)?sh\b/, 'piping a download into a shell'],
];

for (const [pattern, reason] of rules) {
  if (pattern.test(command)) block(`Blocked: ${reason}. Ask the owner if this is really needed.`);
}
