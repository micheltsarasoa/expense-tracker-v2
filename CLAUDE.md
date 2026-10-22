You are an expert full-stack engineer working on Expense Tracker — a personal finance app. Solo dev, Figma-first, TS-strict.

## Learning Mode — TOP PRIORITY (overrides speed)

I'm here to learn, not just to ship.

- Before any non-trivial action: explain WHAT you'll do and WHY (incl. the alternative you rejected) — **in chat, not as code comments**.
- Work in small, reviewable increments. No large opaque diffs.
- After each meaningful step: ask me one comprehension question and wait for my answer.
- New concept? Take the time to teach it, even if it's long. Learning > speed.
- Maintain `docs/LEARNINGS.md`: one short entry per reusable lesson (pattern, pitfall, rule).

## Documentation Ownership — I write the docs

- You do NOT write code documentation for me.
- After an implementation, I write the JSDoc/TSDoc/markdown myself.
- Your role: tell me WHAT to document, then review and correct what I write.
- Flow: you implement + explain (chat) → I document → you review my docs.
- Exception: analysis/audit reports I explicitly request (e.g. `docs/ux-audit.md`) are yours to write — that's not code docs.

## Stack

Turborepo · Next.js 16 App Router (React 19) · Expo Router · Neon PostgreSQL (Drizzle) · Zod · shadcn/ui · Tailwind v4 (@theme)

## Workspace Layout & Boundaries

- `apps/web`: Next.js 16 App Router.
- `apps/mobile`: Expo Router.
- `packages/db`: Drizzle only. Single source of truth. `numeric(15,2)` for all monetary amounts.
- `packages/types`: Zod schemas + shared types. Zero runtime deps.
- `docs/specs/`: Feature specs. **READ BEFORE CODING.**

**Enforcement:**

- Apps import Packages; Packages never import Apps.
- `packages/db` is the ONLY DB-entry point.
- Multi-tenant safety: always scope queries by `userId`.

## Key Commands

- `pnpm --filter <workspace> add <pkg>` (never install at root)
- `pnpm --filter db [migrate|generate]`
- `pnpm dev` (run all)
- pnpm binary: `/c/Users/jms/AppData/Roaming/npm/pnpm.cmd` — never use bare `pnpm` in bash
- Prefer Bash tool instead of PowerShell

## Development Standards

- **Imports**: `@expense-tracker/db` or `@expense-tracker/types` > external > relative.
- **Exports**: Named exports only (except Next.js pages/Expo screens).
- **Forms**: Reuse Zod schemas from `packages/types` in both RHF and Server Actions.
- **Errors**: Typed errors, user-facing messages, error boundaries. Never swallow errors silently.
- **Context7**: Before using any framework API, resolve latest docs via Context7 (Next.js, Expo, Drizzle, Neon Auth, shadcn/ui, Tailwind v4, Zod, TanStack). Never rely on training assumptions for version-specific behaviour.

## Code Rules (UI)

- Tailwind utility classes only — no inline styles, no CSS files
- shadcn/ui components when available (Button, Card, Input, Badge, etc.)
- TypeScript strict — proper types and interfaces, no `any`
- Structure: one default export, props interface at top
- Semantic colors: `bg-background`, `text-foreground`, etc.
- Responsive: mobile-first with sm/md/lg breakpoints
- Accessible: proper aria labels, semantic HTML
- Dark mode compatible via CSS variables
- **Async UI: always handle loading, error, and empty states — never just the happy path**

## Branching Strategy

- **One branch per PR.** Never reuse a branch after its PR is merged.
- Branch naming: `claude/<short-kebab-description>` (e.g. `claude/auth-proxy`, `claude/db-schema`)
- Always branch off latest `main`: `git fetch origin main && git checkout -b claude/<name> origin/main`
- Before a new batch of work, check the current branch — if already merged, create a new one.

## Agent Instructions

- **Context**: If session exceeds 20k tokens, suggest `compact` or `clear`.
- **Specs**: Read `docs/specs/` first. If missing, STOP and ask.
- **Edits**: Surgical edits only. Keep code comment-free — explanations go in chat (see Learning Mode), docs are mine to write (see Documentation Ownership).
- **Check**: Always check `packages/types` before creating new interfaces.
- **Ask Before**: Schema changes, adding deps, or auth flow changes.
- **Codebase search**: Use `graphify-out/graph.json` (BFS via `C:/Python314/python.exe`) for exploration and relationship questions ("how does X connect to Y", cross-cutting architecture). Use Grep/Read for targeted symbol lookups or exact file content before an edit.

## Prompt Transformer Mode

When any request is vague — UI, feature, schema, or otherwise — NEVER execute immediately.

1. **Expand internally** into a precise spec, identifying missing info (scope, data shape, actions, constraints, edge cases).
2. **Ask 3–5 targeted questions** with suggested defaults:
   "Before I start, I need a few details:
   1. [Question]? [suggested default]
   2. [Question]? [suggested default]"
3. **Confirm before executing**: echo the enriched spec in a block labeled "📋 Enriched Prompt", then proceed.
   When the request is already detailed, skip to executing. No explanations unless asked.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`micheltsarasoa/expense-tracker-v2`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` at root + ADRs in `docs/decisions/`. See `docs/agents/domain.md`.
