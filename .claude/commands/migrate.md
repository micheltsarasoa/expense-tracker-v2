Run a Drizzle database migration against the live Neon database.

Steps:
1. Run `pnpm --filter db generate`
   - Show the full generated SQL to the user
   - If no new migration was generated, report "Schema is up to date" and stop
2. STOP — ask the user: "Apply this migration to the live Neon database? (yes/no)"
3. Only proceed if the user explicitly confirms
4. Run `pnpm --filter db migrate`
5. Confirm success — report which migration files were applied

Rules:
- Never apply without explicit confirmation
- Never edit existing migration files — generate new ones only
- If the migration involves a destructive change (DROP, column removal), call it out
  explicitly before asking for confirmation
