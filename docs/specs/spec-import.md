# Feature Spec — Import

## Overview

Bulk import of transactions from a CSV or Excel file. Two-step flow: validate (dry-run) then commit. Invalid rows are skipped with a per-row error summary; they never block valid rows from importing.

---

## Accepted Formats

| Format | Extensions | Parser |
|--------|-----------|--------|
| CSV | `.csv` | PapaParse |
| Excel | `.xlsx`, `.xls` | SheetJS |

Maximum 1 000 rows per import.

---

## CSV / Excel Template

Downloadable at `GET /api/v1/transactions/import/template` (returns `.csv`).

### Columns

Header names are **case-insensitive**. Order does not matter. Unknown extra columns are silently ignored. Empty rows are silently skipped.

| Column | Required | Format | Example |
|--------|----------|--------|---------|
| `type` | Yes | `income` \| `expense` \| `transfer` | `expense` |
| `amount` | Yes | Positive decimal, `.` as separator | `49.99` |
| `date` | Yes | `YYYY-MM-DD` | `2026-04-10` |
| `account` | Yes | Exact account name (case-insensitive) | `Checking` |
| `to_account` | Transfer only | Exact account name (case-insensitive) | `Savings` |
| `category` | Income / Expense only | Exact category name (case-insensitive) | `Groceries` |
| `label` | No | Exact label name (case-insensitive) | `Vacation` |
| `description` | No | Free text, max 500 chars | `Weekly shop` |

### Column rules

- `type = transfer` → `to_account` required, `category` must be empty
- `type = income` or `expense` → `category` required, `to_account` must be empty
- `amount` must be > 0; negatives are rejected (type conveys direction)
- `date` must be a valid calendar date; future dates are allowed
- `account`, `category`, `label` are matched by name against the user's existing data — unknown names produce a row error

---

## API Endpoints

| Operation | Endpoint | Notes |
|-----------|----------|-------|
| Download template | `GET /api/v1/transactions/import/template` | Returns CSV file |
| Validate (dry-run) | `POST /api/v1/transactions/import/validate` | Returns per-row result, no writes |
| Commit | `POST /api/v1/transactions/import` | Imports valid rows only |

### `POST /api/v1/transactions/import/validate`

**Request**: `multipart/form-data` — field `file` (`.csv`, `.xlsx`, `.xls`)

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "totalRows": 42,
    "validRows": 39,
    "invalidRows": 3,
    "rows": [
      { "row": 1, "status": "valid", "preview": { "type": "expense", "amount": 4999, "date": "2026-04-10", "account": "Checking", "category": "Groceries" } },
      { "row": 4, "status": "invalid", "errors": ["Unknown category: 'Misc'"] },
      { "row": 7, "status": "invalid", "errors": ["amount must be > 0", "date is invalid"] }
    ]
  }
}
```

### `POST /api/v1/transactions/import`

**Request**: `multipart/form-data` — field `file`

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "imported": 39,
    "skipped": 3,
    "skippedRows": [4, 7, 12]
  }
}
```

---

## Validation Rules (per row)

| Check | Error message |
|-------|--------------|
| Missing required column | `"Column '<name>' is required"` |
| `amount` ≤ 0 | `"amount must be greater than 0"` |
| `amount` not a number | `"amount must be a valid number"` |
| `date` format wrong | `"date must be in YYYY-MM-DD format"` |
| `date` not a real date | `"date is not a valid calendar date"` |
| `type` not one of the three values | `"type must be income, expense, or transfer"` |
| `to_account` missing on transfer | `"to_account is required for transfers"` |
| `to_account` present on non-transfer | `"to_account must be empty for income/expense"` |
| `category` missing on income/expense | `"category is required for income and expense"` |
| `category` present on transfer | `"category must be empty for transfers"` |
| `account` name not found | `"Unknown account: '<name>'"` |
| `to_account` name not found | `"Unknown account: '<name>'"` |
| `to_account` same as `account` | `"to_account must differ from account"` |
| `category` name not found | `"Unknown category: '<name>'"` |
| `label` name not found | `"Unknown label: '<name>'"` |

Multiple errors per row are returned as an array.

---

## UI Flow

Three-step modal (`/transactions` page):

### Step 1 — Upload
- File picker: `.csv`, `.xlsx`, `.xls`
- "Download template" link below the picker
- On file select: auto-advances to step 2

### Step 2 — Preview & Validation
- Calls `POST /api/v1/transactions/import/validate` on mount
- Shows a table: row number, status badge (valid / error), preview or error list
- Invalid rows are shown with red highlight and per-error messages
- Header bar: "39 valid · 3 errors"
- If **all rows invalid** → block progression, show: "No valid rows to import."
- If **at least one valid** → "Import 39 rows" button enabled (errors will be skipped)

### Step 3 — Result
- Calls `POST /api/v1/transactions/import` on confirm
- Shows: "39 transactions imported · 3 rows skipped"
- "Done" closes modal and refreshes the transaction list

### Error states

| Scenario | Feedback |
|----------|----------|
| Wrong file format | Inline error at step 1: "Unsupported format. Use .csv, .xlsx, or .xls." |
| File exceeds 1 000 rows | Inline error at step 1: "File exceeds the 1 000-row limit." |
| All rows invalid | Block at step 2: "No valid rows to import." |
| Partial server failure on commit | Toast: "X imported, Y failed. Check your transaction list." |
| Network error | Toast: "Something went wrong. Please try again." |
