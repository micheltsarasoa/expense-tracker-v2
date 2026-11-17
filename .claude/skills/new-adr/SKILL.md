---
name: new-adr
description: Record an architecture decision the owner has taken as a numbered ADR in docs/decisions/. Use after a decision is made via AskUserQuestion, or when a roadmap task applies a D-xx decision.
---

# New ADR

Only for a decision the owner already took. If it is still open, use the `grilling` skill first.

1. Next number: highest `docs/decisions/ADR-NNN-*.md` plus one, three digits.
2. File: `docs/decisions/ADR-NNN-kebab-title.md`, in English.
3. Template:

```markdown
# ADR-NNN — Title

**Date:** YYYY-MM-DD
**Status:** Accepted
**Decision ref:** D-xx (if it comes from docs/roadmap/decisions-taken.md)

## Context

The forces at play, in a few lines. Link the spec or task.

## Decision

What we do, stated so a reviewer can check code against it.

## Options considered

| Option | For | Against |
| ------ | --- | ------- |

## Consequences

What becomes easier, harder, and what follow-up tasks exist.
```

4. Superseding: set the old ADR's status to `Superseded by ADR-NNN` and link both ways.
5. New domain terms go to `GLOSSARY.md` in the same PR. Run `pnpm docs:links`.
