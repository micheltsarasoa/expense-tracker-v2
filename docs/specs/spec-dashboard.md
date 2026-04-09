# Feature Spec — Dashboard

## Overview

The landing page after login. Gives an at-a-glance view of the user's financial health: balances, recent activity, and budget status.

## Widgets

### 1. Account Balances
- Total balance (sum of all active accounts)
- Per-account balance cards
- Breakdown: checking / savings / credit / cash / other

### 2. Income vs Expense (current month)
- Total income this month
- Total expenses this month
- Net = income - expenses
- Displayed as stat cards + bar chart comparison

### 3. Recent Transactions
- Last 5–10 transactions
- Columns: date, description, category, amount
- Quick link to full transaction list

### 4. Budget Status
- Active budgets with progress bars
- Highlight over-budget items first
- Quick link to full budget list

### 5. Spending by Category (current month)
- Donut or bar chart
- Top N categories by spend

### 6. Monthly Trend
- Line or bar chart: net per month over last 6 months
- Shows income + expense bars side by side

## Data Sources

All data is scoped to the authenticated user.

| Widget | Source |
|---|---|
| Account balances | `payment_methods.currentBalance` |
| Income / expense | `SUM(transactions)` filtered by current month + type |
| Recent transactions | `transactions ORDER BY transactionDate DESC LIMIT 10` |
| Budget status | budgets + computed `spent` |
| Category breakdown | `SUM(transactions) GROUP BY categoryId` |
| Monthly trend | `SUM(transactions) GROUP BY month` last 6 months |

## UI Notes

- All widgets load in parallel (independent queries)
- Date scope selector: current month (default), last 30 days, current year
- Charts: Recharts (v1) — library choice open for v2
- Responsive grid layout: 2-col on desktop, 1-col on mobile

## v2 Notes

- Add **Forecast widget** (from budget suggestion spec) to the dashboard
- Mobile: same widgets, optimized for vertical scroll
- Consider skeleton loaders for each widget independently
