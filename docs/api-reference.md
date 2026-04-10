# API Reference

Base path: `/api/v1`  
All endpoints require authentication (Neon Auth JWT) except those marked **public**.  
All responses follow the `ApiResponse<T>` envelope:

```json
{ "success": true,  "data": <T> }
{ "success": false, "error": { "code": "<ErrorCode>", "message": "<string>" } }
```

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Log in, receive JWT |
| `POST` | `/auth/logout` | Yes | Clear session |
| `GET` | `/auth/session` | Yes | Get current user identity |

### POST /auth/register
```json
// Request
{ "name": "string", "email": "string", "password": "string" }

// 201 Response
{ "success": true, "data": { "id": "uuid", "email": "string", "name": "string" } }
```
Errors: `CONFLICT` (email taken), `VALIDATION_ERROR`

### POST /auth/login
```json
// Request
{ "email": "string", "password": "string" }

// 200 Response
{ "success": true, "data": { "id": "uuid", "email": "string", "name": "string" } }
```
Sets HTTP-only cookie (web) or returns Bearer token in body (mobile).  
Errors: `UNAUTHORIZED` (wrong credentials), rate limit → `429`

---

## Transactions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/transactions` | Yes | List transactions (paginated, filterable) |
| `POST` | `/transactions` | Yes | Create a transaction |
| `GET` | `/transactions/:id` | Yes | Get a single transaction |
| `PUT` | `/transactions/:id` | Yes | Update a transaction |
| `DELETE` | `/transactions/:id` | Yes | Soft-delete a transaction |
| `PATCH` | `/transactions/:id/validate` | Yes | Toggle `isValidated` |
| `GET` | `/transactions/import/template` | Yes | Download CSV template |
| `POST` | `/transactions/import/validate` | Yes | Dry-run import validation |
| `POST` | `/transactions/import` | Yes | Commit import |

### GET /transactions — Query params

| Param | Type | Description |
|-------|------|-------------|
| `type` | `income\|expense\|transfer` | Filter by transaction type |
| `categoryId` | `uuid` | Filter by category |
| `labelId` | `uuid` | Filter by label |
| `accountId` | `uuid` | Filter by account (from or to) |
| `dateFrom` | `YYYY-MM-DD` | Start of date range |
| `dateTo` | `YYYY-MM-DD` | End of date range |
| `isValidated` | `boolean` | Filter by validated status |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Page size (default: 20, max: 100) |

### POST /transactions
```json
// Request
{
  "type": "expense",
  "amount": 4999,
  "date": "2026-04-10",
  "accountId": "uuid",
  "categoryId": "uuid",
  "labelId": "uuid | null",
  "description": "string | null"
}
// Transfer adds: "toAccountId": "uuid"

// 201 Response — full transaction object
```

---

## Budgets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/budgets` | Yes | List all budgets with computed `spent` |
| `POST` | `/budgets` | Yes | Create a budget |
| `GET` | `/budgets/:id` | Yes | Get a single budget |
| `PUT` | `/budgets/:id` | Yes | Update a budget |
| `DELETE` | `/budgets/:id` | Yes | Delete a budget |
| `POST` | `/budgets/:id/duplicate` | Yes | Duplicate with new dates |
| `GET` | `/budgets/suggestions` | Yes | Get rule-based budget suggestions |
| `POST` | `/budgets/suggestions/:id/dismiss` | Yes | Dismiss a suggestion |

### POST /budgets
```json
// Request
{
  "name": "string",
  "amount": 15000,
  "startDate": "2026-04-01",
  "endDate": "2026-04-30",
  "categoryId": "uuid | null",
  "labelId": "uuid | null"
}
```

### POST /budgets/:id/duplicate
```json
// Request
{ "startDate": "2026-05-01", "endDate": "2026-05-31" }
// 201 Response — new budget object
```

---

## Categories

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/categories` | Yes | List all categories (system + user) |
| `POST` | `/categories` | Yes | Create a custom category |
| `PUT` | `/categories/:id` | Yes | Update a custom category |
| `DELETE` | `/categories/:id` | Yes | Delete a category (requires no linked transactions, or reassign) |

### DELETE /categories/:id — Query params

| Param | Type | Description |
|-------|------|-------------|
| `reassignTo` | `uuid` | Required if category has linked transactions |

---

## Labels

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/labels` | Yes | List all labels |
| `POST` | `/labels` | Yes | Create a label |
| `PUT` | `/labels/:id` | Yes | Update a label |
| `DELETE` | `/labels/:id` | Yes | Delete a label (nullifies on transactions) |

---

## Accounts (Payment Methods)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/payment-methods` | Yes | List all accounts |
| `POST` | `/payment-methods` | Yes | Create an account |
| `PUT` | `/payment-methods/:id` | Yes | Update name, type, icon, color |
| `DELETE` | `/payment-methods/:id` | Yes | Deactivate (if has transactions) or delete |

### POST /payment-methods
```json
{
  "name": "string",
  "type": "checking | savings | credit_card | cash | investment | other",
  "initialBalance": 100000,
  "icon": "string | null",
  "color": "#hex | null"
}
```
Note: `initialBalance` in cents. Cannot be changed after creation.

---

## Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/settings` | Yes | Get current user's settings |
| `PUT` | `/settings` | Yes | Update settings (partial update) |

---

## Reports

All report endpoints accept the same global filter params:

| Param | Type | Default |
|-------|------|---------|
| `dateFrom` | `YYYY-MM-DD` | First day of current month |
| `dateTo` | `YYYY-MM-DD` | Today |
| `accountIds` | `uuid[]` (comma-separated) | All accounts |
| `categoryIds` | `uuid[]` (comma-separated) | All categories |
| `type` | `income\|expense\|both` | `both` |

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/reports/spending-by-category` | Yes | Expense totals grouped by category |
| `GET` | `/reports/income-vs-expenses` | Yes | Monthly income and expense totals |
| `GET` | `/reports/balance-history` | Yes | Running balance per account over time |
| `GET` | `/reports/budget-vs-actual` | Yes | Budget amounts vs computed spent |

### GET /reports/spending-by-category
```json
{
  "success": true,
  "data": [
    { "categoryId": "uuid", "categoryName": "Groceries", "total": 38400, "percentage": 32.1 }
  ]
}
```

### GET /reports/income-vs-expenses
```json
{
  "success": true,
  "data": [
    { "month": "2026-04", "income": 320000, "expenses": 185000, "net": 135000 }
  ]
}
```

### GET /reports/balance-history
```json
{
  "success": true,
  "data": [
    {
      "accountId": "uuid",
      "accountName": "Checking",
      "history": [
        { "date": "2026-04-01", "balance": 120000 },
        { "date": "2026-04-10", "balance": 115001 }
      ]
    }
  ]
}
```

### GET /reports/budget-vs-actual
```json
{
  "success": true,
  "data": [
    { "budgetId": "uuid", "name": "Groceries April", "amount": 50000, "spent": 38400, "remaining": 11600 }
  ]
}
```

---

## Error Codes Reference

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Zod parse failure — check `message` for details |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Token valid but resource belongs to another user |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate (e.g. email already registered) |
| `UNPROCESSABLE` | 422 | Business rule violation (e.g. same from/to account) |
| `INTERNAL` | 500 | Unexpected server error |

All amounts are in **cents** (integers). Dates are **ISO 8601** (`YYYY-MM-DD`).
