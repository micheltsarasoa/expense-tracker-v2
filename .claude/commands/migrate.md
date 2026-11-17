Apply pending Drizzle migrations to the LOCAL development database.

Steps:

1. Read the host of `DATABASE_URL` without printing the URL: `node -e "const u=new URL(process.env.DATABASE_URL);console.log(u.hostname)"` (load `.env` with `pnpm --filter db exec dotenv -e ../../.env -- ...` if needed; never `cat` the file).
2. If the host is not `localhost`, `127.0.0.1`, `::1`, `postgres` or `db` (compose service names), STOP and ask the owner with `AskUserQuestion`: name the host, recommend "Do not migrate" first. Proceed only on an explicit yes.
3. `pnpm --filter db check:migrations` — the schema and migrations must match. If not, generate first (skill `drizzle-migration`).
4. List the migration files not yet applied and show their SQL. Call out any DROP, rename or type narrowing.
5. `pnpm --filter db migrate`.
6. Report which files were applied.

Never edit an existing migration. Never apply schema changes without a migration file.
