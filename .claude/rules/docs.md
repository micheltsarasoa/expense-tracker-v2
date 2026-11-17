# Documentation

- The agent writes the docs in the same PR as the code: TSDoc on exported symbols, README of the workspace, `docs/` pages it affects.
- Link instead of duplicating; one source of truth per fact (see `docs/agents/README.md`).
- A structural choice gets an ADR in `docs/decisions/` (skill `new-adr`) after the owner decided.
- New domain term: add it to `GLOSSARY.md` in the same PR.
- `pnpm docs:links` must pass.
