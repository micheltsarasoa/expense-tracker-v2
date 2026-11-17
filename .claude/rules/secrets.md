# Secrets

- No secret in code, tests, fixtures, logs, commit messages or chat.
- Do not read or edit `.env*` files. Use `.env.example` and `apps/web/lib/env.ts` to learn which variables exist.
- CI uses placeholders, never real keys.
- Logs never contain tokens, passwords, full emails of minors or amounts tied to a named child.
