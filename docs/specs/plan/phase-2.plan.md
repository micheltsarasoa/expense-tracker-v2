# Design Specification — Expense Tracker v2

## Context

Phase 5 (API & backend) is complete and merged. Before building the UI (Phase 6), a design specification needs to be written so Figma work can begin in parallel. This document — `docs/design.md` — is a Figma brief: it describes every screen, every component, every state, and every interaction the designer needs to produce hi-fi mocks.

The file to create: **`docs/design.md`**

---

## What the file will contain

Based on all 7 feature specs, the DB schema, the Zod schemas, and the UI stack, here is the complete outline with enough detail to execute directly.

---

### Section 1 — App Overview

- **Product**: Personal finance tracker — track income, expenses, and transfers across multiple accounts
- **User**: Solo personal user (not multi-org); one person, multiple accounts, one currency preference
- **Tone**: Clean, minimal, trustworthy — data density with clear visual hierarchy
- **Font**: Geist (already configured in `apps/web/app/layout.tsx`)
- **Component library**: shadcn/ui + Tailwind v4 tokens

---

### Section 2 — Information Architecture

**Navigation (7 top-level sections + auth):**

```
Public:
  /login          Sign in
  /register       Create account

Protected (sidebar):
  /dashboard      Overview
  /transactions   All transactions + import
  /budgets        Budget management
  /accounts       Payment method management
  /categories     Category tree
  /labels         Label list
  /reports        Analytics (4 views)
  /settings       Display preferences
```

**Layout Shell:**

- Desktop (≥1024px): Fixed left sidebar (240px) + scrollable main area
- Tablet (768–1023px): Collapsible sidebar (icon-only or off-canvas)
- Mobile (<768px): Bottom tab bar (5 tabs: Dashboard, Transactions, Budgets, Reports, More)

---

### Section 3 — Design Tokens

**Colors (shadcn/ui + semantic overrides in Tailwind v4 `@theme`):**

| Token                 | Purpose                | Suggested value |
| --------------------- | ---------------------- | --------------- |
| `--color-primary`     | CTAs, active nav       | Blue 600        |
| `--color-income`      | Income amounts/badges  | Emerald 600     |
| `--color-expense`     | Expense amounts/badges | Rose 600        |
| `--color-transfer`    | Transfer type          | Violet 600      |
| `--color-budget-safe` | Budget progress <75%   | Emerald 500     |
| `--color-budget-warn` | Budget 75–99%          | Amber 500       |
| `--color-budget-over` | Budget ≥100%           | Rose 600        |
| `--color-muted`       | Inactive / disabled    | Gray 400        |

**Typography (Geist, Tailwind v4 scale):**

| Role             | Class                              | Size |
| ---------------- | ---------------------------------- | ---- |
| Page title       | `text-2xl font-semibold`           | 24px |
| Section heading  | `text-lg font-semibold`            | 18px |
| Card title       | `text-base font-medium`            | 16px |
| Body             | `text-sm`                          | 14px |
| Caption / helper | `text-xs text-muted-foreground`    | 12px |
| Amount (large)   | `text-2xl font-bold tabular-nums`  | 24px |
| Amount (inline)  | `text-sm font-medium tabular-nums` | 14px |

**Border radius:** `--radius: 0.5rem` (shadcn/ui default)

**Shadows:** `shadow-sm` for cards, `shadow-md` for modals

---

### Section 4 — Component Inventory

**shadcn/ui components to install:**

| Component                                           | Used on                              |
| --------------------------------------------------- | ------------------------------------ |
| Button (default, outline, ghost, destructive, icon) | Everywhere                           |
| Input                                               | All forms                            |
| Textarea                                            | Transaction description              |
| Select                                              | Category, label, account dropdowns   |
| Combobox                                            | Same — with search                   |
| Dialog                                              | Create/Edit/Delete modals            |
| Sheet                                               | Mobile drawer                        |
| Table                                               | Transactions, import preview         |
| Card                                                | Dashboard widgets, budgets, accounts |
| Badge                                               | Transaction type, validated status   |
| Progress                                            | Budget bars                          |
| Tabs                                                | Reports views                        |
| Form + FormField                                    | All forms                            |
| Calendar / DatePicker                               | Date fields                          |
| Avatar                                              | User menu                            |
| DropdownMenu                                        | Row actions, user menu               |
| Toast / Sonner                                      | Success/error feedback               |
| Skeleton                                            | Loading states                       |
| Chart (Bar, Line, Pie/Donut, Horizontal bar)        | Dashboard + Reports                  |
| Command                                             | Search/filter                        |
| Pagination                                          | Transaction list                     |
| Separator                                           | Sidebar sections                     |
| Tooltip                                             | Icon buttons                         |

