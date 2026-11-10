# ADR-009: Private Accounts for Co-parents (Amends ADR-006)

**Date:** 2026-11-10  
**Status:** Accepted

## Context

ADR-006 lets a co-parent read **all** of the other parent's rows: accounts, transactions, budgets and reports. The Ledger v2 review (decision 2 in `docs/ledger-v2-decisions.md`) kept that default but added one exception. An adult can mark an account **private**, for example a personal savings account or money set aside for a gift. Its existence, its balance and its transactions are then hidden from the co-parent.

The flag is set on the **account**, not on each transaction. Every new transaction in a private account is private automatically, so nothing leaks because someone forgot to tick a box.

ADR-008 makes this practical. Every transfer is now two rows, one per account. A transfer between a private account and a shared account therefore splits cleanly: one row can be hidden and the other shown.

## Decision

**1. Data.**
- Add `visibility` (enum `account_visibility`: `'shared' | 'private'`, not null, default `'shared'`) to `payment_methods`.
- Existing accounts become `shared`, so nothing changes until someone opts in.
- It is an enum and not a boolean so that a later level (for example "parents only") can be added without a new migration.

**2. Who may mark an account private.**
- Only the account owner, and only if that owner is an **adult** (role `parent`, or no family).
- A child's accounts and wallet are always `shared`, because parental oversight (spec-family) needs them.
- The rule is enforced in the service and in the Zod schema.

**3. Read rule (amends ADR-006 §2).** A row owned by another user is readable only if both of these hold:
- `scope.canRead(ownerId)`;
- the row's account has `visibility = 'shared'`.

The owner always sees their own private rows. `AccessScope` gains a helper that builds this condition once:

```ts
readableRows(table): SQL
// userId = self
// OR (userId IN coParentIds/childIds AND paymentMethodId IN (shared accounts of those owners))
```

Read services use `readableRows` instead of `inArray(table.userId, scope.readIds(filter))`. The filter (`me | all | {id}`) still narrows by owner.

**4. Aggregates use only readable rows.**
- Totals, budget "spent", report charts and the dashboard computed for a co-parent are built from readable rows only.
- The owner and the co-parent can therefore see different totals for the owner's budget. This is intended: an aggregate built on hidden rows would leak them.
- When a total excludes something, the UI shows the note "Hors comptes privés".

**5. Transfers across the boundary** (ADR-008 rows).
- Between a private account and a shared one, the co-parent sees only the shared leg. The counterpart is shown as **"Compte privé"**, with no name and no id.
- Between two private accounts, the co-parent sees nothing.
- For an allowance paid from a private account, the child's in row stays visible to both parents, because it is child data. The source is shown as "Compte privé".

**6. Denied = 404**, as in ADR-006 §3. A private account id or private row id requested by a co-parent returns "not found".

**7. Toggling is retroactive.** Visibility belongs to the account, so it applies to the account's whole history:
- **shared → private** hides past rows immediately.
- **private → shared** reveals past rows.

The edit form says so before the user saves: "L'historique de ce compte sera visible / masqué."

**8. Export covers the user's own rows only**, private ones included. It never includes a co-parent's rows, even shared ones. Each adult exports their own data.

**9. Writes are unchanged.** ADR-006 already forbids writing to a co-parent's rows, so the `visibility` flag only affects reads.

## Consequences

**Positive**

- One flag on one table, decided in one helper (`readableRows`). It extends the ADR-006 test matrix with a "private" column instead of adding checks to each service.
- Privacy is safe by default: new transactions inherit it, and aggregates cannot leak hidden amounts.
- It falls out of ADR-008: one row per account makes partial visibility of a transfer trivial.

**Negative**

- Co-parent reads join (or sub-select) `payment_methods`, which is one more condition per read query. Mitigation: an index on `(user_id, visibility)`.
- Two adults can see different totals for the same budget or report. This is accepted, and the "Hors comptes privés" note explains it.
- Making an account private after the co-parent has seen its history doesn't make them forget it. This is accepted, and the edit form warns about it.
- It is a schema change (new enum and column) and needs approval before the migration.

## Rejected alternatives

- **A private flag on each transaction.** Easy to forget, and it leaks through transfers and balances: a hidden transaction in a visible account still moves the visible balance.
- **Private rows counted in aggregates but hidden in lists.** Totals would reveal the hidden amounts by subtraction.
- **Hide only from the dashboard and keep rows in lists and exports.** That's a cosmetic filter, not privacy.
- **Postgres Row-Level Security.** Rejected for the same reason as in ADR-006: the app uses a single DB role.
- **Private accounts for children.** It conflicts with parental oversight in spec-family. It is revisited at the graduate flow in v2.1, when a child becomes an independent adult.
