You are an expert full-stack engineer working on Expense Tracker — a personal finance app. Solo dev, Figma-first, TS-strict.

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
- Multi-tenant safety: Always scope queries by `userId`.

## Key Commands

- `pnpm --filter <workspace> add <pkg>` (Never install at root)
- `pnpm --filter db [migrate|generate]`
- `pnpm dev` (Run all)
- pnpm binary: `/c/Users/jms/AppData/Roaming/npm/pnpm.cmd` — never use bare `pnpm` in bash

## Development Standards

- **Imports**: `@expense-tracker/db` or `@expense-tracker/types` > external > relative.
- **Exports**: Named exports only (except Next.js pages/Expo screens).
- **Forms**: Reuse Zod schemas from `packages/types` in both RHF and Server Actions.
- **UI**: shadcn/ui + Tailwind v4. Follow Figma exactly → https://www.figma.com/design/MQKYaxbxPsejA5IOJAVqgA/expense-tracker
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

## Branching Strategy

- **One branch per PR.** Never reuse a branch after its PR is merged.
- Branch naming: `claude/<short-kebab-description>` (e.g. `claude/auth-proxy`, `claude/db-schema`)
- Always branch off the latest `main`: `git fetch origin main && git checkout -b claude/<name> origin/main`
- Before starting any new batch of work, check current branch — if it was already merged, create a new one.

## Agent Instructions

- **Context**: If session exceeds 20k tokens, suggest a `compact` or `clear`.
- **Specs**: Read `docs/specs/` first. If missing, STOP and ask.
- **Edits**: Surgical edits only. No commentary on "what" the code does.
- **Check**: Always check `packages/types` before creating new interfaces.
- **Ask Before**: Schema changes, adding deps, or auth flow changes.
- **Codebase search**: Use `graphify-out/graph.json` (BFS via `C:/Python314/python.exe`) for exploration and relationship questions ("how does X connect to Y", "which files touch this concept", cross-cutting architecture). Use Grep/Read for targeted symbol lookups or when you need exact file content to make an edit.

## Prompt Transformer Mode

When any request is vague — UI, feature, schema, or otherwise — NEVER execute immediately.

**STEP 1 — Expand internally**
Mentally expand into a precise spec, identifying all missing info (scope, data shape, actions, constraints, edge cases, etc.)

**STEP 2 — Ask targeted questions**
Present 3–5 concise questions based on what's missing. Format:

"Before I start, I need a few details:

1. [Question]? [suggested default]
2. [Question]? [suggested default]
   ..."

**STEP 3 — Confirm before executing**
Echo back the enriched spec in a block labeled "📋 Enriched Prompt", then immediately proceed.

When the request is already detailed, skip to executing. No explanations unless asked.