**Custom components:**

| Component             | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| `AmountInput`         | Numeric input with live currency formatting, always positive                     |
| `TransactionTypeTabs` | Icon+label toggle: Income / Expense / Transfer                                   |
| `ColorPicker`         | Swatch grid for category/label color                                             |
| `BalanceCard`         | Account card: name, type icon, balance, active badge                             |
| `BudgetCard`          | Budget card: name, progress bar (colored by %), spent/remaining, date range      |
| `TransactionRow`      | Table row: date, type badge, amount (colored), account, category, label, actions |
| `EmptyState`          | Illustration + heading + optional CTA button                                     |
| `StatCard`            | Dashboard stat: label, value, optional trend arrow + %                           |

---

### Section 5 — Page Specifications

#### Auth — Login (`/login`)

- Centered card (max-w-sm), full-height viewport
- Logo + "Sign in" heading
- Fields: Email, Password
- CTA: "Sign in" (full-width primary button)
- Footer link: "Don't have an account? Register"
- No social logins, no "forgot password" in v2

#### Auth — Register (`/register`)

- Same centered card layout
- Fields: Full name, Email, Password, Confirm password
- Password rules shown as helper text (8+ chars, 1 upper, 1 lower, 1 number, 1 special)
- CTA: "Create account"
- Footer link: "Already have an account? Sign in"

---

#### Dashboard (`/dashboard`)

**Header:** Page title "Dashboard" + date scope selector (dropdown: Current month / Last 30 days / Current year)

**Widget grid (2-col desktop, 1-col mobile):**

| Widget               | Size       | Content                                                              |
| -------------------- | ---------- | -------------------------------------------------------------------- |
| Account Balances     | Full width | List of `BalanceCard` for each active account + total                |
| Income vs Expense    | Half       | Two `StatCard`: total income (green) + total expense (red) for scope |
| Recent Transactions  | Full width | `TransactionRow` × 5–10, "View all" link                             |
| Budget Status        | Half       | List of budget progress bars                                         |
| Spending by Category | Half       | Donut chart + top 5 categories legend                                |
| Monthly Trend        | Full width | Bar chart, last 6 months, income + expense grouped bars              |

**States:**

- Loading: `Skeleton` per widget
- Empty (no transactions): show illustration + "Add your first transaction" CTA

---

#### Transactions (`/transactions`)

**Header:** "Transactions" title + "Add transaction" button (primary)

**Filter bar (horizontal, collapsible on mobile):**

- Type: All / Income / Expense / Transfer (segmented or select)
- Category: Select with search
- Label: Select
- Account: Select
- Date range: DatePicker (from → to)
- Validated: All / Validated / Unvalidated (select)
- Reset filters button

**Table columns:** Date | Type (badge) | Description | Amount | Account | Category | Label | Validated | Actions

**Amount display:** Income = emerald, Expense = rose, Transfer = violet; always positive with ± prefix

**Row actions (dropdown):** Edit | Toggle validated | Delete

**Pagination:** page size 20, prev/next + page indicator

**Empty states:**

- No transactions: illustration + "Add your first transaction"
- No results for filter: "No transactions match your filters" + Reset button

**Modals (Dialog):**

_Create / Edit Transaction:_

- Step 1 header: `TransactionTypeTabs` (Income / Expense / Transfer)
- Fields per type:
  - Income: Amount, Date, Account (from), Category, Label, Description
  - Expense: Amount, Date, Account (from), Category, Label, Description
  - Transfer: Amount, Date, Account (from), Account (to), Label, Description
- Validation: inline field errors
- CTA: "Save" (disabled until valid)

_Delete confirmation:_

- "Delete transaction?" + amount + date
- Destructive CTA + Cancel

_Import (3-step):_

