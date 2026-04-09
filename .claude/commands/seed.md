Seed the database with development data.

Steps:
1. Check if `packages/db/src/seed.ts` exists
   - If it does: proceed to step 3
   - If not: ask the user which entities to seed (default: users, categories,
     payment_methods, transactions), then create the seed file before continuing
2. Seed file rules (when creating):
   - Fixed dev user: `dev@example.com` — idempotent (upsert, not insert)
   - Amounts as integers (cents) — e.g. 4999 for $49.99
   - Insert in dependency order: users → categories → payment_methods → transactions → budgets
   - No hardcoded UUIDs — use `crypto.randomUUID()` or let the DB generate them,
     except for the dev user which needs a stable ID for reproducibility
3. Run: `pnpm --filter db seed`
   (if no `seed` script exists in `packages/db/package.json`, run `npx tsx packages/db/src/seed.ts`)
4. Report rows inserted per table

Never seed against a production database — confirm `DATABASE_URL` points to a dev/staging instance first.
