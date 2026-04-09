# Expense Tracker — Project Context
Personal finance app. Solo dev, Figma-first, TS-strict.
Stack: Turborepo, Next.js 16 (React 19), Expo, Neon Postgre (Drizzle), Zod.

## Workspace Layout & Boundaries
- `apps/web`: Next.js 16 App Router.
- `apps/mobile`: Expo Router.
- `packages/db`: Drizzle only. Single source of truth. Integers for cents.
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

## Development Standards
- **Imports**: `@expense-tracker/db` or `@expense-tracker/types` > external > relative.
- **Exports**: Named exports only (except Next.js pages/Expo screens).
- **Forms**: Reuse Zod schemas from `packages/types` in both RHF and Server Actions.
- **UI**: shadcn/ui + Tailwind v4 (@theme). Follow Figma exactly.

## Agent Instructions
- **Context**: If session exceeds 20k tokens, suggest a `compact` or `clear`.
- **Specs**: Read `docs/specs/` first. If missing, STOP and ask.
- **Edits**: Surgical edits only. No commentary on "what" the code does.
- **Check**: Always check `packages/types` before creating new interfaces.
- **Ask Before**: Schema changes, adding deps, or auth flow changes.
- **Context7**: Before using any framework API, file convention, or library feature, resolve the latest docs via Context7. This applies to: Next.js (file conventions, routing, APIs), Expo, Drizzle, Neon Auth, shadcn/ui, Tailwind v4, Zod, TanStack. Never rely on training-data assumptions for version-specific behaviour.