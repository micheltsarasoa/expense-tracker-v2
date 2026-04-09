# Feature Spec — Transactions

## Overview

The core feature. A transaction represents any money movement: income, expense, or transfer between accounts.

## Data Model

```
transactions
  id                  uuid PK
  userId              uuid FK → users
  type                enum(income, expense, transfer)
  amount              numeric > 0
  description         text
  transactionDate     date
  categoryId          uuid FK → categories   (required for income/expense)
  labelId             uuid FK → labels        (optional)
  paymentMethodId     uuid FK → payment_methods
  toPaymentMethodId   uuid FK → payment_methods  (required for transfer, ≠ paymentMethodId)
  isValidated         boolean default false
  isDeleted           boolean default false   (soft delete)
  createdAt           timestamp
  updatedAt           timestamp
```

## Business Rules

- `amount` must be > 0
- `transfer` type: `toPaymentMethodId` required, must differ from `paymentMethodId`, no `categoryId`
- `income` / `expense`: `categoryId` required, `toPaymentMethodId` null
- Deleting a transaction is always soft (sets `isDeleted = true`)
- Account balances are updated automatically via DB trigger on insert / update / delete

## Operations

| Operation | Endpoint | Notes |
|---|---|---|
| List | `GET /api/v1/transactions` | Filters: type, category, label, account, date range, validated |
| Create | `POST /api/v1/transactions` | |
| Get one | `GET /api/v1/transactions/:id` | |
| Update | `PUT /api/v1/transactions/:id` | |
| Delete | `DELETE /api/v1/transactions/:id` | Soft delete |
| Validate | `PATCH /api/v1/transactions/:id/validate` | Toggles `isValidated` |
| Import | `POST /api/v1/transactions/import` | CSV or Excel |
| Validate import | `POST /api/v1/transactions/import/validate` | Dry-run before commit |

## Import

- Accepted formats: `.csv`, `.xlsx`, `.xls`
- Downloadable template with required columns
- Two-step: validate first (returns errors per row), then commit
- Libraries: PapaParse (CSV), SheetJS (Excel)

## UI Pages

| Route | Purpose |
|---|---|
| `/transactions` | Paginated list with filters, TanStack Table |
| `/transactions/new` | Create form |
| `/transactions/:id/edit` | Edit form |

## Modals

### Create / Edit Transaction (v1: full page — v2: modal / bottom sheet)
Fields:
- **Type** — segmented control: Income / Expense / Transfer (shown first; drives which other fields appear)
- **Amount** — number, required, > 0
- **Date** — date picker, required, defaults to today
- **Account** — select from active payment methods, required
- **To account** — select (Transfer only), required, must differ from Account
- **Category** — select (Income / Expense only), required; filtered by transaction type
- **Label** — optional select
- **Description** — optional text

Behavior:
- Switching **Type** resets Category and clears / shows "To account"
- Edit pre-fills all fields
- Submitting triggers account balance recalculation (via DB trigger — no client action needed)

Error states:
- Validation errors (missing required field, amount ≤ 0, same from/to account) → inline, below the relevant field
- API failure on submit → toast: "Failed to save transaction. Please try again."

Actions: Save / Cancel

### Delete Transaction
Simple confirmation: "Delete this transaction? This cannot be undone."  
Soft-deletes the record; account balance is recalculated.

Actions: Delete (destructive) / Cancel

### Import Transactions
Three-step flow in a single modal:

**Step 1 — Upload**
- File picker: `.csv`, `.xlsx`, `.xls`
- Link to download template

**Step 2 — Validation**
- Table preview of parsed rows
- Errors highlighted per row (missing field, invalid amount, unknown category…)
- User can abort or proceed if there are no blocking errors

**Step 3 — Confirm**
- Summary: X rows to import, Y errors skipped
- On confirm: commits valid rows, closes modal, refreshes list

Error states:
- File format not supported → inline error at step 1, file input reset
- All rows invalid → block progression at step 2: "No valid rows to import"
- Partial API failure on commit → toast with count: "12 imported, 3 failed. Check your list."

Actions: Next / Back / Cancel

## v2 Notes

- Same data model
- Mobile: quick-entry bottom sheet as primary creation flow
- Consider recurring transaction detection (feeds budget suggestion feature)
