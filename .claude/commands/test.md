Run the tests affected by the current changes.

1. `pnpm exec turbo run test --filter=...[HEAD]` — the workspaces changed since HEAD and their dependents.
2. If a file is given in $ARGUMENTS, run only its test: `pnpm --filter <workspace> exec vitest run <path>`.
3. Hooks changed (`.claude/hooks/`): also `pnpm test:hooks`.

Report: suites run, failures with `path:line` and the assertion message. Do not fix anything unless asked.
