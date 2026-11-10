# Learnings

One short entry per reusable lesson (pattern, pitfall, rule).

## Multi-tenant: a row belongs to the user who reads it

**Rule.** When two users share money (parent → child allowance), never store one row that both users must read. Write one row per owner, each scoped by its own `userId`, linked by a shared id (e.g. `transferGroupId`) and created in a single DB transaction.
**Why.** Every query stays `WHERE user_id = :me`. A single cross-user row forces one side to read data it does not own, which breaks the scoping rule and makes leaks a matter of one missing check.

## WCAG AA: text contrast is not enough — controls need 3:1 too

**Rule.** Text needs 4.5:1 (3:1 at ≥24px or ≥18.66px bold). The boundary of an interactive control (input border, switch track, checkbox, unlabelled chip) needs 3:1 against its background (SC 1.4.11). Decorative borders (card outlines, table dividers) are exempt.
**Pitfall.** Dark "hairline" UIs pass every text check and still fail on inputs: `#3D3D3D` on `#121212` is 1.7:1. Keep two tokens — `border` (decorative) and `border-control` (≥3:1).

## Migrate a data shape before data spans owners

**Rule.** If a feature will make rows cross users (parent → child transfers), unify the data model first, while every row still belongs to one user.
**Why.** Migrating after the feature ships means rewriting rows that two users and two permission scopes depend on, so a bug becomes a leak or a broken balance for someone else.

## A design canvas is a proposal, not a spec

**Rule.** Check a design against specs, ADRs and locked decisions before building it. Where they conflict, the recorded decision wins unless it is explicitly reopened.
**Pitfall.** Generated designs quietly add scope (screens with no spec) and reverse settled choices (e.g. making a field optional).

## Multi-row writes belong in one DB transaction

**Rule.** Any change that writes more than one row for a single fact (both sides of a transfer, converting a row to a transfer) runs in one database transaction.
**Why.** If the second write fails, the first rolls back. Money can never leave one account without arriving in the other.

## Write the exception into the design system

**Rule.** When a deliberate effect breaks a general design rule (glow and glass in a "quiet" system), record it in the system as a named, tokenized exception: where it applies, and its limits (static, never animated).
**Pitfall.** An unwritten exception reads as drift. The next cleanup pass (human or AI) removes it.

## Store icon keys, not glyphs

**Rule.** Store an icon *name* (`shopping-cart`) per category and render it from a fixed icon set.
**Why.** Emoji render differently on each OS, can't follow `currentColor` or theme tokens, and screen readers announce them unpredictably.

## Put locale in the shared component, not in each screen

**Rule.** Money, dates and status labels render through shared components that read locale, currency and labels from one catalog.
**Why.** One default change (euro after the number, decimal comma) fixed every screen at once. Per-screen formatting leaves stragglers ("$84,20", "ON TRACK" on a French page).

## Parse what users actually have

**Rule.** Import should accept the formats real files use (French banks: `;` separator, decimal comma, DD/MM/YYYY), detect them, and show what was detected.
**Pitfall.** A strict template pushes the conversion work onto the user, and many will give up.

## Reshape data, don't replay its effects

**Rule.** A backfill that changes how data is stored (one transfer row becoming two) must not re-run side effects such as balance updates.
**Why.** Stored balances already include the effects of the old rows. Applying them again would count every transfer twice. Prove it with an invariant: each transfer group's legs sum to zero.
