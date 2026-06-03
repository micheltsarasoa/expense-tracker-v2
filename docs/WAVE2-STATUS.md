# Wave 2 — Status & Next Steps (working scratch file)

> Branch: **`claude/wave2-foundation`** (stacked on `claude/web-stabilization`, both unmerged).
> Goal: connect the mock UI to the real API (RSC reads + Server Actions), per `docs/reconnection-plan.md`.
> Tools used throughout: **Edit/Write**, `pnpm --filter @expense-tracker/web exec tsc --noEmit` (typecheck), `pnpm --filter @expense-tracker/web test` (vitest, 112), **git** (manual commits; pre-commit hook runs eslint+prettier).

## The pattern (reuse for every slice)

- **Read** → `page.tsx` is an `async` RSC: `const userId = await getUserId()` then call services from `@/services/instances`; map DB rows → DTOs from `@expense-tracker/types`; pass to a `*-client.tsx` `'use client'` island.
- **Mutate** → `actions.ts` (`'use server'`): `getUserId()` **outside** `runAction`, `parseInput(input, zodSchema)`, call service, `revalidatePath('/route')`. Client calls action, toasts on `res.ok`/`res.error`.
- Money = **string** end-to-end (display via `eur()` in `lib/format.ts`); dates = **ISO** (display via `formatDay()`); forms carry **ids**, DTOs carry ids **and** resolved names.

## Done (chronological)

| #   | What                                                                                                                        | Commit                     | Status                               |
| --- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------ |
| 1   | Wave 1 UX fixes + strict-mode cleanup (tsc 43→0)                                                                            | (web-stabilization branch) | ✅                                   |
| 2   | Foundation: DTOs in `packages/types/src/dto/`, `getUserId`, `runAction`, service-singleton hoist to `services/instances.ts` | `c8f27ec`                  | ✅                                   |
| 3   | Budgets slice (RSC + actions + modals)                                                                                      | `fd8971c`                  | ✅ **verified live**                 |
| 4   | Auth fix: `StackProvider`/`StackTheme` at root; dashboard chrome moved to `(dahsboard)/layout.tsx`                          | `9f7492d`                  | ✅ verified                          |
| 5   | K3: `TransactionService.list` enriched w/ joins → `TransactionListItemDTO` (+ `alias` re-export in db)                      | `60d9998`                  | ✅                                   |
| 6   | Budget **category required** (schema + modal)                                                                               | `a12bd03`                  | ✅ verified                          |
| 7   | Categories page wired (RSC + actions, tree)                                                                                 | `b50e505`                  | ✅ **verified live**                 |
| 8   | Dashboard composition (RSC, all widgets, Net stat)                                                                          | `4b2c49a`                  | ✅ **verified live**                 |
| 9   | Transaction Server Actions                                                                                                  | `b0aee25`                  | ✅                                   |
| 10  | Transactions page (RSC + searchParams filters + id-based modal + table)                                                     | `932c997`                  | ✅ committed, **runtime-unverified** |
| 11  | Accounts page wired (RSC + actions; remove = deactivate/delete)                                                             | `24b6438`                  | ✅ committed, **verified live**      |
| 12  | Reports page (RSC + date-range; `incomeVsExpenses` range-based)                                                             | `8d74a13`                  | ✅ committed, **runtime-unverified** |
| –   | Neon WebSocket **Pool** driver (interactive `db.transaction()` for tx writes)                                               | `3656ec6`                  | ✅ verified                          |
| –   | `drizzle.config` loads root `.env` fallback                                                                                 | `146d1ac`                  | ✅                                   |
| –   | Provision Stack user into `public.users` on auth                                                                            | `bdfd069`                  | ✅ verified                          |

### One-off integration fixes already applied (live DB)

- **Migration `0001` applied** to the DB (dropped `period_type`/`password_hash`, made budget `category_id`/`label_id` nullable, added tx CHECK constraints). Was previously unapplied.
- `seed.ts` given the same `.env` fallback (uncommitted, harmless) — **seed intentionally NOT run** (user declined).
- **Dropped rogue v1 trigger** `transaction_balance_update` (+ fn `update_payment_method_balance`) on `transactions` — it double-counted balances alongside `TransactionService` (a -620 expense showed -1240). Recomputed `current_balance = initial_balance + Σ tx`. Spec mandates app-managed balances, no triggers. Manual SQL in Neon (triggers aren't in the Drizzle schema, so a fresh DB won't have it). **⚠️ The Import flow must insert via `TransactionService` now (no trigger to fall back on).**

## Next / Not done

| Order | What                                                                                                    | How                          | Status              |
| ----- | ------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------- |
| 1     | Verify `/reports` renders with live data                                                                | manual                       | **NEXT (user)**     |
| 2     | Transactions **Import** flow (T3) — must insert via `TransactionService` (trigger gone)                 | new modal vs `import` routes | not done (deferred) |
| –     | Cleanup: `DialogDescription` on budget/duplicate/category modals (a11y warning) — tx modal already done | Edit                         | not done            |
| –     | Cleanup: dashboard **period selector** (D2) via searchParams                                            | —                            | deferred            |
| –     | Cleanup: budget **label-scoping** in modal                                                              | —                            | deferred            |
| –     | Cleanup: footer/group **float totals → integer cents** (B6 residual)                                    | —                            | deferred            |

## Decisions locked (this session)

- Reports = **date-range only** for v1 (account/category/type filters deferred).
- Mutations = **Server Actions** (not client fetch).
- Removed dead controls: budget period filter, budget type filter, Export CSV, dashboard period selector.
- Budget **category required** (overrides spec's "optional"; DB column stays nullable).
- Transactions: **server-side filtering** via searchParams; **type editable** on edit.
- **No DB seeding** (user declined) — create data via the wired pages instead.

## Gotchas / watch-outs (post-compact memory)

- **DB creds live in TWO files**: `apps/web/.env` (app) and root `.env` (drizzle/migrate/seed). Keep `DATABASE_URL` in sync or migrate fails `28P01`.
- Drizzle reads root `.env.local` then `.env`; the app reads `apps/web/.env`.
- A **`fallow`** dev tool was added to root `package.json` (+ `.fallowrc.json`) by something external — it can leave `node_modules` half-linked and break the eslint pre-commit hook (`eslint-config-next` not found). Fix: `pnpm install`.
- IDE inline diagnostics **lag badly** after edits — trust `tsc`/tests, not the inline squiggles.
- Pre-commit hook = lint-staged (eslint --fix + prettier). It reformats committed files.
- Uncommitted & NOT mine: `CLAUDE.md`, `docs/LEARNING.md`, `package.json`/`pnpm-lock.yaml`/`.gitignore`/`.fallowrc.json`, `.env`. Leave them.

## Verification status

- **Verified against live DB:** budgets (CRUD), categories (create), accounts (create), transactions (create + balance correct after trigger fix), dashboard (all widgets render with real data).
- **Runtime-unverified (typecheck+tests only):** reports page.
- Tests: **112 pass**, `tsc` **0 errors** on `@expense-tracker/web` and `@expense-tracker/types`.
