> **Outdated.** Archived in phase 0; it may contradict the code. Sources of truth: [docs/agents/README.md](../agents/README.md).

# Step C — Remediation & Reconnection Plan

> **Builds on:** the architecture map (API↔front rupture) and [docs/ux-audit.md](ux-audit.md).
> **Status:** plan only — no code written yet. Read this, then we execute wave by wave.
> **Two waves:** Wave 1 = pure-UI fixes with zero API dependency (shippable immediately). Wave 2 = reconnection, which _absorbs_ the audit's "fix while wiring" items.

---

## 0. Agreed strategy (recap, so the plan is self-contained)

- **Reads → React Server Components calling services directly.** No HTTP round-trip for initial render: an RSC page calls `getAuthenticatedUser()` then `service.method(userId, …)`. The HTTP routes under `/api/v1` stay as the public/mobile contract.
- **Mutations → Server Actions** that call the same services and `revalidatePath()` / `revalidateTag()`. Interactive UI (modals, filter bars) stays `'use client'` and receives server data + server actions as props.
- **Filters → URL `searchParams`.** Transactions and Reports read filters from the URL so the RSC re-queries on change. This deletes the client-side `useMemo` filtering and makes today's dead filter bars real.
- **Dashboard → one composing RSC** firing the widget queries in parallel (`Promise.all`), passing each slice down. No new aggregate endpoint for now (architecture Q3, option a).
- **Money stays a string end-to-end**, formatted only at render. **Dates are ISO `YYYY-MM-DD`** over the wire, formatted only at render. **IDs, not names**, travel in forms and DTOs.

---

## 0.1 Contract decisions to lock before Wave 2 (these gate everything else)

| #   | Decision                                                                                                                                                                                | Recommendation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Touches                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| K1  | **Where do response DTOs live?** Today request schemas are in `packages/types`; response shapes (`BudgetWithSpending`, the 4 report DTOs) are stranded in `apps/web/services`.          | Move/define response DTOs in `packages/types` so web + future mobile share one contract.                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `packages/types/src/schemas/*`, service imports                                  |
| K2  | **Money type on the frontend.**                                                                                                                                                         | Change frontend `Transaction.amount`, `Budget.amount/spent` from `number` → `string`. **Verified:** `packages/types/src/formatting.ts` already provides `formatAmount(number\|string, settings)` and `formatDate(iso, settings)` — and they're **settings-driven** (currency symbol/position, separators, date format come from user settings). So use them everywhere (kills C4), but note this means the user's settings must be in scope wherever money/dates render — fetch settings in the RSC and thread down, or a small settings provider. | `formatting.ts` (reuse as-is), all components rendering money, `settingsService` |
| K3  | **Transaction list needs display names.** `TransactionService.list` returns raw `SelectTransaction` — **IDs only, no category/account/label names** — but the table renders names.      | Enrich the list query with `LEFT JOIN` on categories/payment-methods/labels and return a `TransactionListItemDTO` (ids **and** names). Avoids client-side N+1 lookups.                                                                                                                                                                                                                                                                                                                                                                             | `transaction.service.ts`, `packages/types`                                       |
| K4  | **Report filters.** `ReportService` methods take only `(userId, from, to)` or `(userId, months)` — they do **not** accept account/category/type. Spec wants all four as global filters. | **DECIDED: date-range only for v1.** Account/category/type filtering deferred to a follow-up. `incomeVsExpenses` also moves from `months` → an explicit `(from, to)` range.                                                                                                                                                                                                                                                                                                                                                                        | `report.service.ts`, report routes                                               |
| K5  | **Mutations: Server Actions vs fetch to routes.**                                                                                                                                       | Server Actions (co-located, typed, no client fetch boilerplate). Keep the `/api/v1` routes for mobile/external.                                                                                                                                                                                                                                                                                                                                                                                                                                    | new `actions.ts` per feature                                                     |

> K3 and K4 are **backend touches**. Per CLAUDE.md these are query/DTO changes, not schema changes, so no migration — but call them out before we start so there are no surprises.

## 0.2 Execution gate — verify Next 16 APIs via Context7 (CLAUDE.md mandate)

**Blocks Wave 2 only; does NOT block presenting this plan or doing Wave 1** (Wave 1 is pure JSX/a11y, no framework APIs).

The whole read/mutate strategy rests on version-specific behaviour — RSC calling services directly, **Server Actions**, `revalidatePath`/`revalidateTag`, and `searchParams`-driven re-query — and this is Next **16**, where caching/revalidation semantics are exactly the area that changed (the `vercel:next-cache-components` skill exists for `use cache` / `cacheTag` / `cacheLife`). Per CLAUDE.md: _"Before using any framework API, resolve latest docs via Context7… Never rely on training assumptions for version-specific behaviour."_

