Review the current branch against `main` before a PR.

1. `git diff --stat origin/main...HEAD` to see what changed.
2. Run the `code-review` skill (standards and spec).
3. Add reviewers by touched paths, in parallel:
   - routes, actions, services, `packages/db` → `security-reviewer` (and `db-migration-reviewer` if migrations changed)
   - `*.tsx`, `packages/ui` → `ui-reviewer`, `a11y-reviewer`, `i18n-reviewer`
   - `apps/kid`, child flows → `security-reviewer` with the minors checklist
4. Merge the findings into one table: severity, `path:line`, issue, fix, reviewer.

Do not change code. Ask the owner which findings to fix.
