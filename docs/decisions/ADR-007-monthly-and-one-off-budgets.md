# ADR-007 — Monthly and One-off Budgets (Supersedes ADR-002)

**Date:** 2026-10-24  
**Status:** Accepted

## Context

ADR-002 removed period types: every budget had explicit `startDate` / `endDate`, and a monthly budget meant duplicating it every month. The v2 design work (Budgets board, audit v2) showed that the most common need is "Groceries: $400 every month", and that duplicating it each month is the friction users notice first. ADR-002's real concerns were:

- ambiguity: what is "this month" for a budget created on the 28th?
- duplication: what does "duplicate" mean for a recurring budget?
- suggestions: the algorithm must output concrete ranges.
- a background job to "renew" budgets.

## Decision

Budgets get a `kind`: `monthly` or `one_off` (details in `docs/specs/spec-budgets.md`).

- **Monthly** = whole calendar months from `startDate` (always the 1st) until `endDate` (nullable = open-ended). `amount` is per month.
- `spent` for a month is **computed at query time** from `transactionDate` (a `date`, no time zone). Nothing is stored per month and nothing resets, so **no background job**.
- A budget created on the 28th covers that whole month: the month is the unit, not the creation day.
- At most one active monthly budget per (category, label) pair.
- **One-off** keeps ADR-002 behaviour: explicit start and end.
- Duplicate: one-off → new dates; monthly → new category or label.
- Suggestions output a monthly budget starting next month, which is still concrete (`startDate` = 1st of next month).

## Consequences

**Positive**

- The common case is one budget instead of twelve.
- No job, no stored periods: history stays correct if a past transaction is edited.
- One-off budgets (holiday, school year start) keep explicit dates.

**Negative**

- One more enum column and a nullable `endDate`; queries branch on `kind`.
- Changing a monthly amount changes past months too (the amount is not versioned). Accepted: the board shows the current amount; versioning can come later if needed.
- Schema change → requires approval before the migration.

## Rejected alternatives

- **Keep ADR-002 (duplicate every month)** — friction on the most common case.
- **Weekly / yearly periods** — no demand; week boundaries depend on a locale setting.
- **Auto-renew by copying rows each month** — needs a scheduled job and creates many rows.
- **Versioned monthly amounts** — correct history, but more tables for a rare need.
