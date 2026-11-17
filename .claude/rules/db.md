---
paths:
  - 'packages/db/**'
---

# Database

- Ask before any schema change.
- Change the schema in `packages/db/src/schema`, then `pnpm --filter db generate`; commit schema and migration together. CI fails on drift (`check:migrations`).
- Migrations go forward only. Never edit an applied migration; write a new one.
- `pnpm --filter db migrate` against a local database only. Anything else needs explicit owner approval.
- Destructive steps (drop, rename, type narrowing) are split across releases so version N-1 keeps working.