**Action before starting Step 2.0:** resolve current Next 16 docs for Server Actions, `revalidatePath`/`revalidateTag`, the `use cache` directive, and `searchParams` access in Server Components. This may adjust the _specifics_ of 2.0 (e.g. tag-based invalidation vs path revalidation) — not the overall strategy.

---

## Wave 1 — Pure UI fixes (no API, shippable now)

Ordered easiest→riskiest. All are localized; none depend on data wiring.

| Order | Audit ID | Fix                                                                                                                                                                                                                                  | File(s)                                                                                                                                                    | Risk    |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1     | **C1**   | Remove the inner `<main>` — make `(dashboard)/layout.tsx` a passthrough (`return children` or a `<div>`), since the root layout already owns `<main>` + padding.                                                                     | [(dashboard)/layout.tsx](<apps/web/app/(dashboard)/layout.tsx>)                                                                                            | trivial |
| 2     | **T6**   | Add `<Label>`/`aria-label` ("From date", "To date") to the two filter date inputs.                                                                                                                                                   | [transactions-filter-bar.tsx](apps/web/components/transactions/transactions-filter-bar.tsx)                                                                | trivial |
| 3     | **T5**   | Make the row-action trigger visible on keyboard focus and touch: add `focus-visible:opacity-100 group-focus-within:opacity-100` (and consider always-visible on coarse pointers).                                                    | [transactions-table.tsx](apps/web/components/transactions/transactions-table.tsx)                                                                          | trivial |
| 4     | **T1**   | Fix edit pre-fill. Simplest idiomatic fix: add `key={editTarget?.id ?? 'new'}` to the edit `TransactionModal` instance so it remounts per record; or sync props→state with a `useEffect(open, transaction)` mirroring `BudgetModal`. | [transactions/page.tsx](<apps/web/app/(dashboard)/transactions/page.tsx>), [transaction-modal.tsx](apps/web/components/transactions/transaction-modal.tsx) | small   |
| 5     | **B3**   | Fix category-on-edit: resolve `budget.category` (name) → option id on pre-fill (or carry `categoryId`). _Superseded in Wave 2_ when the modal moves to IDs — do the minimal lookup now so editing stops wiping the category.         | [budget-modal.tsx](apps/web/components/budgets/budget-modal.tsx)                                                                                           | small   |
| 6     | **D1**   | Delete the duplicate `BudgetStatusWidget` render; settle the dashboard grid (see Wave 2 D-step for the real layout).                                                                                                                 | [dashboard/page.tsx](<apps/web/app/(dashboard)/dashboard/page.tsx>)                                                                                        | trivial |

**Wave 1 exit criteria:** WCAG AA blockers (C1, T5, T6) cleared; editing a transaction or a budget no longer loses data; dashboard renders each widget once. All verifiable without a database.

---

## Wave 2 — Reconnection (per page)

### Step 2.0 — Foundation (shared, do first)

- **Gate:** complete the Context7 / Next 16 verification in §0.2 before writing any of the below.
- **Hoist the service singletons.** They currently live in [api/v1/\_services.ts](apps/web/app/api/v1/_services.ts); if RSC pages import from there, page code couples to the `api/v1` route folder. Move instantiation to a neutral module (e.g. `apps/web/services/index.ts`) that both the routes and RSC import.
- **Define response DTOs in `packages/types`** (K1): `TransactionListItemDTO` (K3), `BudgetWithSpendingDTO`, `ReportSpendingDTO`/`ReportIncomeExpenseDTO`/`ReportBalanceDTO`/`ReportBudgetActualDTO`, `DashboardDTO`.
- **Single formatter** in `formatting.ts` (K2): `formatMoney(string)`, `formatDate(iso)`. Replace every `toFixed`/`toLocaleString`/`€` literal.
- **Data-access convention:** a thin `getUserId()` wrapper for RSC; per-feature `actions.ts` for mutations with a shared `try/catch → typed error` helper that the client maps to the spec toasts (resolves **C3**, **T7**, **B7**).
- **Replace the divergent mock lists (C2):** categories/labels/payment-methods come from their existing endpoints/services; selects everywhere consume the real lists.

### Step 2.1 — Budgets _(first vertical slice — cleanest 1:1 endpoint)_

- **Why first:** `GET /budgets` already returns `spent`/`remaining`/`pct`; no joins-for-names problem; one read + simple mutations. Proves the RSC-read + server-action-mutation pattern end to end.
- **Read:** convert `budgets/page.tsx` to RSC calling `budgetService.list(userId)`. Drop `SEED_BUDGETS`.
- **Mutations:** server actions for create/update/delete/duplicate → services → `revalidatePath('/budgets')`.
- **Folds in:** B6 (money string), B4 (end date required + `>` start), B5 (ISO dates, kill locale round-trip), B1 (remove pointless type filter), B2 (make period filter real **or** remove it), B8 (period-driven footer label), B3 (final ID-based category).
- **Files:** `budgets/page.tsx`, new `budgets/actions.ts`, `budget-modal.tsx`, `budget-card.tsx`, `packages/types`.

