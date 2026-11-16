Add or build a UI component. Name and level (atom, molecule, organism, template): $ARGUMENTS.

1. Search `packages/ui` (or `apps/web/components/ui` until `packages/ui` exists) for an existing component; reuse or extend before creating.
2. shadcn primitive needed: `pnpm --filter <ui-workspace> dlx shadcn@latest add <name>` (asks for approval). Do not edit generated files unless asked.
3. Otherwise build it test-first: a story with the states (default, loading, error, empty, disabled) and an interaction test, then the component.
4. Tokens only (`.claude/rules/ui.md`); accessible name and keyboard support (`.claude/rules/a11y.md`); no hard-coded text (`.claude/rules/i18n.md`).
5. Export it from the package index at its atomic level.

Report: files added, level, states covered, tokens used.
