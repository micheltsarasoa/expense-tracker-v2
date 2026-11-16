<!--
PROPOSED replacement for /CLAUDE.md. To be validated by the owner before it is written at the repo root.
Decisions applied: D-11 (owner preferences live here, no CLAUDE.local.md), D-12 (contributor docs in English).
Remove this comment when copying.
-->

# Expense Tracker

Self-hostable, open source (AGPL-3.0) personal and family finance app. Strict TypeScript monorepo.

## Owner preferences

- Chat replies in French; code, commits, issues and docs in English.
- Always grill the owner with `AskUserQuestion` pop-ups. Put the recommended option first, labelled « (Recommandé) », with a one-line reason.
- Never decide alone. Facts are the agent's job to look up; decisions (product, architecture, schema, dependency, auth, scope) are the owner's.
- No quizzes or comprehension questions: questions exist to decide, never to test.
- Concise: result first, tables over prose, no recap of what was just read.
- Surgical reads and edits: Grep, then read the needed range; change the minimum; no reformatting or renaming outside the task.
- Agents write the docs (JSDoc, README, `docs/`) in the same PR; link instead of duplicating.
- No Windows paths in files or commands. Use bare `pnpm`.

## Working rules

- Read the spec in `docs/specs/` and the task in `docs/roadmap/phases.md` first. Spec missing: stop and ask.
- TDD: red test, minimal code, refactor. One task = one PR, shippable alone. Commits are Conventional and signed off (DCO).
- Vague request: ask the missing questions before acting. Precise request: execute.
- No `AskUserQuestion` available (sub-agent, headless): stop and return the list of questions.
- Decision taken: record it in an ADR in `docs/decisions/`. The 39 decisions in `docs/roadmap/decisions-taken.md` are binding.
- Before a new module: options, trade-offs, testable seam, then ask.

## Stack

Turborepo · pnpm · Next.js 16 (React 19) · Better Auth · PostgreSQL via `node-postgres` + Drizzle · Zod · shadcn/ui · Tailwind v4 · Vitest · Playwright · Storybook · pg-boss.

Check framework docs for the installed version before using an API.

## Layout and boundaries

| Path | Role |
|---|---|
| `apps/web` | Adult web app (Next.js) |
| `apps/kid` | Child app, installable PWA |
| `apps/worker` | Background jobs (pg-boss) |
| `packages/tokens` | Design tokens |
| `packages/ui` | Atomic web UI (React DOM, Tailwind v4, shadcn), shared by web and kid |
| `packages/core` | Pure domain logic: `Money`, `authorize()`, rules |
| `packages/types` | Zod schemas and shared types; zero runtime deps |
| `packages/db` | Drizzle schema and access; the ONLY entry point to the database |
| `packages/api-client` | Typed client generated from the OpenAPI spec |

- Apps import packages; a package never imports an app.
- Check `packages/types` before creating a type or schema.

## Non-negotiable rules

- **Isolation**: scope every query by `userId` (and household where relevant) and go through `authorize()`. Every new route has a negative access test.
- **Money**: never a float. `numeric(15,2)` in the database, strings in transit, one `Money` type.
- **Secrets**: none in code, logs, tests or chat. Do not read `.env*`.
- **Migrations**: forward only; never edit an applied migration; never against a non-local database without explicit approval.
- **Errors**: typed, user-facing message, never swallowed.
- **Minors**: no trackers, minimal data; child rules flag, they never block.

## Ask before

Schema change · new dependency · auth or authorization change · deleting files or data · `git push` · anything outside the requested task.

## Code conventions

- Imports: `@expense-tracker/*`, then external, then relative. Named exports only (except Next.js pages and layouts).
- No `any`, no `@ts-ignore`. Reuse the Zod schemas from `packages/types` in forms and server code.
- UI: `packages/ui` components, Tailwind tokens, mobile first, dark mode via CSS variables, loading, error and empty states always handled, semantic HTML and keyboard access.
- No hard-coded strings: i18n (FR default + EN, age namespaces for the child app).

## Commands

```bash
pnpm install
pnpm dev
pnpm lint && pnpm typecheck && pnpm test
pnpm --filter <workspace> add <pkg>   # never at the root
pnpm --filter db generate             # generate a migration
pnpm --filter db migrate              # local database only
```

## Git

- One branch per PR, from fresh `main`: `git fetch origin main && git checkout -b claude/<short-description> origin/main`. Never reuse a merged branch.
- Squash merge; no commit or push unless asked.

## Where to find things

| Need | File |
|---|---|
| Domain vocabulary | `GLOSSARY.md` |
| Decisions | `docs/roadmap/decisions-taken.md`, `docs/decisions/` |
| Next task | `docs/roadmap/phases.md` |
| Agent setup | `docs/roadmap/agent-setup.md` |
| Issues and triage labels | `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md` |
| Next.js in this repo | `apps/web/AGENTS.md` |
