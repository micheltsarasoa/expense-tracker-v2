# Feature Spec — Budgets

## Overview

Budgets let users cap spending, optionally scoped to a category or label. A budget is either **monthly** (covers every calendar month from a start month) or **one-off** (explicit dates). Real-time progress is shown against actual transactions. Budgets never block a transaction.

Decision record: ADR-007 (supersedes ADR-002).

## Data Model

```
budgets
  id          uuid PK
  userId      uuid FK → users
  name        text (1–60)
  kind        enum(monthly, one_off)
  amount      numeric(15,2) > 0          — per month for monthly, total for one-off
  startDate   date                       — monthly: first day of the start month
  endDate     date (nullable)            — monthly: null = open-ended; one-off: required
  categoryId  uuid FK → categories  (optional — null = all categories)
  labelId     uuid FK → labels      (optional — null = all labels)
  isActive    boolean default true
  createdAt   timestamp
  updatedAt   timestamp
```

## Business Rules

- **Monthly** budgets cover whole calendar months. For a given month M, `spent(M) = SUM(expense amounts)` with `transactionDate` in M and filters matching. Nothing "resets": each month is computed at query time, so no background job is needed.
  - `startDate` is always the 1st of a month; a budget created on the 28th still covers that whole month.
  - At most one active monthly budget per (categoryId, labelId) pair for a user. Creating a second one → inline error with a link to edit the existing one.
- **One-off** budgets keep the explicit range: `startDate` and `endDate` required, `endDate ≥ startDate`. `spent` = SUM over the range.
- `remaining = amount - spent` (can go negative = over budget).
- Only the owner's expense rows count. Family transfers out count (they are the parent's spending); a child's wallet expenses never count.
- Budgets can be filtered by `categoryId`, `labelId`, both, or neither (catches all).
- **Duplicate** copies name, kind, amount and filters. One-off: the user sets new dates. Monthly: the user picks a different category or label (same pair would break uniqueness).

## Operations

| Operation | Endpoint                             |
| --------- | ------------------------------------ | ------------------------------------------------------------------------- |
| List      | `GET /api/v1/budgets?month=YYYY-MM`  |
| Create    | `POST /api/v1/budgets`               |
| Get one   | `GET /api/v1/budgets/:id`            |
| Update    | `PUT /api/v1/budgets/:id`            |
| Delete    | `DELETE /api/v1/budgets/:id`         |
| Duplicate | `POST /api/v1/budgets/:id/duplicate` | Body: one-off `{ startDate, endDate }`, monthly `{ categoryId, labelId }` |

## UI

- Monthly and one-off budgets shown in separate groups; the month switcher drives monthly figures.
- Progress per budget (spent / amount).
- Status: **On track** < 80 %, **Watch** 80–99 %, **Over** ≥ 100 % (warning colour, never destructive red).

## Modals

### Create / Edit Budget

Fields:

- **Name** — text, required (1–60); defaults to the category name
- **Kind** — radio: Monthly / One-off; locked when editing
- **Amount** — number, required, > 0 (label says "per month" for monthly)
- **Start month** (monthly) or **Start date** / **End date** (one-off)
- **End month** (monthly, optional — empty = no end)
- **Category** — optional select (single)
- **Label** — optional select (single); stacks with category filter

Behavior:

- Edit pre-fills all fields from the existing budget
- Submitting closes the modal and refreshes the budget list

Error states:

- One-off: end date < start date → inline error on end date field
- Monthly: duplicate (category, label) pair → inline error + "Edit it" link
- Amount ≤ 0 → inline error on amount field
- API failure → toast: "Failed to save budget. Please try again."

Actions: Save / Cancel

### Duplicate Budget

Pre-fills name, kind, amount, category, label from the source budget.
One-off: user must set new **Start date** and **End date**. Monthly: user must change **Category** or **Label**.

Actions: Duplicate / Cancel

### Delete Budget

Your own data, so no confirmation dialog: deleting is immediate with a toast "Deleted [name] · Undo" (Ledger rule).
No cascade effect — past transactions are unaffected.

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
  id: string; // deterministic hash of (userId, categoryId, normalizedDescription)
  name: string; // normalizedDescription, title-cased (e.g. "Netflix")
  suggestedAmount: number; // avgAmount in cents
  suggestedStartDate: string; // YYYY-MM-DD, first day of next month
  suggestedEndDate: string; // YYYY-MM-DD, last day of next month
  categoryId: string;
  categoryName: string;
  confidence: 'low' | 'medium' | 'high';
  basedOnMonths: number; // distinctMonths count
  basedOnTransactions: number; // totalOccurrences count
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
