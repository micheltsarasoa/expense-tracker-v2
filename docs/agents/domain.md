# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **[`GLOSSARY.md`](../../GLOSSARY.md)** at the repo root.
- **`docs/decisions/`**: read ADRs that touch the area you're about to work in.

A missing term is a gap: add it to the glossary in the same PR (see the `domain-modeling` skill).

## File structure

Single-context repo: one glossary and one ADR folder shared by every workspace.

```
/
├── GLOSSARY.md
├── docs/decisions/
│   ├── ADR-001-neon-auth.md
│   └── ADR-002-explicit-budget-dates.md
├── apps/web/
└── packages/{db,types}/
```

New ADRs follow the existing naming format: `ADR-00X-kebab-title.md` in `docs/decisions/`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-003 (no SQL triggers), but worth reopening because…_
