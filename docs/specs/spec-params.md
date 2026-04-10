# Feature Spec — Parameters (Categories, Labels, Accounts, Settings)

## Overview

The configuration layer. Users manage the reference data that transactions and budgets depend on.

---

## 1. Categories

### Data Model

```
categories
  id        uuid PK
  userId    uuid FK → users   (null = system default)
  parentId  uuid FK → categories  (null = root category)
  name      text
  type      enum(income, expense)
  icon      text   (icon name / emoji)
  color     hex string
  isDefault boolean
```

### Business Rules

- Two-level hierarchy: parent → children (no deeper nesting)
- `type` determines which transaction types can use this category
- Default categories are seeded at user creation (read-only)
- Users can create custom categories on top of defaults
- Deleting a category with linked transactions is blocked (or requires reassignment)

### Operations

| Operation | Endpoint |
|---|---|
| List | `GET /api/v1/categories` |
| Create | `POST /api/v1/categories` |
| Update | `PUT /api/v1/categories/:id` |
| Delete | `DELETE /api/v1/categories/:id` |

### Modals

**Create / Edit Category**
Fields:
- **Name** — text, required
- **Type** — Income / Expense, required (locked on edit if transactions exist)
- **Parent category** — optional select; only root categories shown (no chaining)
- **Icon** — icon/emoji picker
- **Color** — color picker

Behavior: default categories are read-only (edit/delete disabled).

Actions: Save / Cancel

**Delete Category**
If the category has linked transactions: show a warning and a **Reassign to** selector (required before deletion).  
If no linked transactions: simple confirmation.

Actions: Delete / Cancel

---

## 2. Labels

### Data Model

```
labels
  id      uuid PK
  userId  uuid FK → users
  name    text
  color   hex string
```

### Business Rules

- Free-form tags, no hierarchy
- One label per transaction in v2 — M:N relationship deferred to scope 2
- No system defaults; fully user-created
- Deleting a label does not delete linked transactions (labelId → null)

### Operations

| Operation | Endpoint |
|---|---|
| List | `GET /api/v1/labels` |
| Create | `POST /api/v1/labels` |
| Update | `PUT /api/v1/labels/:id` |
| Delete | `DELETE /api/v1/labels/:id` |

### Modals

**Create / Edit Label**
Fields:
- **Name** — text, required
- **Color** — color picker, required

Actions: Save / Cancel

**Delete Label**
Confirmation: "Delete [name]? Transactions using it will lose this label."  
No transaction is deleted; `labelId` is set to null.

Actions: Delete (destructive) / Cancel

---

## 3. Accounts (Payment Methods)

### Data Model

```
payment_methods
  id              uuid PK
  userId          uuid FK → users
  name            text
  type            enum(checking, savings, credit_card, cash, investment, other)
  initialBalance  numeric
  currentBalance  numeric   (auto-updated by DB trigger)
  icon            text
  color           hex string
  isActive        boolean default true
```

### Business Rules

- `currentBalance` is maintained by `TransactionService` (DB transaction, no SQL trigger) — do not set manually
- Deactivated accounts (`isActive = false`) are hidden from transaction forms but their history is preserved
- Transfer transactions require two distinct active accounts

### Operations

| Operation | Endpoint |
|---|---|
| List | `GET /api/v1/payment-methods` |
| Create | `POST /api/v1/payment-methods` |
| Update | `PUT /api/v1/payment-methods/:id` |
| Delete / deactivate | `DELETE /api/v1/payment-methods/:id` |

### Modals

**Create / Edit Account**
Fields:
- **Name** — text, required
- **Type** — select: Checking / Savings / Credit card / Cash / Investment / Other, required
- **Initial balance** — number, required (shown on create only; editing it would break balance history)
- **Icon** — icon picker
- **Color** — color picker

Behavior: `currentBalance` is never editable — it is always derived from transactions.

Actions: Save / Cancel

**Deactivate / Delete Account**
If the account has linked transactions: offer **Deactivate** only (hides from forms, preserves history). No hard delete.  
If no transactions: offer full **Delete** with simple confirmation.

Actions: Deactivate / Delete / Cancel

---

## 4. User Settings

### Data Model

```
user_settings
  id                uuid PK
  userId            uuid FK → users (unique)
  decimalSeparator  text  (e.g. "." or ",")
  thousandSeparator text  (e.g. "," or "." or " ")
  dateFormat        text  (e.g. "DD/MM/YYYY")
  timeFormat        enum(12h, 24h)
  currencySymbol    text  (e.g. "€", "$")
  currencyPosition  enum(before, after)
```

### Business Rules

- One row per user — created with defaults on registration
- Settings applied globally to all number and date display across the app
- Formatting is client-side only; raw values are always stored as numeric in the DB

### Operations

| Operation | Endpoint |
|---|---|
| Get | `GET /api/v1/settings` |
| Update | `PUT /api/v1/settings` |

### UI

Settings is a **full page form** at `/settings` — not a modal. Fields are grouped into sections (Number format, Date format, Currency). Changes are saved on submit (single "Save" button), not auto-saved.

Error states:
- API failure on save → toast: "Failed to save settings. Please try again."
- Success → toast: "Settings saved."

---

## v2 Notes

- **Labels → M:N**: deferred to scope 2. Single label per transaction at launch.
- **Categories**: consider icon upload or emoji picker in Figma design
- **Accounts**: `currency` field per account for multi-currency — future scope
- **Settings**: moved to [spec-settings.md](spec-settings.md)
