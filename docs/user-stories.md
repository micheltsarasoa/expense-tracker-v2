# User Stories — Expense Tracker v2

Format: `As a user, I want to [action] so that [outcome].`  
Acceptance criteria are listed as bullet points under each story.

---

## Authentication

**US-AUTH-01 — Register**
As a user, I want to create an account with my email and password so that my financial data is private and secure.
- I can enter my name, email, password, and confirm password
- I see a live password strength indicator
- I am shown an error if the email is already in use
- I am shown an error if passwords do not match
- On success, I am redirected to the dashboard with default settings applied

**US-AUTH-02 — Login**
As a user, I want to log in to my account so that I can access my data.
- I can enter my email and password
- I see a generic error if credentials are wrong (no hint about which field)
- I am redirected to the dashboard on success
- I am locked out after too many failed attempts with a clear message

**US-AUTH-03 — Logout**
As a user, I want to log out so that my account is protected on shared devices.
- Clicking logout clears my session and redirects me to the login page

**US-AUTH-04 — Protected routes**
As a user, I want to be redirected to login if my session expires so that I am never stuck on a broken state.
- Any visit to a protected route without a valid session redirects to `/login`

---

## Dashboard

**US-DASH-01 — Financial overview**
As a user, I want to see my total balance and income/expense summary for the current month on the dashboard so that I can assess my financial health at a glance.
- I see total balance across all active accounts
- I see total income and total expenses for the current month
- I see net = income − expenses

**US-DASH-02 — Recent transactions**
As a user, I want to see my latest transactions on the dashboard so that I don't have to navigate away to know what happened recently.
- The last 10 transactions are shown with date, description, category, and amount
- I can click through to the full transaction list

**US-DASH-03 — Budget status**
As a user, I want to see active budgets and their progress on the dashboard so that I can quickly spot overspending.
- Active budgets are shown with a progress bar (spent / amount)
- Over-budget items are highlighted first

**US-DASH-04 — Spending by category**
As a user, I want to see a breakdown of my spending by category for the current month so that I understand where my money goes.
- A chart shows top spending categories
- I can change the date scope (current month / last 30 days / current year)

**US-DASH-05 — Monthly trend**
As a user, I want to see my income and expenses over the last 6 months so that I can identify patterns over time.
- A chart shows income and expense bars side by side per month

**US-DASH-06 — Forecast (v2)**
As a user, I want to see a projected balance for the current month so that I can plan my spending before the month ends.
- I see expected income (avg of last 3 months), expected fixed expenses (from active budgets), actual spend so far, and projected remaining

---

## Transactions

**US-TRX-01 — Log an expense**
As a user, I want to record an expense so that my spending history is tracked.
- I can set amount, date, account, category, optional label, and optional description
- The account balance updates automatically after saving

**US-TRX-02 — Log income**
As a user, I want to record income so that my net balance is accurate.
- I can set amount, date, account, category, optional label, and description
- Category is filtered to income-type categories only

**US-TRX-03 — Log a transfer**
As a user, I want to record a transfer between two of my accounts so that both balances stay accurate.
- I select a source account and a destination account (must be different)
- No category is required
- Both account balances update automatically

**US-TRX-04 — Edit a transaction**
As a user, I want to correct a transaction I entered incorrectly so that my history stays accurate.
- All fields can be edited
- Account balances recalculate after saving

**US-TRX-05 — Delete a transaction**
As a user, I want to delete a transaction so that erroneous entries don't pollute my history.
- I am asked to confirm before deletion
- The transaction is soft-deleted; account balance recalculates

**US-TRX-06 — Validate a transaction**
As a user, I want to mark a transaction as validated so that I can track which entries I have reconciled with my bank.
- I can toggle validated status on any transaction
- The list can be filtered by validated / unvalidated

**US-TRX-07 — Filter transactions**
As a user, I want to filter my transaction list so that I can find specific entries quickly.
- I can filter by type, category, label, account, date range, and validated status
- Filters can be combined

**US-TRX-08 — Import transactions**
As a user, I want to import transactions from a CSV or Excel file so that I can bulk-load historical data.
- I can download a template with the required columns
- I upload a file and see a row-by-row validation preview before committing
- Valid rows are imported; invalid rows are skipped with a summary

---

## Budgets

**US-BDG-01 — Create a budget**
As a user, I want to create a budget for a specific period so that I can cap my spending.
- I set a name, amount, start date, end date, and optionally filter by category and/or label
- The budget appears in my list immediately

**US-BDG-02 — Monitor a budget**
As a user, I want to see how much of my budget I have used so that I know when I am close to the limit.
- Each budget shows a progress bar with spent amount, total, and remaining
- Color changes: green < 75%, orange 75–99%, red ≥ 100%

**US-BDG-03 — Edit a budget**
As a user, I want to adjust a budget's amount or dates so that it reflects my current plan.
- All fields except the derived `spent` value are editable

**US-BDG-04 — Duplicate a budget**
As a user, I want to duplicate a budget with new dates so that I don't have to recreate recurring configurations from scratch.
- The duplicate pre-fills all fields from the source; I only need to set new start and end dates

