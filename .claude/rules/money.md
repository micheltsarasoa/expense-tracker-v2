---
paths:
  - 'packages/core/**'
  - 'packages/db/**'
  - '**/services/**'
---

# Money

- Never a JavaScript `number` for an amount. `numeric(15,2)` in the database, decimal strings in transit, the `Money` type in code (D-04).
- One currency per household or solo user (D-05); never add amounts of different currencies.
- One rounding rule, defined in `packages/core`; do not round elsewhere.
- Balances: cached and reconciled (D-29); a change to transactions updates the cache in the same database transaction.
