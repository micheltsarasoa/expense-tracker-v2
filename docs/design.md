# Design Specification — Expense Tracker v2

> **Purpose**: Figma brief for UI/UX design. Every screen, component, state, and interaction the designer needs to produce hi-fi mocks — derived directly from the feature specs, DB schema, and Zod schemas.

---

## 1. App Overview

| Property          | Value                                                                               |
| ----------------- | ----------------------------------------------------------------------------------- |
| Product           | Personal finance tracker — income, expenses, and transfers across multiple accounts |
| User              | Solo personal user; one person, multiple accounts, one currency preference          |
| Tone              | Clean, minimal, trustworthy — data density with clear visual hierarchy              |
| Font              | **Geist** (configured in `apps/web/app/layout.tsx`)                                 |
| Component library | shadcn/ui + Tailwind v4 design tokens                                               |
| Chart library     | shadcn/ui Charts (Recharts + Tailwind v4 tokens)                                    |
| Icon library      | **Lucide** (ships with shadcn/ui)                                                   |

---

## 2. Information Architecture

### Navigation tree

```
Public
  /login          Sign in
  /register       Create account

Protected (requires auth)
  /dashboard      Overview
  /transactions   Transaction list + import
  /budgets        Budget management
  /accounts       Payment method management
  /categories     Category tree
  /labels         Label list
  /reports        Analytics (4 views)
  /settings       Display preferences
```

### Layout shell

| Breakpoint        | Layout                                                              |
| ----------------- | ------------------------------------------------------------------- |
| Desktop ≥ 1024px  | Fixed left sidebar (240px) + scrollable main area                   |
| Tablet 768–1023px | Collapsible sidebar (icon-only or off-canvas)                       |
| Mobile < 768px    | Bottom tab bar: Dashboard / Transactions / Budgets / Reports / More |

---

## 3. Design Tokens

### Color palette

