---
name: drizzle-migration
description: Change the database schema safely with Drizzle - edit schema, generate, review the SQL, test on a real Postgres. Use for any change under packages/db/src/schema.
---

# Drizzle migration

The owner approves every schema change first (`.claude/rules/db.md`).

1. **Test first.** Write the failing integration test that needs the new column or table (`withTestDb` from `packages/test-utils`).
2. **Edit the schema** in `packages/db/src/schema/<table>.ts`. Amounts `numeric(15,2)`; shared tables carry `user_id` and `household_id`.
3. **Generate:** `pnpm --filter db generate --name=<what-changes>`. Never write or edit SQL in `packages/db/migrations/` by hand (a hook blocks it).
4. **Read the generated SQL.** Look for drops, renames, type narrowing, `NOT NULL` without default on a filled table, non-concurrent indexes on big tables. If any, stop and ask: split into expand (add, backfill) and contract (remove) releases so version N-1 keeps working.
5. **Check:** `pnpm --filter db check:migrations`, then the tests.
6. **Commit** schema and migration together. Ask the `db-migration-reviewer` agent for a review.

Never apply schema changes without a migration file, and never migrate a non-local database without explicit approval.
