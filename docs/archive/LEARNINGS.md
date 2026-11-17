> **Outdated.** Archived in phase 0; it may contradict the code. Sources of truth: [docs/agents/README.md](../agents/README.md).

# Learnings

One short entry per reusable lesson (pattern, pitfall, rule).

## Multi-tenant: a row belongs to the user who reads it

**Rule.** When two users share money (parent → child allowance), never store one row that both users must read. Write one row per owner, each scoped by its own `userId`, linked by a shared id (e.g. `transferGroupId`) and created in a single DB transaction.
**Why.** Every query stays `WHERE user_id = :me`. A single cross-user row forces one side to read data it does not own, which breaks the scoping rule and makes leaks a matter of one missing check.

## WCAG AA: text contrast is not enough — controls need 3:1 too

**Rule.** Text needs 4.5:1 (3:1 at ≥24px or ≥18.66px bold). The boundary of an interactive control (input border, switch track, checkbox, unlabelled chip) needs 3:1 against its background (SC 1.4.11). Decorative borders (card outlines, table dividers) are exempt.
**Pitfall.** Dark "hairline" UIs pass every text check and still fail on inputs: `#3D3D3D` on `#121212` is 1.7:1. Keep two tokens — `border` (decorative) and `border-control` (≥3:1).