**US-BDG-05 — Delete a budget**
As a user, I want to delete a budget that is no longer relevant so that my list stays clean.
- I am asked to confirm; past transactions are not affected

**US-BDG-06 — Budget suggestions — rule-based (v2)**
As a user, I want the app to suggest budgets based on my recurring transaction patterns so that I don't have to manually identify my regular expenses.
- The app detects transactions that repeat ≥ 2 times across ≥ 2 months in the same category
- Each suggestion shows estimated amount, suggested dates, and a confidence level
- I can accept (creates the budget), edit the amount, or dismiss

**US-BDG-07 — Budget suggestions — AI-powered (scope 2 — deferred)**
As a user, I want AI-powered budget suggestions that group my spending by intent so that I get smarter recommendations than simple pattern matching.
- The app sends anonymized transaction history (no descriptions) to an LLM
- Suggestions include reasoning and are validated against rule-based results
- *Not in v2 scope. Deferred pending LLM provider selection.*

**US-BDG-08 — Forecast view (v2)**
As a user, I want to see a projected end-of-month balance so that I can make spending decisions with confidence.
- The forecast shows expected income, expected fixed expenses, variable spend to date, and projected remaining
- Data is derived from active budgets and the last 3 months of income history

---

## Categories

**US-CAT-01 — View categories**
As a user, I want to see all my categories organized by type so that I understand my classification structure.
- Income and expense categories are listed separately
- Parent and child categories are visually grouped

**US-CAT-02 — Create a category**
As a user, I want to create a custom category so that I can classify transactions in a way that matches my life.
- I set a name, type (income/expense), optional parent, icon, and color

**US-CAT-03 — Edit a category**
As a user, I want to rename or recolor a category so that I can keep my setup up to date.
- Type is locked if the category has linked transactions
- Default categories cannot be edited

**US-CAT-04 — Delete a category**
As a user, I want to delete a category I no longer use so that my list stays tidy.
- If the category has linked transactions, I must reassign them to another category before deletion
- Default categories cannot be deleted

---

## Labels

> Single label per transaction in v2. Many-to-many (M:N) is deferred to scope 2.

**US-LBL-01 — Create a label**
As a user, I want to create colored labels so that I can tag transactions with cross-cutting themes (e.g. "vacation", "reimbursable").
- I set a name and pick a color

**US-LBL-02 — Edit a label**
As a user, I want to rename or recolor a label so that it stays meaningful.

**US-LBL-03 — Delete a label**
As a user, I want to delete a label so that my list stays clean.
- Transactions that used the label are not deleted; their label is removed

---

## Accounts

**US-ACC-01 — Add an account**
As a user, I want to add a payment method with an initial balance so that all my accounts are tracked in one place.
- I set a name, type, initial balance, icon, and color
- The initial balance is set once at creation

**US-ACC-02 — Monitor account balances**
As a user, I want to see the current balance of each account so that I always know my real financial position.
- Balances update automatically after every transaction

**US-ACC-03 — Edit an account**
As a user, I want to rename or recolor an account so that it stays recognizable.
- Initial balance cannot be changed after creation

**US-ACC-04 — Deactivate an account**
As a user, I want to deactivate an account I no longer use so that it doesn't clutter my transaction forms but its history is preserved.
- Deactivated accounts are hidden from dropdowns but visible in history

---

## Reports

**US-RPT-01 — Spending by category**
As a user, I want to see how my spending breaks down by category for a given period so that I know where to cut back.
- A chart shows spending per category
- I can click a category to drill down into sub-categories or its transactions

**US-RPT-02 — Income vs expenses over time**
As a user, I want to see my income and expenses side by side per month so that I can track my financial trajectory.
- A grouped bar chart shows income and expense per month for the selected range
- A net line overlay shows the difference

**US-RPT-03 — Account balance history (v2)**
As a user, I want to see how each account balance evolved over time so that I can detect unusual movements.
- A line chart shows running balance per account
- I can toggle individual accounts on/off

**US-RPT-04 — Budget vs actual**
As a user, I want to compare my budgets against actual spending so that I can evaluate my planning accuracy.
- A horizontal bar per budget shows planned vs spent
- Over-budget items are highlighted

**US-RPT-05 — Filter reports**
As a user, I want to filter all report views by date range, account, and category so that I can focus on what matters.
- Global filters apply across all chart views simultaneously

**US-RPT-06 — Export reports (v2)**
As a user, I want to export a report view as CSV so that I can analyse my data in a spreadsheet.

---

## Settings

**US-SET-01 — Customize number format**
As a user, I want to set my preferred decimal and thousand separators so that amounts display the way I expect.

**US-SET-02 — Customize date format**
As a user, I want to set my preferred date format and time display (12h/24h) so that dates are readable to me.

**US-SET-03 — Customize currency**
As a user, I want to set my currency symbol and its position (before/after the amount) so that amounts are correctly labeled.

**US-SET-04 — Persist settings globally**
As a user, I want my formatting settings to apply everywhere in the app so that I never see inconsistent formatting.
- All amounts and dates across dashboard, transactions, budgets, and reports use my saved settings
