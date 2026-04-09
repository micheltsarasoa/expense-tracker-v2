Scaffold a full vertical slice for the feature named in $ARGUMENTS.

## Pre-flight checks (STOP if any fail)
1. Read `docs/specs/spec-$ARGUMENTS.md` — if missing, STOP and ask the user to write the spec first
2. Read `CLAUDE.md` — confirm workspace boundaries and import rules
3. Resolve any relevant framework APIs via Context7 before writing code

## Step 1 — Types (`packages/types`)
- Check existing files in `packages/types/src/` — extend before creating
- Add Zod schema(s) for request/response shapes
- Add TypeScript interfaces inferred from the schema
- Named exports only

## Step 2 — DB schema (`packages/db`)
- Check `packages/db/src/schema.ts` for existing tables to reuse
- **ASK the user before adding or changing any table or column**
- If approved: add table/columns, keep amounts as integers (cents)
- Always include `userId` column for multi-tenant scoping
- Run dry-run: `pnpm --filter db generate` — show the SQL, do NOT apply yet

## Step 3 — API routes (`apps/web/app/api/v1/$ARGUMENTS/`)
- One file per HTTP method group (route.ts)
- Validate request body with Zod schema from `@expense-tracker/types`
- Scope every DB query by `userId` extracted from the Neon Auth token
- Return `ApiResponse<T>` shape (defined in `packages/types`)

## Step 4 — UI (`apps/web/app/(dashboard)/$ARGUMENTS/`)
- Page component: default export (Next.js convention)
- Sub-components: named exports in `_components/` subfolder
- Use shadcn/ui + Tailwind v4 tokens — follow Figma spec if available
- Forms: React Hook Form + reuse the Zod schema from `@expense-tracker/types`

## Step 5 — Tests
- Unit test for any pure logic (Zod transforms, business rules) in `packages/types`
- E2E test stub (Playwright) for the happy path in `apps/web/e2e/$ARGUMENTS.spec.ts`

## Rules
- Never install new dependencies without asking
- Never hard-code user IDs or credentials
- Surgical edits only — do not touch unrelated files
