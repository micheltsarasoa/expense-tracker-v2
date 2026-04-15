Implement a UI page or component from the design spec. The target is $ARGUMENTS (e.g. "dashboard", "transactions", "budgets").

## Pre-flight checks (STOP if any fail)

1. Read `docs/design.md` — locate the section for $ARGUMENTS
2. Read `CLAUDE.md` — confirm workspace boundaries and import rules
3. Check the Figma file linked in CLAUDE.md for the matching frame before writing any markup
4. Resolve component and API usage via Context7 (Next.js App Router, shadcn/ui, Tailwind v4)

## Step 1 — Inventory

- List existing files under `apps/web/app/(dashboard)/$ARGUMENTS/`
- List existing components under `apps/web/components/` that can be reused
- Check `apps/web/components/ui/` for already-installed shadcn/ui components
- Check `packages/types/src/` for existing Zod schemas that match the page's data

## Step 2 — Install missing shadcn/ui components

For each component listed in `docs/design.md § 4. Component Inventory` that the target page needs
and that is not yet in `apps/web/components/ui/`:

```
pnpm --filter web dlx shadcn@latest add <component>
```

Do not modify generated component files. Wire any new CSS variables into the Tailwind v4 `@theme`
block in `apps/web/app/globals.css`.

## Step 3 — Page scaffold

Target path: `apps/web/app/(dashboard)/$ARGUMENTS/page.tsx`

- Default export for the Next.js page
- Named sub-components in `apps/web/app/(dashboard)/$ARGUMENTS/_components/`
- Follow the layout, widget grid, and responsive breakpoints from `docs/design.md`
- Apply design tokens from `docs/design.md § 3` — never use raw hex values
- Every data-fetching view must render all five UI states: Loading (Skeleton) | Empty (EmptyState) |
  Error (inline card + Retry) | Success | Confirmation (Dialog for destructive actions)
- On mobile (< 768px): replace Dialog modals with Sheet (slides up from bottom)

## Step 4 — Data wiring

- Fetch data via the existing API routes under `apps/web/app/api/v1/`
- Validate response shape with the Zod schema from `@expense-tracker/types`
- Scope all mutations to the authenticated user — never pass userId from the client

## Step 5 — Dark mode

- Use only semantic Tailwind tokens (`text-foreground`, `bg-card`, etc.) — no hardcoded colors
- Test that income (emerald), expense (rose), and transfer (violet) are visible in both light and dark

## Rules

- Follow Figma exactly — pixel-perfect is the goal; raise a question if the spec and Figma disagree
- Named exports only (except the Next.js page default export)
- Never install new npm packages without asking
- Surgical edits only — do not touch unrelated files
- After scaffolding, list what is stubbed/missing and needs a follow-up task
