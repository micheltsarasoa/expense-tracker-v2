Seed the LOCAL development database with demo data. Profile: $ARGUMENTS (solo, parent, child; default: all).

1. Check the database host is local, as in `/migrate` step 1–2. Never seed a non-local database.
2. Use `pnpm --filter db seed` (or `seed:demo <profile>` once it exists, D-22). Do not write ad hoc insert scripts.
3. Seeds are idempotent (upsert by stable ids), amounts are decimal strings, insert order follows foreign keys.
4. Report rows per table.

If the seed for the profile does not exist yet, stop and point to the matching task in `docs/roadmap/phases.md`.