- Step 1 — Upload: Drag & drop zone + "or click to browse", accepted: `.csv`, `.xlsx`. Download template link.
- Step 2 — Preview: Table of all rows, each row shows valid (green check) / invalid (red X + error messages). Row count summary: "42 valid, 3 invalid". CTA: "Import 42 transactions"
- Step 3 — Result: Success icon, "42 imported, 3 skipped" + optional list of skipped rows. Done button.

---

#### Budgets (`/budgets`)

**Header:** "Budgets" + "Add budget" button

**Content:** Card grid (3-col desktop, 2-col tablet, 1-col mobile)

Each `BudgetCard`:

- Name (bold)
- Date range (caption)
- Category badge (optional, colored)
- Amount: `€500.00`
- Progress bar (colored by %: green / amber / rose)
- Spent / Remaining: `€320.00 spent · €180.00 remaining`
- Actions menu: Edit | Duplicate | Delete

**Empty state:** "No budgets yet" + Add button

**Modals:**

_Create / Edit Budget:_

- Fields: Name, Amount, Start date, End date (optional), Category filter (optional), Label filter (optional)
- Refine: end date > start date inline validation

_Duplicate Budget:_

- Minimal: just Start date + End date fields (name/amount copied automatically)
- Caption: "Copying budget: [name]"

_Delete confirmation:_ "Delete [name]?" — destructive

---

#### Accounts (`/accounts`)

**Header:** "Accounts" + "Add account" button

**Content:** Card list (not grid — accounts need space for balance)

Each `BalanceCard`:

- Icon (type-based Lucide icon) + Name
- Type label (e.g. "Checking account")
- Current balance (large, colored: positive = emerald, negative = rose)
- Inactive badge (if isActive = false)
- Actions: Edit | Deactivate / Delete

**Account type icons (Lucide):**

- cash → `Banknote`
- bank_account → `Building2`
- credit_card → `CreditCard`
- debit_card → `Card`
- digital_wallet → `Wallet`
- other → `CircleDollarSign`

**Empty state:** "No accounts yet" + Add button

**Modals:**

_Create Account:_

- Fields: Name, Type (select), Initial balance, Icon (optional), Color (optional `ColorPicker`)

_Edit Account:_

- Fields: Name, Icon, Color (cannot edit type or initial balance)

_Deactivate / Delete:_

- If transactions exist: "This account has transactions. It will be deactivated." — "Deactivate" CTA
- If no transactions: "Delete account?" — destructive CTA

---

#### Categories (`/categories`)

**Header:** "Categories" + "Add category" button

**Content:** Two sections side-by-side (desktop) or stacked (mobile): "Income" | "Expense"

Each section:

- System defaults first (read-only, lock icon, muted background)
- User categories: tree view — parent with expandable children
- Each row: color dot + name + (if system) "System" badge + actions (Edit | Delete)
- Subcategories indented with line connector

**Add category modal:**

- Fields: Name, Type (Income/Expense), Parent category (optional — dropdown of root categories of same type), Icon, Color

---

#### Labels (`/labels`)

**Header:** "Labels" + "Add label" button

**Content:** Simple list — color dot + name + actions (Edit | Delete)

**Inline create/edit** (no modal): row expands with name input + color picker + Save / Cancel

**Empty state:** "No labels yet" + Add button

---

#### Reports (`/reports`)

**Header:** "Reports"

**Global filter bar:**

- Date range (from / to) — default: current month
- Account (multi-select or "All")
- Category (select or "All")

**View selector:** 4 tabs:

1. Spending by Category
2. Income vs Expenses
3. Balance History
4. Budget vs Actual

**Tab 1 — Spending by Category:**

- Donut chart (top 6 + "Other")
- Right: breakdown table (category name, amount, % of total)
- Color-coded by category color (or auto-assigned)

**Tab 2 — Income vs Expenses:**

- Grouped bar chart — one group per month (X-axis), two bars per group (income=emerald, expense=rose)
- Net line overlay (income−expense, violet)
- Summary row below: total income, total expense, net

**Tab 3 — Balance History:**

- Line chart — one line per account (each account a different color)
- X-axis: dates, Y-axis: balance
- Tooltip: date + balance per account

**Tab 4 — Budget vs Actual:**

- Horizontal progress bars (one per budget)
- Each row: budget name, horizontal bar (spent vs amount), `€spent / €amount (X%)`
- Color: green <75%, amber 75–99%, rose ≥100%

