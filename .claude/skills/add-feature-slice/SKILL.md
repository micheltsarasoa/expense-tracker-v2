---
name: add-feature-slice
description: Build one vertical slice of a feature test-first - types, schema, service, route or action, screen. Use to implement a task from docs/roadmap/phases.md end to end.
---

# Add a feature slice

One slice = one task of `docs/roadmap/phases.md` = one PR.

0. **Read** the task row, its spec in `docs/specs/`, the decisions it cites, and `GLOSSARY.md`. Missing spec or open decision: stop and ask.
1. **Types** — Zod schema in `packages/types` (check existing ones first). Amounts as decimal strings.
2. **Database** — only if needed, via the `drizzle-migration` skill (owner approval first).
3. **Domain logic** — pure functions in `packages/core` with unit tests first (`Money`, rules).
4. **Service** — in the app's `services/`, scoped by the actor, using `authorize()`. Red integration test first on real Postgres, plus the `tenant-isolation-tests` cases.
5. **Route or server action** — validate input with the Zod schema from step 1; typed errors become user-facing messages. Route test first.
6. **Screen** — compose `packages/ui` components; loading, error and empty states; i18n keys FR and EN. E2E test for the main path when the task asks for it.
7. **Docs** — TSDoc on exports, spec and README updates, glossary terms (`.claude/rules/docs.md`).
8. **Check** — `pnpm lint && pnpm typecheck && pnpm test && pnpm docs:links`, then review with the relevant agents (`security-reviewer`, `ui-reviewer`, `a11y-reviewer`, `i18n-reviewer`).

Skip a step only when the task does not touch that layer; say which in the PR.
