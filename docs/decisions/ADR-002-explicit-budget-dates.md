# ADR-002 — Explicit Budget Dates (No Recurring Period Types)

**Date:** 2026-04-10  
**Status:** Accepted

## Context

v1 had budgets with period types: `weekly`, `monthly`, `yearly`. The app auto-calculated start/end dates based on the period type and the current date. This created edge cases (what is "this month" for a budget created on the 28th?), made duplication ambiguous, and complicated the budget suggestion feature.

## Decision

All budgets in v2 have an **explicit `startDate` and `endDate`**. No period type field. No auto-calculation.

- Users set both dates manually
- The "Duplicate" action pre-fills all fields and requires the user to set new dates — the most common recurring case
- Budget suggestions (rule-based) propose concrete date ranges (first/last day of next month)

## Consequences

**Positive**
- No ambiguity in date range calculation
- Budget suggestion algorithm can output concrete `startDate`/`endDate`
- Simpler data model — one fewer enum field

**Negative**
- Users who want monthly budgets must create or duplicate one per month (mitigated by the duplicate action and future budget suggestions)
- Intentional UX regression from v1 — acknowledged

## Rejected alternatives

- **Keep period types**: adds complexity to the suggestion algorithm and the duplicate UX
- **Recurring budgets (auto-renew)**: out of scope; requires a background job and notification system
