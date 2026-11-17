#!/bin/sh
# Fails when migrations are inconsistent or the schema has changes without a migration.
set -eu
cd "$(dirname "$0")/.."
export DATABASE_URL="${DATABASE_URL:-postgresql://check:check@localhost:5432/check}"
pnpm exec drizzle-kit check
pnpm exec drizzle-kit generate --name=drift-check >/dev/null
if [ -n "$(git status --porcelain -- migrations)" ]; then
  git status --porcelain -- migrations
  git checkout -- migrations 2>/dev/null || true
  git clean -fdq -- migrations
  echo "Schema and migrations diverge: run 'pnpm --filter db generate' and commit the migration." >&2
  exit 1
fi
echo "Migrations match the schema."