Define these semantic tokens in the Tailwind v4 `@theme` block (exact hex values are the designer's decision; the roles below are fixed):

| Token                 | Role                                | Suggested base |
| --------------------- | ----------------------------------- | -------------- |
| `--color-primary`     | CTAs, active nav item, links        | Blue 600       |
| `--color-income`      | Income amounts, badges, chart bars  | Emerald 600    |
| `--color-expense`     | Expense amounts, badges, chart bars | Rose 600       |
| `--color-transfer`    | Transfer type, chart lines          | Violet 600     |
| `--color-budget-safe` | Budget progress < 75%               | Emerald 500    |
| `--color-budget-warn` | Budget progress 75–99%              | Amber 500      |
| `--color-budget-over` | Budget progress ≥ 100%              | Rose 600       |
| `--color-muted`       | Inactive, disabled, helper text     | Gray 400       |

shadcn/ui's CSS variables (`--background`, `--foreground`, `--card`, `--border`, `--destructive`, etc.) remain as configured.

### Typography scale

| Role                   | Tailwind classes                   | Size |
| ---------------------- | ---------------------------------- | ---- |
| Page title             | `text-2xl font-semibold`           | 24px |
| Section heading        | `text-lg font-semibold`            | 18px |
| Card title             | `text-base font-medium`            | 16px |
| Body                   | `text-sm`                          | 14px |
| Caption / helper       | `text-xs text-muted-foreground`    | 12px |
| Amount — large display | `text-2xl font-bold tabular-nums`  | 24px |
| Amount — inline        | `text-sm font-medium tabular-nums` | 14px |

### Shape & elevation

| Property        | Value                                  |
| --------------- | -------------------------------------- |
| Border radius   | `--radius: 0.5rem` (shadcn/ui default) |
| Card elevation  | `shadow-sm`                            |
| Modal elevation | `shadow-md`                            |

---

## 4. Component Inventory

### shadcn/ui components required

| Component                                                       | Used on                                      |
| --------------------------------------------------------------- | -------------------------------------------- |
| `Button` — variants: default, outline, ghost, destructive, icon | Everywhere                                   |
| `Input`                                                         | All forms                                    |
| `Textarea`                                                      | Transaction description                      |
| `Select`                                                        | Category, label, account dropdowns           |
| `Combobox`                                                      | Same as Select, with search                  |
| `Dialog`                                                        | Create / Edit / Delete / Duplicate modals    |
| `Sheet`                                                         | Mobile drawer navigation                     |
| `Table`                                                         | Transactions list, import preview            |
| `Card`                                                          | Dashboard widgets, budgets, accounts         |
| `Badge`                                                         | Transaction type, validated status, inactive |
| `Progress`                                                      | Budget progress bars                         |
| `Tabs`                                                          | Reports view switcher                        |
| `Form` + `FormField`                                            | All forms                                    |
| `Calendar` / `DatePicker`                                       | Date fields                                  |
| `Avatar`                                                        | User menu                                    |
| `DropdownMenu`                                                  | Row actions, user menu                       |
| `Sonner` (Toast)                                                | Success / error feedback                     |
| `Skeleton`                                                      | Loading states                               |
| `Chart` — Bar, Line, Pie/Donut, Horizontal bar                  | Dashboard + Reports                          |
| `Command`                                                       | Search and filter with keyboard navigation   |
| `Pagination`                                                    | Transaction list                             |
| `Separator`                                                     | Sidebar section dividers                     |
| `Tooltip`                                                       | Icon-only buttons                            |

### Custom components

| Component             | Description                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `AmountInput`         | Numeric input, always positive; applies live currency formatting from user settings                                        |
| `TransactionTypeTabs` | Icon + label three-way toggle: ↑ Income / ↓ Expense / ↔ Transfer                                                           |
| `ColorPicker`         | Swatch grid (12–16 preset hex colors) for category and label color                                                         |
| `BalanceCard`         | Account card: type icon + name + type label + balance (colored by sign) + inactive badge                                   |
| `BudgetCard`          | Budget card: name + date range + category badge + amount + progress bar + spent/remaining                                  |
| `TransactionRow`      | Table row: date + type badge + description + amount (colored) + account + category + label + validated icon + actions menu |
| `EmptyState`          | Illustration + heading + body copy + optional CTA button                                                                   |
| `StatCard`            | Single-metric card: label + value + optional trend arrow + percentage                                                      |

---

## 5. Page Specifications

### Auth — Sign in (`/login`)

- **Layout**: Centered card (`max-w-sm`), full-height viewport with subtle background
- Logo mark + "Sign in to Expense Tracker" heading
- Fields: Email, Password (show/hide toggle)
- CTA: "Sign in" — full-width primary button
- Footer link: "Don't have an account? Create one"
- No social logins, no "Forgot password" in v2

### Auth — Register (`/register`)

- Same centered card layout as login
- Fields: Full name, Email, Password, Confirm password
- Helper text below Password: "8+ characters, 1 uppercase, 1 lowercase, 1 number, 1 special character"
- CTA: "Create account" — full-width primary
- Footer link: "Already have an account? Sign in"

---

### Dashboard (`/dashboard`)

**Header bar**: "Dashboard" page title + **Date scope selector** (dropdown right-aligned):

- Current month _(default)_
- Last 30 days
- Current year

**Widget grid** — 2-column desktop, 1-column mobile:

| Widget               | Grid span  | Component             | Content                                                         |
| -------------------- | ---------- | --------------------- | --------------------------------------------------------------- |
| Account Balances     | Full width | `BalanceCard` list    | All active accounts + grand total row                           |
| Income this period   | Half       | `StatCard`            | Total income, emerald, trend vs previous period                 |
| Expenses this period | Half       | `StatCard`            | Total expenses, rose, trend vs previous period                  |
| Recent Transactions  | Full width | `TransactionRow` × 10 | Date + type + description + amount; "View all →" footer link    |
| Budget Status        | Half       | Progress list         | Budget name + progress bar (colored) + % label                  |
| Spending by Category | Half       | Donut chart           | Top 5 categories + "Other" slice; legend list below             |
| Monthly Trend        | Full width | Grouped bar chart     | Last 6 months, income (emerald) + expense (rose) bars per month |

**States**:

- Loading → `Skeleton` per widget (same shape as populated state)
- No transactions yet → `EmptyState` with "Add your first transaction" CTA in the Recent Transactions and Spending widgets

---

### Transactions (`/transactions`)

**Header**: "Transactions" + "Add transaction" button (primary, right) + "Import" button (outline, right)

**Filter bar** — horizontal, collapsible to a "Filters" button on mobile:

| Filter     | Control                                                           |
| ---------- | ----------------------------------------------------------------- |
| Type       | Segmented: All / Income / Expense / Transfer                      |
| Category   | Combobox                                                          |
| Label      | Select                                                            |
| Account    | Select                                                            |
| Date range | Dual DatePicker (from → to)                                       |
| Validated  | Select: All / Validated / Unvalidated                             |
| —          | "Reset filters" ghost button (shown only when filters are active) |

**Table**:

| Column      | Notes                                                |
| ----------- | ---------------------------------------------------- |
| Date        | Formatted per user settings                          |
| Type        | Badge with icon (↑ emerald / ↓ rose / ↔ violet)      |
| Description | Truncated, gray if empty                             |
| Amount      | Colored by type, `tabular-nums`, always positive     |
| Account     | Account name                                         |
| Category    | Category name + color dot; blank for transfers       |
| Label       | Label name + color dot; blank if none                |
| Validated   | `CheckCircle` icon (emerald = validated, gray = not) |
| Actions     | `DropdownMenu`: Edit \| Toggle validated \| Delete   |

**Pagination**: 20 rows per page; prev / next arrows + "Page X of Y"

**Empty states**:

- No transactions at all → `EmptyState`: illustration + "No transactions yet" + "Add transaction" CTA
- Active filters return zero rows → `EmptyState`: "No transactions match your filters" + "Reset filters" link

---

#### Modal — Create / Edit Transaction

- **Header**: "New Transaction" or "Edit Transaction"
- **Type selector**: `TransactionTypeTabs` at top — clicking a tab changes which fields appear below
- **Fields by type**:

| Field          | Income | Expense | Transfer |
| -------------- | ------ | ------- | -------- |
| Amount         | ✓      | ✓       | ✓        |
| Date           | ✓      | ✓       | ✓        |
| Account (from) | ✓      | ✓       | ✓        |
| Account (to)   | —      | —       | ✓        |
| Category       | ✓      | ✓       | —        |
| Label          | ✓      | ✓       | ✓        |
| Description    | ✓      | ✓       | ✓        |

- Inline field-level validation errors below each input
- "Save" button disabled until form is valid; shows spinner while submitting

#### Modal — Delete Transaction

- Destructive Dialog: "Delete this transaction?" + amount + date shown as context
- "Delete" (destructive) + "Cancel" (ghost)

#### Modal — Import (3-step Dialog)

**Step 1 — Upload**

- Step indicator: ① Upload ② Preview ③ Done
- Drag-and-drop zone: dashed border, upload icon, "Drop CSV or Excel file here" / "or click to browse"
- Accepted formats: `.csv`, `.xlsx`
- Download template link below zone: ↓ "Download import template"

**Step 2 — Preview**

- Summary bar: "42 valid rows · 3 invalid rows"
- Scrollable table: row number + all columns + status column (✓ green / ✗ red + error message)
- Invalid rows highlighted with rose background row
- CTA: "Import 42 transactions" (disabled if 0 valid rows) + "Back" ghost button

**Step 3 — Done**

- Success icon (large checkmark, emerald)
- "42 transactions imported"
- If skipped rows: collapsible list "3 rows were skipped" with error details
- "Done" button (closes modal)

---

### Budgets (`/budgets`)

**Header**: "Budgets" + "Add budget" button

**Content**: Card grid — 3 columns desktop, 2 tablet, 1 mobile

**`BudgetCard` anatomy**:

```
┌─────────────────────────────────┐
│ [Category badge]       [Actions]│
│ Name                            │
│ 1 Apr – 30 Apr 2026             │
│                                 │
│ ████████████░░░░░  64%          │
│ €320.00 spent · €180.00 left    │
│                    of €500.00   │
└─────────────────────────────────┘
```

Progress bar color: emerald < 75%, amber 75–99%, rose ≥ 100%

Actions menu: Edit | Duplicate | Delete

**Empty state**: "No budgets yet" + "Add budget" CTA

#### Modal — Create / Edit Budget

Fields: Name, Amount (`AmountInput`), Start date, End date (optional), Category (optional Combobox), Label (optional Select)

Inline validation: "End date must be after start date" shown below End date field if violated

#### Modal — Duplicate Budget

- Compact dialog, header: "Duplicate — [budget name]"
- Fields: Start date only (required), End date (optional)
- Helper text: "Name, amount, and filters will be copied from the original."
- CTA: "Duplicate"

#### Modal — Delete Budget

"Delete [name]?" — destructive button + Cancel

---

### Accounts (`/accounts`)

**Header**: "Accounts" + "Add account" button

**Content**: Vertical list of `BalanceCard` (not grid — accounts need horizontal space for balance)

**`BalanceCard` anatomy**:

```
┌──────────────────────────────────────────────┐
│ [Icon]  Name                 [Inactive badge]│
│         Checking account                     │
│                              €2,450.00       │
│                              [Actions menu]  │
└──────────────────────────────────────────────┘
```

Account type → icon mapping:

| Type             | Lucide icon        |
| ---------------- | ------------------ |
| `cash`           | `Banknote`         |
| `bank_account`   | `Building2`        |
| `credit_card`    | `CreditCard`       |
| `debit_card`     | `Card`             |
| `digital_wallet` | `Wallet`           |
| `other`          | `CircleDollarSign` |

Balance color: emerald if positive, rose if negative, muted if zero

Actions: Edit | Deactivate (or Delete)

**Empty state**: "No accounts yet" + "Add account" CTA

#### Modal — Create Account

Fields: Name, Type (Select — 6 options), Initial balance (`AmountInput`), Icon (optional — icon picker or text), Color (optional `ColorPicker`)

Note: Initial balance is immutable after creation — show helper text: "Cannot be changed after saving."

#### Modal — Edit Account

Fields: Name, Icon, Color only. Type and initial balance are displayed as read-only text.

#### Modal — Deactivate / Delete

Conditional copy, determined by API response:

- Has transactions → "This account has transactions and cannot be deleted. It will be marked as inactive." — "Deactivate" (primary) + Cancel
- No transactions → "Delete [name]?" — Destructive + Cancel

---

### Categories (`/categories`)

**Header**: "Categories" + "Add category" button

**Content**: Two sections side-by-side on desktop, stacked on mobile:

- **Income** (left)
- **Expense** (right)

Each section header: section title + item count

Each category row:

```
[Color dot] [Icon?] Name                    [Actions]
  └── [Color dot]  Subcategory name         [Actions]
  └── [Color dot]  Subcategory name         [Actions]
```

- System defaults: lock icon, muted background, no Edit/Delete actions, "System" badge
- User categories: Edit | Delete in actions menu
- Subcategories indented with a vertical line connector

#### Modal — Create / Edit Category

Fields: Name, Type (Income / Expense — disabled in Edit mode), Parent category (optional Combobox — only shows root-level categories of the same type), Icon (optional), Color (`ColorPicker`)

#### Confirm Delete Category

"Delete [name]?" + warning if category has subcategories. Blocked with error toast if transactions reference this category.

---

### Labels (`/labels`)

**Header**: "Labels" + "Add label" button

**Content**: Simple list, each item one row:

```
● Label name                    [Edit] [Delete]
```

Color dot sized 12px, colored with the label's hex color

**Inline create/edit** — clicking "Add label" or "Edit" expands an inline row (no modal):

```
[ColorPicker]  [Name input]        [Save] [Cancel]
```

**Empty state**: "No labels yet" + "Add label" CTA

---

### Reports (`/reports`)

**Header**: "Reports"

**Global filter bar** (always visible above tabs):

| Filter     | Control                                                       |
| ---------- | ------------------------------------------------------------- |
| Date range | Dual DatePicker — default: first day of current month → today |
| Account    | Multi-select Combobox — default: All                          |
| Category   | Select — default: All (Spending tab only)                     |

**View tabs**: Spending by Category | Income vs Expenses | Balance History | Budget vs Actual

---

#### Tab 1 — Spending by Category

- Left: Donut chart — top 6 categories + "Other" slice
- Right: Breakdown table — Category name | Amount | % of total
- Colors: use category's stored hex color; auto-assign if null
- Empty state: "No expense transactions in this period"

#### Tab 2 — Income vs Expenses

- Grouped bar chart — X-axis: month label, two bars per group (emerald = income, rose = expense)
- Net line overlay on secondary Y-axis (violet) — `income − expense` per month
- Summary row below chart: Total income | Total expenses | Net (colored by sign)
- Empty state: "No transactions in this period"

#### Tab 3 — Balance History

- Line chart — one line per account, each a distinct color
- X-axis: date, Y-axis: balance amount
- Tooltip on hover: date + balance per account
- Legend: account name + color swatch
- Empty state: "No accounts or transactions found"

#### Tab 4 — Budget vs Actual

- Horizontal bar list (one per budget)
- Each row:
  ```
  Budget name        [████████████░░] 64%    €320 / €500
  ```
- Bar color matches budget progress rules (emerald / amber / rose)
- Empty state: "No budgets in this period"

---

### Settings (`/settings`)

**Layout**: Single-column centered form, `max-w-lg`

**Sections** (separated by `Separator`):

1. **Currency**
   - Symbol: `Input` (max 3 chars), placeholder "€"
   - Position: Toggle group — Before | After

2. **Number format**
   - Decimal separator: `Input` (1 char), e.g. `.` or `,`
   - Thousand separator: `Input` (1 char), e.g. `,` or `.`
   - Inline error if both are equal: "Decimal and thousand separators must differ"

3. **Date format**
   - `Select`: DD/MM/YYYY | MM/DD/YYYY | YYYY-MM-DD

4. **Time format**
   - Toggle group: 12h | 24h

**Live preview** (sticky panel below form, or aside on desktop):

> Your amounts and dates will look like: **€1.234,56** on **14/04/2026 at 14:30**

Updates live as the user changes settings.

**CTA**: "Save changes" — full-width primary; shows spinner; success toast on save

---

## 6. Key User Flows

### Add an expense

1. Click "Add transaction" (header button, any page)
2. Dialog opens — "Expense" tab selected by default
3. Fill: Amount → Date → Account → Category → (optional) Label, Description
4. Click "Save" → spinner → dialog closes → toast "Transaction saved" → list refreshes

### Import transactions from CSV

1. `/transactions` page → click "Import" button
2. Step 1: Download template → fill in spreadsheet → drag & drop file into upload zone
3. Step 2: Review per-row validation — fix file and re-upload if needed → click "Import N transactions"
4. Step 3: See success count and any skipped rows → "Done"

### Create a budget

1. `/budgets` → click "Add budget"
2. Fill: Name, Amount, Start date, End date
3. Optionally narrow scope: Category filter, Label filter
4. "Save" → new `BudgetCard` appears in grid

### Duplicate a budget for next month

1. Budget card → Actions → "Duplicate"
2. Dialog: enter new Start date + End date
3. "Duplicate" → new card with same name/amount/filters but new dates

---

## 7. UI States

Every data-fetching view requires designs for all five states:

| State                          | Treatment                                                    |
| ------------------------------ | ------------------------------------------------------------ |
| **Loading**                    | `Skeleton` — same shape and dimensions as the loaded content |
| **Empty**                      | `EmptyState` — illustration + heading + optional CTA button  |
| **Error**                      | Inline error card: short message + "Retry" button            |
| **Success** (mutation)         | `Sonner` toast — bottom-right, auto-dismiss after 3s         |
| **Confirmation** (destructive) | `Dialog` — destructive action button + "Cancel"              |

---

## 8. Data Display Conventions

Consistent across every screen — no exceptions:

| Data                       | Display rule                                                          |
| -------------------------- | --------------------------------------------------------------------- |
| Income amount              | Emerald text, `+€1,234.56` (sign and symbol per settings)             |
| Expense amount             | Rose text, `-€234.00`                                                 |
| Transfer amount            | Violet text, `€500.00` (no sign prefix)                               |
| Account balance (positive) | Emerald                                                               |
| Account balance (negative) | Rose                                                                  |
| Account balance (zero)     | Muted                                                                 |
| Date                       | Formatted per user settings (default: `DD/MM/YYYY`)                   |
| Time                       | Formatted per user settings (default: `24h`)                          |
| Transaction type badge     | Icon + label: ↑ Income / ↓ Expense / ↔ Transfer                       |
| Validated transaction      | `CheckCircle` — emerald filled if validated, gray outline if not      |
| Inactive account           | 50% opacity + "Inactive" badge                                        |
| System category            | Lock icon + muted background + "System" badge; no edit/delete actions |

---

## 9. Iconography

All icons from **Lucide** (no additional icon library needed):

| Concept           | Lucide icon         |
| ----------------- | ------------------- |
| Dashboard         | `LayoutDashboard`   |
| Transactions      | `ArrowLeftRight`    |
| Budgets           | `Target`            |
| Accounts          | `Wallet`            |
| Categories        | `Tag`               |
| Labels            | `Tags`              |
| Reports           | `BarChart3`         |
| Settings          | `Settings`          |
| Add / New         | `Plus`              |
| Edit              | `Pencil`            |
| Delete            | `Trash2`            |
| Import            | `Upload`            |
| Download template | `Download`          |
| Validated         | `CheckCircle`       |
| Not validated     | `Circle`            |
| Income type       | `TrendingUp`        |
| Expense type      | `TrendingDown`      |
| Transfer type     | `ArrowLeftRight`    |
| Duplicate         | `Copy`              |
| System / locked   | `Lock`              |
| Inactive          | `EyeOff`            |
| Deactivate        | `PowerOff`          |
| Filter            | `SlidersHorizontal` |
| Reset             | `X`                 |
| User menu         | `ChevronDown`       |
| Collapse sidebar  | `PanelLeftClose`    |
| Expand sidebar    | `PanelLeftOpen`     |
