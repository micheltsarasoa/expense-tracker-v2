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

```
Input:  transactions for the authenticated user, last 6 months
Output: list of SuggestedBudget objects

1. Normalize descriptions
   - Lowercase, strip punctuation, collapse whitespace
   - e.g. "NETFLIX.COM/123" → "netflix"

2. Group transactions by (categoryId, normalizedDescription)

3. For each group:
   a. Collect the distinct calendar months that contain ≥ 1 transaction
   b. If distinctMonths < 2 → skip (not enough history)
   c. If totalOccurrences < 2 → skip
   d. Compute avgAmount = mean of all amounts in the group (cents)
   e. Ignore groups where avgAmount < 100 (< €1.00) — noise filter

4. Compute confidence:
   - distinctMonths ≥ 5 → high
   - distinctMonths ≥ 3 → medium
   - distinctMonths = 2 → low

5. Infer suggested date range:
   - suggestedStartDate = first day of next calendar month
   - suggestedEndDate   = last day of next calendar month

6. De-duplicate: if an active budget already covers the same (categoryId, next month)
   → skip that group (don't suggest what already exists)

7. Sort output: high confidence first, then by avgAmount DESC
```

**Suggested budget object:**
```ts
{
  id: string             // deterministic hash of (userId, categoryId, normalizedDescription)
  name: string           // normalizedDescription, title-cased (e.g. "Netflix")
  suggestedAmount: number        // avgAmount in cents
  suggestedStartDate: string     // YYYY-MM-DD, first day of next month
  suggestedEndDate: string       // YYYY-MM-DD, last day of next month
  categoryId: string
  categoryName: string
  confidence: 'low' | 'medium' | 'high'
  basedOnMonths: number          // distinctMonths count
  basedOnTransactions: number    // totalOccurrences count
}
```

**Dismissal:** dismissed suggestions are stored (userId + suggestion id) and excluded from future runs.

**Refresh:** suggestions are recomputed on demand (`GET /api/v1/budgets/suggestions`) — not cached long-term.

**User actions per suggestion:** Accept (creates budget with suggested values, pre-filled in modal) · Edit amount (opens create modal pre-filled) · Dismiss (hides permanently).

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
