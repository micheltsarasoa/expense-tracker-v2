Create a signed-off Conventional Commit for the current changes, then push only if the owner asked for it.

## Pre-flight — branch check

1. `git branch --show-current` — check the current branch
2. `git log --oneline origin/main..HEAD` — see if there are any unpushed commits
   - If the branch has **no commits ahead of main** (was already merged), it is stale.
     Create a new branch before committing:
     `git fetch origin main && git checkout -b claude/<short-description> origin/main`
   - If the branch already has unpushed commits, continue on it.

## Commit

3. `git status` — see changed files
4. `git diff` and `git diff --cached` — understand what changed
5. Infer commit type: `feat` | `fix` | `docs` | `refactor` | `test` | `chore` | `style`
6. Infer scope from the changed files:
   - `packages/db` → `db`
   - `packages/types` → `types`
   - `apps/web/app/api` → `api`
   - `apps/web/app/(dashboard)/<feature>` → feature name
   - `docs/` → `docs`
   - `.claude/` → `agents`
7. Write a subject line: max 72 chars, imperative mood, no period
8. Stage specific files by name — never `git add .` unless every change belongs to this commit
9. Run `pnpm lint && pnpm typecheck && pnpm test` for the touched workspaces — fix errors first
10. Commit with sign-off (DCO, D-34): `git commit -s -m "type(scope): subject"`; body lines under 100 chars; add the task id `(P<n>-<nn>)` to the subject when there is one
11. Push only if asked: `git push -u origin <current-branch>`

Conventional Commits format: `type(scope): subject`
Examples:

- `feat(transactions): add CSV import endpoint`
- `fix(auth): redirect loop on expired token`
- `chore(db): regenerate migration after schema change`

Never use `--no-verify`. Never amend a pushed commit.
