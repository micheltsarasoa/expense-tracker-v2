Create a conventional commit for the current changes and push.

Steps:
1. `git status` — see changed files
2. `git diff` and `git diff --cached` — understand what changed
3. Infer commit type: `feat` | `fix` | `docs` | `refactor` | `test` | `chore` | `style`
4. Infer scope from the changed files:
   - `packages/db` → `db`
   - `packages/types` → `types`
   - `apps/web/app/api` → `api`
   - `apps/web/app/(dashboard)/<feature>` → feature name
   - `docs/` → `docs`
   - `.claude/` → `dx`
5. Write a subject line: max 72 chars, imperative mood, no period
6. Stage specific files by name — never `git add .` unless every change belongs to this commit
7. Run `pnpm lint && pnpm typecheck` before committing — fix any errors first
8. Commit: `git commit -m "type(scope): subject"`
9. Push: `git push -u origin <current-branch>`

Conventional Commits format: `type(scope): subject`
Examples:
- `feat(transactions): add CSV import endpoint`
- `fix(auth): redirect loop on expired token`
- `chore(db): regenerate migration after schema change`

Never use `--no-verify`. Never amend a pushed commit.
