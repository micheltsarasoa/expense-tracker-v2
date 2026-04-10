# Feature Spec — Settings

## Overview

User-level display preferences. Controls how amounts, dates, and currency are formatted across the entire app. One settings row per user, created with defaults on registration.

---

## Data Model

```
user_settings
  id                uuid PK
  userId            uuid FK → users  UNIQUE
  currencySymbol    text             default '€'
  currencyPosition  enum(before, after)  default 'before'
  decimalSeparator  text             default '.'
  thousandSeparator text             default ','
  dateFormat        text             default 'DD/MM/YYYY'
  timeFormat        enum(12h, 24h)   default '24h'
```

---

## Business Rules

- One row per user — created with defaults at registration time, never deleted
- Settings are **display-only** — raw values in the DB are always stored as numeric (cents) or ISO dates
- Formatting is applied client-side at render time using these settings
- Decimal and thousand separators must differ
- `currencyPosition = before` → `€49.99`; `after` → `49.99€`

### Default values

| Setting | Default |
|---------|---------|
| Currency symbol | `€` |
| Currency position | `before` |
| Decimal separator | `.` |
| Thousand separator | `,` |
| Date format | `DD/MM/YYYY` |
| Time format | `24h` |

### Supported date formats

| Token | Example |
|-------|---------|
| `DD/MM/YYYY` | 10/04/2026 |
| `MM/DD/YYYY` | 04/10/2026 |
| `YYYY-MM-DD` | 2026-04-10 |
| `D MMM YYYY` | 10 Apr 2026 |

---

## Operations

| Operation | Endpoint | Auth |
|-----------|----------|------|
| Get current user's settings | `GET /api/v1/settings` | Yes |
| Update settings | `PUT /api/v1/settings` | Yes |

### `GET /api/v1/settings`

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "currencySymbol": "€",
    "currencyPosition": "before",
    "decimalSeparator": ".",
    "thousandSeparator": ",",
    "dateFormat": "DD/MM/YYYY",
    "timeFormat": "24h"
  }
}
```

### `PUT /api/v1/settings`

**Request body** (all fields optional — partial update):
```json
{
  "currencySymbol": "$",
  "currencyPosition": "before",
  "decimalSeparator": ".",
  "thousandSeparator": ",",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h"
}
```

**Response** `200`: updated settings object (same shape as GET).

**Validation errors** `400`:
- `decimalSeparator === thousandSeparator` → `"Decimal and thousand separators must differ"`
- `dateFormat` not in the supported list → `"Unsupported date format"`
- `timeFormat` not `12h` or `24h` → `"timeFormat must be 12h or 24h"`

---

## UI Page

Route: `/settings`

A **full-page form** (not a modal). Fields are grouped into three sections. Changes take effect only after clicking **Save** — no auto-save.

### Section 1 — Currency

| Field | Control | Options |
|-------|---------|---------|
| Currency symbol | Text input | Free text, max 4 chars |
| Position | Toggle | Before amount / After amount |

Live preview: updates an example amount (`1 234.56`) as the user changes settings.

### Section 2 — Number Format

| Field | Control | Options |
|-------|---------|---------|
| Decimal separator | Select | `.` (period) / `,` (comma) |
| Thousand separator | Select | `,` (comma) / `.` (period) / ` ` (space) / None |

Live preview updates on every change. Show validation error inline if separators conflict.

### Section 3 — Date & Time

| Field | Control | Options |
|-------|---------|---------|
| Date format | Select | DD/MM/YYYY · MM/DD/YYYY · YYYY-MM-DD · D MMM YYYY |
| Time format | Toggle | 12h / 24h |

Live preview shows today's date and current time in the selected format.

### Actions

- **Save** → `PUT /api/v1/settings`; on success: toast "Settings saved."
- On API failure → toast: "Failed to save settings. Please try again."
- No cancel button (navigating away discards unsaved changes — no confirmation required)

---

## Formatting Helpers (`packages/types`)

Formatting logic lives in `packages/types` (framework-agnostic) so it can be used by both web and mobile:

```ts
// packages/types/src/formatting.ts

export function formatAmount(
  cents: number,
  settings: UserSettings
): string

export function formatDate(
  isoDate: string,
  settings: UserSettings
): string

export function formatDateTime(
  isoTimestamp: string,
  settings: UserSettings
): string
```

These are the **only** functions that should render amounts or dates anywhere in the app.
