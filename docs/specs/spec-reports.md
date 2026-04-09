# Feature Spec — Reports

## Overview

Read-only analytics views. No data entry — all charts are computed from existing transactions. Scoped to the authenticated user.

## Views

### 1. Spending by Category
- **Chart:** donut or bar
- **Data:** `SUM(amount) GROUP BY categoryId` for expenses, current period
- **Interaction:** click a category slice → drills down to show child categories or transaction list

### 2. Income vs Expenses over time
- **Chart:** grouped bar (income bar + expense bar per month)
- **Data:** `SUM(amount) GROUP BY month, type` for the selected date range
- **Shows:** net (income − expenses) as a line overlay

### 3. Account Balance History
- **Chart:** line chart per account
- **Data:** running balance over time, derived from transaction history
- **Shows:** one line per active account; toggle accounts on/off

### 4. Budget vs Actual
- **Chart:** horizontal bar per budget
- **Data:** `budget.amount` vs computed `spent`
- **Shows:** over-budget items highlighted in red

## Filters (global, apply to all views)

| Filter | Type | Default |
|---|---|---|
| Date range | preset picker (this month / last month / last 3 months / last 6 months / this year / custom) | current month |
| Account | multi-select | all |
| Category | multi-select | all |
| Transaction type | toggle: income / expense / both | both |

## Data Sources

All queries scoped to `userId` and filtered by `isDeleted = false`.

| View | Query |
|---|---|
| Spending by category | `SUM(amount) WHERE type='expense' GROUP BY categoryId` |
| Income vs expenses | `SUM(amount) GROUP BY DATE_TRUNC('month', transactionDate), type` |
| Balance history | running sum per account ordered by `transactionDate` |
| Budget vs actual | budgets JOIN computed `spent` |

## UI Page

| Route | Purpose |
|---|---|
| `/reports` | Single page, tabbed or sectioned by view type |

## Modals

No modals — reports are read-only. Interactions are:
- **Filter panel** — inline or collapsible sidebar, not a modal
- **Drill-down** — clicking a chart element filters the view in place (no new modal)
- **Export (v2)** — download current view as CSV; could be a simple button, no modal needed

## v2 Notes

- Add CSV export per view
- Consider a **custom date range** calendar picker (v1 only has presets)
- Balance history view is missing in v1 — worth adding in v2
- Chart library choice is open for v2 (Recharts used in v1)
