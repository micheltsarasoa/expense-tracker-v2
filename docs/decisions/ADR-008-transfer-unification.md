# ADR-008: Transfer Unification (Two Rows per Transfer)

**Date:** 2026-11-10  
**Status:** Accepted

## Context

Today a transfer is **one row**: `type = 'transfer'`, `paymentMethodId` = source, `toPaymentMethodId` = target. `TransactionService` applies two balance deltas from that single row (ADR-003).

`docs/specs/spec-family.md` adds **family transfers** (parent → child wallet), modeled as **two rows** sharing a `transferGroupId`: an out row owned by the parent and an in row owned by the child. One row cannot have two owners. Under ADR-006 every row has exactly one `userId`, and reads and writes are scoped by it.

The spec leaves the two models side by side as "known debt". The Ledger v2 review (decision 7 in `docs/ledger-v2-decisions.md`) chose to remove that debt **before** Family ships, because:

- Every reader (lists, reports, budgets, "spent / kept", import, export) would otherwise branch on two shapes.
- Migrating is cheap now, while every transfer belongs to a single user. Once rows span owners, a migration has to reason about family scope as well.
- Decision 16 ("Convert" between transfer and expense/income) needs one shape to convert from and to.

## Decision

**1. Every transfer is two rows linked by `transferGroupId`.** This covers both own-account transfers and family transfers.

- The **out row** has `paymentMethodId` = the source account and is owned by the sender.
- The **in row** has `paymentMethodId` = the target account and is owned by the receiver. For an own-account transfer, the sender and the receiver are the same user.
- Both rows have `type = 'transfer'`, the same `amount`, the same `transactionDate` and the same `transferGroupId`.

**2. Direction is a column; the amount stays positive.**

- A new enum `transfer_leg` (`'out' | 'in'`) is nullable and is set only on transfer rows.
- `amount > 0` stays as it is.
- The signed value is computed when needed: out = −amount, in = +amount.
- CHECKs:
  - `type <> 'transfer' OR (transfer_group_id IS NOT NULL AND transfer_leg IS NOT NULL)`.
  - `type = 'transfer' OR (transfer_group_id IS NULL AND transfer_leg IS NULL)`.
- There is a unique index on `(transfer_group_id, transfer_leg)`, so a group never has two out rows.

**3. One DB transaction per change.**

- Create, edit and delete always write both rows and both balance updates inside one `db.transaction()`, following ADR-003.
- A delete is a soft delete by `transferGroupId`, never by row id.
- An edit of the amount, date or accounts rewrites both rows.

**4. Changing type only through "Convert"** (decision 16).

- Expense ↔ income stays a free edit.
- Transfer → expense/income: delete the other leg and change the remaining row's type. The kept row is the out leg for an expense and the in leg for an income.
- Expense/income → transfer: create the missing leg and set the group and leg on both rows.
- Each conversion is one DB transaction, and so is its balance correction.
- Editing `type` directly from or to `transfer` is rejected by the Zod schema.

**5. Migration: expand, backfill, contract.**

1. **Expand.** Add the nullable `transfer_group_id` and `transfer_leg` columns and the unique index. Keep `to_payment_method_id`.
2. **Backfill** (one DB transaction, idempotent). For each one-row transfer:
   - Generate a group id.
   - Mark the existing row as `out`.
   - Insert an `in` row: same user, `paymentMethodId = to_payment_method_id`, same amount and date, same description.
   - Leave **balances untouched**, because they already include both deltas.
   - Soft-deleted transfers are backfilled too, with both legs `isDeleted = true`.
   - Missing target accounts cannot occur, because the FK is `on delete restrict`. An archived target still gets its in row, so its history stays correct.
3. **Switch** services, the import code and the seed to the two-row shape. Add the new CHECKs.
4. **Contract.** Drop `to_payment_method_id` and its CHECKs in a later migration, once the backfill check passes in production.

**6. One definition of "spent / kept".**

- Own-account transfers count in neither spent nor income, because their legs cancel within one user.
- A parent's out leg to a child's wallet **counts as the parent's spending** (spec-family "Money meaning"), shown as "dont vers les enfants".
- The child's in leg is the child's income and never appears in the parent's totals.

**7. Invariant test.** For every user, the signed sum of their transfer rows where the counterpart is one of their own accounts equals 0. For every `transferGroupId`, the out and in amounts are equal and the group has exactly one leg of each kind. The test runs:

- after the backfill;
- in the service test suite;
- as a check before the contract step.

## Consequences

**Positive**

- There is one transfer shape for every reader, and Family adds no special case.
- Each row has one owner, so ADR-006 scoping works for transfers unchanged.
- An account's history is a plain `WHERE payment_method_id = ?`, and its rows sum to its balance movement.
- Convert (decision 16) has a well-defined row model.
- The invariant gives the migration and later bugs a cheap, testable guarantee.

**Negative**

- Transfers take twice as many rows.
- Every transfer write needs a DB transaction and has to touch the group, never a single row.
- This is a schema change and data migration on the most important table. It needs approval, a backup, and the expand and contract steps in two releases.
- Queries that count "number of transactions" must count transfer groups, not rows.
- Import must create both legs, and import dedupe (decision 13) must compare groups.

## Rejected alternatives

- **Keep two models (spec-family "known debt").** Every reader branches forever, and Convert has to handle both.
- **One row with from/to accounts, extended to two owners** (for example a `toUserId` column). It breaks the one-owner rule from ADR-006, so a child would read a row owned by their parent.
- **Negative amounts instead of a leg column.** This drops the `amount > 0` CHECK for every type, and the direction becomes implicit in the sign.
- **A TransferService wrapper over the one-row shape that fakes two rows on read.** It hides the problem in code but doesn't fix ownership, and every query still has to know about it.