---

#### Settings (`/settings`)

**Layout:** Single-column centered form (max-w-lg)

**Sections:**

1. Currency — Symbol (text input, max 3), Position (Before/After toggle)
2. Number format — Decimal separator, Thousand separator (must differ — inline validation)
3. Date format — Select: DD/MM/YYYY | MM/DD/YYYY | YYYY-MM-DD
4. Time format — Toggle: 12h | 24h

**Live preview panel** (below form): "Your amounts and dates will look like: **€1.234,56** on **14/04/2026 at 14:30**"

**CTA:** "Save changes" (primary, full width)

---

### Section 6 — Key User Flows

**Add an expense:**

1. Click "Add transaction" (any page)
2. Modal opens → "Expense" tab selected by default
3. Fill: Amount → Date → Account → Category → (optional) Label, Description
4. Submit → toast "Transaction saved" → list refreshes

**Import transactions:**

1. Transactions page → "Import" button (secondary)
2. Step 1: Download template link → fill → drag & drop file
3. Step 2: Preview table with per-row valid/invalid status → "Import 42 transactions"
4. Step 3: Result summary → Done

**Create a budget:**

1. Budgets page → "Add budget"
2. Fill: Name, Amount, Start date, End date
3. Optional: filter by Category or Label
4. Submit → new card appears in grid

---

### Section 7 — Common UI States

Every data-fetching view must have designs for:

| State                      | Treatment                                     |
| -------------------------- | --------------------------------------------- |
| Loading                    | `Skeleton` (same shape as loaded content)     |
| Empty (no data)            | Illustration + heading + optional CTA         |
| Error                      | Inline error card with message + "Retry"      |
| Success (mutation)         | `Sonner` toast, bottom-right, auto-dismiss 3s |
| Confirmation (destructive) | `Dialog` — destructive button + cancel        |

---

### Section 8 — Data Display Conventions

These must be consistent across every screen:

| Data type                | Display rule                                                        |
| ------------------------ | ------------------------------------------------------------------- |
| Amount — income          | Emerald text, `+€1,234.56` (or per settings)                        |
| Amount — expense         | Rose text, `-€234.00`                                               |
| Amount — transfer        | Violet text, `€500.00`                                              |
| Amount — account balance | Color by sign (positive = emerald, negative = rose, zero = muted)   |
| Date                     | Formatted per user settings (default: DD/MM/YYYY)                   |
| Transaction type         | Badge with icon: ↑ Income / ↓ Expense / ↔ Transfer                  |
| Validated                | `CheckCircle` icon badge (muted = unvalidated, emerald = validated) |
| Inactive account         | Muted opacity + "Inactive" badge                                    |
| System category          | Lock icon + slightly muted, no edit/delete actions                  |

---

### Section 9 — Iconography

Use **Lucide** (included with shadcn/ui). Key assignments:

| Concept           | Icon              |
| ----------------- | ----------------- |
| Dashboard         | `LayoutDashboard` |
| Transactions      | `ArrowLeftRight`  |
| Budgets           | `Target`          |
| Accounts          | `Wallet`          |
| Categories        | `Tag`             |
| Labels            | `Tags`            |
| Reports           | `BarChart3`       |
| Settings          | `Settings`        |
| Add / New         | `Plus`            |
| Edit              | `Pencil`          |
| Delete            | `Trash2`          |
| Import            | `Upload`          |
| Download template | `Download`        |
| Validated         | `CheckCircle`     |
| Transfer          | `ArrowLeftRight`  |
| Income            | `TrendingUp`      |
| Expense           | `TrendingDown`    |
| Duplicate         | `Copy`            |

---

## Critical Files

| File                      | Action                                            |
| ------------------------- | ------------------------------------------------- |
| `docs/design.md`          | **Create** — the output of this task              |
| `docs/specs/*.md`         | Read-only references (all data sourced from here) |
| `apps/web/app/layout.tsx` | Font reference (Geist confirmed)                  |

## Verification

1. Every screen listed in the spec corresponds to a route in the app
2. Every form field maps to a field in the Zod schema
3. Every badge/color maps to a DB enum value
4. Designer can open `docs/design.md` and have enough detail to produce hi-fi mocks without asking engineering questions
