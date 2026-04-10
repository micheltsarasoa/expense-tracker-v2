# ADR-003 — No SQL Triggers for Balance Updates

**Date:** 2026-04-10  
**Status:** Accepted

## Context

v1 maintained `payment_methods.currentBalance` via PostgreSQL triggers that fired on transaction insert, update, and delete. This kept balances correct but introduced problems:

- Triggers are invisible to the ORM — Drizzle has no awareness of them
- Testing requires a live database (triggers don't run in unit tests against mocked data)
- Migrations that touch the `transactions` table risk silently breaking trigger logic
- Debugging balance drift means inspecting both application code and DB trigger code

## Decision

Remove all SQL triggers. Balance updates are handled by **`TransactionService`** using a Drizzle `db.transaction()` block:

```ts
await db.transaction(async (tx) => {
  await tx.insert(transactions).values(newTransaction)
  await tx.update(paymentMethods)
    .set({ currentBalance: sql`current_balance + ${delta}` })
    .where(eq(paymentMethods.id, accountId))
})
```

Both the transaction insert and the balance update succeed or fail together.

## Consequences

**Positive**
- Balance logic is testable with Vitest (no live DB required — mock the Drizzle client)
- All business logic is visible in TypeScript — no hidden DB behaviour
- Migrations are safe: no trigger to break

**Negative**
- Balance updates can only happen through `TransactionService` — direct DB writes (e.g. seed scripts) must manually maintain balances
- If `TransactionService` is bypassed (e.g. direct SQL import), balances will drift (acceptable: import goes through the service)

## Rejected alternatives

- **Keep DB triggers**: hidden logic, untestable without a live DB
- **Recompute balance on read**: expensive for accounts with thousands of transactions
