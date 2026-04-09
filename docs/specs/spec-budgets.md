# Feature Spec — Budgets

## Overview

Budgets let users cap spending for a given period, optionally scoped to a category or label. Real-time progress is shown against actual transactions.

## Data Model

```
budgets
  id          uuid PK
  userId      uuid FK → users
  name        text
  amount      numeric > 0
  startDate   date
  endDate     date
  categoryId  uuid FK → categories  (optional — null = all categories)
  labelId     uuid FK → labels      (optional — null = all labels)
  isActive    boolean default true
  createdAt   timestamp
  updatedAt   timestamp
```

## Business Rules

- All budgets are **one-time** with an explicit `startDate` and `endDate` — no recurring period types (regression from v1)
- `spent` is computed at query time: `SUM(transactions.amount)` where `transactionDate` falls within `startDate` / `endDate` and filters match
- `remaining = amount - spent` (can go negative = over budget)
- Budgets can be filtered by `categoryId`, `labelId`, both, or neither (catches all)
- Budgets can be **duplicated**: creates a copy with a new date range (user sets new start/end), same name, amount, and filters

## Operations

| Operation | Endpoint |
|---|---|
| List | `GET /api/v1/budgets` |
| Create | `POST /api/v1/budgets` |
| Get one | `GET /api/v1/budgets/:id` |
| Update | `PUT /api/v1/budgets/:id` |
| Delete | `DELETE /api/v1/budgets/:id` |
| Duplicate | `POST /api/v1/budgets/:id/duplicate` | Body: `{ startDate, endDate }` |

## UI

- Budget list grouped by category (collapsible sections)
- Progress bar per budget (spent / amount)
- Color cues: green < 75%, orange 75–99%, red ≥ 100%

## Modals

### Create / Edit Budget
Fields:
- **Name** — text, required
- **Amount** — number, required, > 0
- **Start date** — date picker, required
- **End date** — date picker, required, must be > start date
- **Category** — optional select (single); if set, only transactions of that category count
- **Label** — optional select (single); stacks with category filter

Behavior:
- Edit pre-fills all fields from the existing budget
- Submitting closes the modal and refreshes the budget list

Error states:
- End date ≤ start date → inline error on end date field
- Amount ≤ 0 → inline error on amount field
- API failure → toast: "Failed to save budget. Please try again."

Actions: Save / Cancel

### Duplicate Budget
Pre-fills name, amount, category, label from the source budget.  
User must set new **Start date** and **End date** (the only required edits).

Actions: Duplicate / Cancel

### Delete Budget
Simple confirmation: "Delete [name]? This cannot be undone."  
No cascade effect — past transactions are unaffected.

Actions: Delete (destructive) / Cancel

## v2 — Budget Suggestions (scope 1: rule-based)

**Goal:** detect recurring transactions and propose a budget for them.

**Detection algorithm:**
1. For each `(categoryId, description_normalized)` group, count occurrences over the last 3–6 months
2. If a group appears ≥ 2 times in ≥ 2 distinct months → mark as recurring
3. Compute `avg_amount` and infer `periodType` from the gap between occurrences
4. Surface as a suggestion: "You spend ~€X/month on [category]. Create a budget?"

**Suggested budget object:**
```
{
  name: string           // e.g. "Netflix"
  suggestedAmount: number
  suggestedStartDate: date   // e.g. first day of next month
  suggestedEndDate: date     // e.g. last day of next month
  categoryId: uuid
  confidence: low|medium|high
  basedOnMonths: number
}
```

**User action:** accept (creates budget), edit amount, or dismiss.

## v2 — Budget Suggestions (scope 2: AI-powered)

Send anonymized transaction history (amounts + categories, no descriptions) to an LLM. Ask it to identify patterns, group by intent, and return budget suggestions with reasoning. Use rule-based suggestions as a baseline to validate against.

## v2 — Forecast View

**Goal:** show the user their projected financial state for the current month.

```
Forecast for April 2026
─────────────────────────────────────
Expected income         +€3,200
Expected fixed expenses  -€1,450  (from recurring budgets)
Variable spend to date   -€380
─────────────────────────────────────
Projected remaining      +€1,370
```

**Data sources:**
- Active budgets overlapping the current month → expected fixed expenses
- Income transactions from the last 3 months → avg expected income
- Current month transactions already logged → actual spend so far
- Remaining = expected income - expected fixed - actual variable