### Step 2.2 — Dashboard _(read-only composition — no mutations)_

- **Read:** RSC composing in parallel: `paymentMethodService.list`, `reportService.incomeVsExpenses`, `reportService.spendingByCategory`, `budgetService.list`, `transactionService.list({pageSize:10})`. Pass slices to the already-built widgets.
- **Folds in:** D2 (period selector drives **all** widgets via `searchParams`, not just 2 cards), D3 (add Net stat + comparison per spec §2), D5/C6 (turn on the widgets' existing `loading`/skeleton + add error fallback), D4 (give Recent Transactions a sensible span).
- **Files:** `dashboard/page.tsx` (→ RSC + a small client island for the period selector), widgets unchanged except props.

### Step 2.3 — Transactions _(most complex — list+filters, CRUD, validate, import)_

- **Read:** RSC reads filters from `searchParams`, calls `transactionService.list(userId, filters)` (server already paginates + filters). Delete client `useMemo` filtering and `SEED_TRANSACTIONS`.
- **Requires K3** (list DTO with names) so the table keeps showing category/account labels.
- **Filter bar** becomes a client island that pushes to the URL; selects populated from real categories/labels/payment-methods.
- **Mutations:** server actions create/update/delete (soft) /validate; validation uses the row's `isValidated` (retire the client `validatedIds` Set).
- **Folds in:** T2 (category required for income/expense), T4 (show transfer destination), T8 (money string), T9 (type-switch resets category), T10 (delete dialog formatting), T7 (error toast).
- **Import (T3)** is its own sub-task: build the 3-step modal against the existing `import` / `import/validate` / `template` routes. Sequence it last within this step.
- **Files:** `transactions/page.tsx`, new `transactions/actions.ts`, `transaction-modal.tsx`, `transactions-table.tsx`, `transactions-filter-bar.tsx`, import modal (new), `packages/types`.

### Step 2.4 — Reports _(read-only, but gated by K4)_

- **Read:** each tab maps 1:1 to a report endpoint; filters move to `searchParams`.
- **Gated:** **R1 can only be fully delivered after K4** (report services don't yet accept account/category/type, and income-vs-expenses uses `months` not a date range). Decision needed: extend `ReportService` now, or ship date-range-only filtering first and flag the rest.
- **Folds in:** R2 (hide Export until v2, or wire it), R4 (default to current month dynamically), R5 (confirm Balance History stays despite v2 scoping).
- **Files:** `reports/page.tsx`, report tab components, possibly `report.service.ts` + routes (K4).

---

## Suggested execution order & rationale

1. **Wave 1** (all of it) — fast, safe, removes the WCAG blockers and the two data-loss bugs immediately.
2. **2.0 Foundation** — nothing else is clean until DTOs + formatters + the action/error pattern exist.
3. **2.1 Budgets** — smallest complete vertical slice; validates the whole read+mutate pattern.
4. **2.2 Dashboard** — read-only; proves parallel RSC composition.
5. **2.3 Transactions** — the big one; import split off as a tail sub-task.
6. **2.4 Reports** — last; decide K4 scope first.

**Backend touches to pre-approve:** K3 (transaction list join/DTO) and K4 (report filter params). Opportunistic: clean up `BudgetService.findById`'s double `list()` call.

---

## Decisions (locked)

1. **K4 — report filters:** ✅ **date-range only** for v1; account/category/type deferred to a follow-up. `incomeVsExpenses` switches from `months` to an explicit date range.
2. **Mutations:** ✅ **Server Actions** (not client `fetch`).
3. **Dead controls:** ✅ **Remove** B2 (budget period filter) and R2 (Export CSV) until their features land.
4. **Start point:** ✅ **Review the 2.0 DTO definitions first**, then kick off execution (Wave 1 + Foundation).

## Carried-over notes surfaced while drafting DTOs

- **K3 applies to budgets too.** `BudgetService.list` selects budget columns only — no category **name/color** — but `BudgetCard` shows both. The list query needs a `LEFT JOIN categories` (name + color), same pattern as the transaction enrichment.
- **Dashboard stat comparison needs a previous-period query.** The stat cards show "% vs previous period"; no service computes prior-period income/expense today (mocked in `PERIOD_STATS`). Small addition to `ReportService` or the dashboard composition.
- **endDate spec vs schema conflict (B4).** Schema allows `endDate` NULL (open-ended) and `createBudgetSchema` treats it optional; the spec says "required, must be > start". Recommend following the **spec** (require in form + Zod) while leaving the column nullable.
- **Good news (T2):** category-required-for-non-transfer, transfer-needs-destination, and transfer-different-accounts are **DB CHECK constraints** — the frontend must match them or inserts hard-fail.
