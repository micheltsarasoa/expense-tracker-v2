# Feature Spec — Family

## Overview

Family lets parents follow their children's spending without blocking anything. Each child has their own login and one wallet. Parents send allowance as linked transfers, answer money requests, set spending rules that **flag** (never block), and correct a child's entries in a visible way. Parents in the same family also see each other's finances, read-only.

Actors:

- **Parent** — adult member. Full control of their own data; read-only on co-parents' data; manages children.
- **Child** — member with one wallet. Logs expenses, sends money requests, sees only their own data.

UI reference: canvas boards **Family** (parent, web) and **KidMobile** (child, Expo).

### Out of scope (this version)

- Automatic / recurring allowance (see v2)
- Writing into a co-parent's data
- A user in more than one family
- Deleting a family
- Transfers child → anyone, parent → parent through this feature
- Savings goals, matching, pausing spending, sending real money
- Push notifications (in-app only)

---

## 1. Membership

### Data Model

```
families
  id          uuid PK
  name        text (1–60)
  createdBy   uuid FK → users
  createdAt   timestamp
  updatedAt   timestamp

family_members
  id          uuid PK
  familyId    uuid FK → families
  userId      uuid FK → users   UNIQUE   (one family per user)
  role        enum(parent, child)
  addedBy     uuid FK → users
  joinedAt    timestamp

family_invitations
  id          uuid PK
  familyId    uuid FK → families
  email       varchar(255)
  invitedBy   uuid FK → users
  status      enum(pending, accepted, declined, revoked)
  createdAt   timestamp
  respondedAt timestamp (nullable)
```

### Business Rules

- A user belongs to **at most one family** (`family_members.userId` unique).
- Creating a family makes the creator its first `parent`.
- **Adding a parent**: any parent invites an existing user by email. The invitee sees _"You will share all your accounts, transactions, budgets and reports read-only with the parents of {family}."_ and must **accept**. Nothing is shared before acceptance.
  - One pending invitation per (familyId, email). A parent can revoke a pending invitation.
  - Inviting a user who is already in a family fails with a clear message.
- **Adding a child**: any parent creates the child's login (see §2). The child joins as `child` immediately.
- **Removing a member**: any parent can remove any member, including themselves, except the **last parent** (rejected).
  - The removed member keeps every row they own. They only lose access granted by the family.
  - Removing a child cancels their `pending` money requests. Their login and wallet remain.
- Children never manage membership.

---

## 2. Child Account

### Business Rules

- A parent creates the child's account through a **privileged server route**: it checks that the caller is a `parent` of a family, then creates the auth user with the server key. Auth flow change → **ADR-005** before coding; the exact Stack (`@stackframe/stack`, legacy Neon Auth) server API is checked on Context7 first.
- Fields: **Name** (1–100, required), **Email** (login identifier, required, unique), **Password** (required, auth provider policy).
- In the same operation:
  - create the `users` row and the `family_members` row (`role = child`);
  - create **one wallet**: `payment_methods` with `type = cash`, name "Wallet", `initialBalance = 0`;
  - seed categories: system defaults + kid set (_Snacks & food_, _In-app purchases_, _School_, _Other_).
- If any step fails, nothing is kept (no half-created child).
- A parent can **set a new password** for a child of their family through the same route and the same check.
- A child cannot create accounts or categories. A parent can add categories for a child.

---

## 3. Access Rules

Every query stays scoped by `userId`. Family access only widens the set of user ids a viewer may **read**; writes are always explicit per rule below. Mechanism → **ADR-006** (cross-user read scope).

| Viewer → data of | Read                                                | Write                                                  |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------ |
| Self             | yes                                                 | yes                                                    |
| Co-parent        | yes (accounts, transactions, budgets, reports)      | **no**                                                 |
| Own child        | yes                                                 | correct expenses, edit rules, mark flags seen, comment |
| Child → parent   | no (only their own requests and incoming transfers) | no                                                     |
| Child → sibling  | no                                                  | no                                                     |

- Any write on a row checks: owner = caller, **or** a rule in the table above allows it.
- Forbidden access returns **404**, not 403 (no existence leak).

---

## 4. Family Transfers (Allowance)

### Data Model

Changes to `transactions`:

```
transactions (+)
  transferGroupId  uuid (nullable)   — same value on both rows of a family transfer
```

### Business Rules

- A family transfer is **two rows** sharing one `transferGroupId`:
  - **out row** — owned by the sending parent, `paymentMethodId` = one of the parent's own active accounts;
  - **in row** — owned by the child, `paymentMethodId` = the child's wallet.
  - Both rows: `type = transfer`, same `amount` (> 0, `numeric(15,2)`), same `transactionDate`, category "Allowance".
- Transfers between a user's own accounts keep the **existing one-row model** (`toPaymentMethodId`). Two transfer models coexist → **known debt**, listed in Open Questions.
  - The `check_transfer_to_payment` CHECK becomes: `type <> 'transfer' OR to_payment_method_id IS NOT NULL OR transfer_group_id IS NOT NULL`.
- Create, edit and delete always touch **both rows and both balances in one `db.transaction()`** (ADR-003). Never one row alone.
- Delete = soft delete (`isDeleted = true`) **by `transferGroupId`**, never by row id.
- **Only the sending parent** can edit or delete a family transfer. Co-parents see it read-only; the child sees the in row read-only ("From {Parent}").
- Allowance is **manual**: a parent taps _Record allowance_ and picks the source account.
- The child's wallet may go below $0.00 after an edit or delete; it is allowed and flagged (§7).

### Money meaning

- The **out row counts as the parent's spending** (money leaves the parents' household).
- The child's expenses are **not** in the parent's totals. They are shown apart as _"{Child}'s spending"_.
- The in row is not "income" in parent views.
- Dashboard default = the viewer's own data. Filter **All / Me / {co-parent}** adds co-parents' rows. Child rows never enter these totals.

---

## 5. Money Requests

### Data Model

```
money_requests
  id              uuid PK
  familyId        uuid FK → families
  childUserId     uuid FK → users
  amount          numeric(15,2) > 0
  reason          text (1–80)
  status          enum(pending, approved, declined, cancelled)
  decidedBy       uuid FK → users (nullable)
  decidedAt       timestamp (nullable)
  declineReason   text (≤ 280, nullable)
  transferGroupId uuid (nullable)   — set when approved
  createdAt       timestamp
  updatedAt       timestamp
```

### Lifecycle

| From       | Action                                     | Who            | To                         |
| ---------- | ------------------------------------------ | -------------- | -------------------------- |
| —          | Create                                     | child          | `pending`                  |
| `pending`  | Edit amount / reason                       | child          | `pending`                  |
| `pending`  | Cancel                                     | child          | `cancelled`                |
| `pending`  | Approve (records the transfer)             | any parent     | `approved`                 |
| `pending`  | Decline (optional reason)                  | any parent     | `declined`                 |
| `approved` | Sending parent deletes the linked transfer | sending parent | `pending` (child notified) |

### Business Rules

- No expiry. A request stays `pending` until decided or cancelled.
- **First decision wins.** Approve/Decline reads the request **with a row lock inside `db.transaction()`**; if it is no longer `pending`, fail with _"Already {approved|declined} by {Parent}"_.
- **Approve is atomic**: the request becomes `approved` only when the linked pair is saved in the same transaction. Cancelling the dialog leaves it `pending`. The amount is editable in the dialog.
- The child's notification is held until the 10 s Undo toast expires (or is pushed out of the queue).
- `cancelled` and `declined` are final.

---

## 6. Spending Rules

### Data Model

```
spending_rules                 — one row per child
  childUserId        uuid PK FK → users
  perPurchaseCap     numeric(15,2) (nullable = off, 0 < x ≤ 9,999.99)
  categoryLimitsOn   boolean default true
  updatedBy          uuid FK → users
  updatedAt          timestamp

category_limits
  id            uuid PK
  childUserId   uuid FK → users
  categoryId    uuid FK → categories   UNIQUE (childUserId, categoryId)
  monthlyLimit  numeric(15,2) > 0
  updatedBy     uuid FK → users
  updatedAt     timestamp

watched_categories
  childUserId   uuid FK → users
  categoryId    uuid FK → categories   PK (childUserId, categoryId)
  addedBy       uuid FK → users
```

### Business Rules

- Rules belong to the **child**, not to a parent. Any parent of the family can change them; `updatedBy` records the last one.
- Rules **never block** a save. They only create flags (§7).
- The child sees their rules and, before saving an expense, plain facts: _"Above $20.00, so {Parent} will see this one."_, _"This takes Snacks & food past its $30.00 limit."_, _"Your wallet goes to −$3.50."_
- The **negative wallet** rule is always on and has no setting.
- Watch threshold = **80 %**, Over = **100 %**; Over uses the warning colour everywhere.

---

## 7. Flags

### Data Model

```
flags
  id            uuid PK
  transactionId uuid FK → transactions
  childUserId   uuid FK → users
  reason        enum(per_purchase_cap, category_limit, watched_category, negative_wallet)
  status        enum(open, seen)
  seenBy        uuid FK → users (nullable)
  seenAt        timestamp (nullable)
  createdAt     timestamp
```

### Business Rules

- Flags are written **when the child's expense is saved**, in the same `db.transaction()`, from the rules active at that moment. Changing a rule later does not re-flag old rows.
- `negative_wallet` is written for any write that takes the wallet below $0.00 (child expense, parent correction, transfer edit/delete).
- One shared state per flag: _Mark as seen_ by any parent → all parents see **"Seen by {Parent} · {date}"**. Undo available.
- The child deleting a flagged expense removes its flags.
- Empty queue: _"Nothing flagged."_

---

## 8. Corrections & Comments

### Data Model

```
transactions (+)
  correctedBy     uuid FK → users (nullable)
  correctedAt     timestamp (nullable)
  originalAmount  numeric(15,2) (nullable — kept from the first correction)
  correctionNote  text (≤ 280, nullable)

family_comments
  id            uuid PK
  familyId      uuid FK → families
  targetType    enum(request, transaction)
  targetId      uuid
  authorUserId  uuid FK → users
  body          text (1–280)
  createdAt     timestamp
```

### Business Rules

- A parent **cannot delete** a child's row. They can only **Correct** it: amount, category, description, date, optional note.
- A correction is visible to the child: _"Corrected by {Parent}, {date}"_ + original amount + note.
- Corrections apply to the child's **expense** rows only, not to the in row of a transfer.
- The child can still edit or delete their own expense after a correction; the marker stays.
- Comments: parents and the child can comment on the child's requests and expenses. Empty comments are rejected with an inline error.

---

## 9. Notifications (in-app)

```
notifications
  id          uuid PK
  userId      uuid FK → users   — recipient
  kind        enum(request_created, request_decided, request_reopened, comment, correction, flag, invitation)
  refId       uuid
  readAt      timestamp (nullable)
  createdAt   timestamp
```

- Parents get: new request, new flag, child comment, invitation.
- Child gets: request decided or reopened, parent comment, correction.
- Mark as read individually or all.

---

## Operations

| Operation                       | Endpoint                                                          | Who                                   |
| ------------------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| Get my family                   | `GET /api/v1/family`                                              | any member                            |
| Create family                   | `POST /api/v1/family`                                             | user with no family                   |
| Invite parent                   | `POST /api/v1/family/invitations`                                 | parent                                |
| Revoke invitation               | `DELETE /api/v1/family/invitations/:id`                           | parent                                |
| Accept / decline invitation     | `POST /api/v1/family/invitations/:id/{accept,decline}`            | invitee                               |
| Create child account            | `POST /api/v1/family/children`                                    | parent                                |
| Set child password              | `PUT /api/v1/family/children/:userId/password`                    | parent                                |
| Remove member                   | `DELETE /api/v1/family/members/:userId`                           | parent                                |
| Record allowance                | `POST /api/v1/family/transfers`                                   | parent                                |
| Edit / delete allowance         | `PUT` / `DELETE /api/v1/family/transfers/:transferGroupId`        | sending parent                        |
| List requests                   | `GET /api/v1/family/requests`                                     | parent (all children) / child (own)   |
| Create / edit / cancel request  | `POST` / `PUT /api/v1/family/requests/:id` / `POST …/:id/cancel`  | child                                 |
| Approve / decline               | `POST /api/v1/family/requests/:id/{approve,decline}`              | parent                                |
| Get / update rules              | `GET` / `PUT /api/v1/family/children/:userId/rules`               | parent (child: read)                  |
| Category limits CRUD            | `/api/v1/family/children/:userId/category-limits`                 | parent                                |
| Watched categories add / remove | `/api/v1/family/children/:userId/watched-categories`              | parent                                |
| List flags                      | `GET /api/v1/family/flags`                                        | parent                                |
| Mark seen / undo                | `POST /api/v1/family/flags/:id/{seen,unseen}`                     | parent                                |
| Correct expense                 | `POST /api/v1/family/transactions/:id/correct`                    | parent                                |
| Comments                        | `GET` / `POST /api/v1/family/comments`                            | member with read access to the target |
| Notifications                   | `GET /api/v1/notifications`, `POST …/:id/read`, `POST …/read-all` | self                                  |

Zod schemas for every body live in `packages/types` and are reused by forms and handlers.

---

## UI Rules

- One primary action per view. Decline and destructive actions use the **danger** variant.
- **Undo** for deleting your own data; **AlertDialog** (Cancel focused) when the action affects someone else (e.g. deleting a transfer: _"Both rows are removed … Her wallet goes from $42.50 to $17.50."_).
- Desktop: forms in a 480 px side sheet or centered dialog; < 640 px: bottom sheet with sticky footer and 44 px targets.
- Every async view handles loading (skeletons), error (callout, input kept) and empty states: no child yet, no requests, nothing flagged, no notifications.

## Modals

- **Create child** — Name, Email, Password. Success → child appears with an empty wallet.
- **Invite parent** — Email. Shows what will be shared.
- **Record / edit allowance** — Amount, Date (default today, no future), From account (own active accounts), To (read-only: child + wallet), Note. Helper: _"Saved as two linked rows: out of {account}, into {child}'s wallet. Counts as your spending."_
- **Approve request** — same form, prefilled from the request; button _"Approve and record ⇄ {amount}"_.
- **Decline request** — optional reason (≤ 280).
- **Correct expense** — Amount, Category, Description, Date, Note to child. Banner: _"{Child} sees the change and your name on it."_
- **Per-purchase cap / Add category limit / Add watched categories** — explicit Save; removing is immediate with Undo.
- **Remove member** — AlertDialog stating that their rows stay and their access ends.

---

## Edge Cases

- Two parents approve the same request at the same moment → row lock; the second gets _"Already approved by {Parent}"_.
- The sending parent's source account is deactivated → the transfer stays; editing requires picking an active account.
- The sending parent leaves the family → their out rows stay theirs; the child keeps the in row; the transfer can no longer be edited by anyone from the family side.
- A child is removed with pending requests → requests become `cancelled`.
- A child and a parent edit the same expense at once → last write wins; the correction marker reflects the parent's write if it came last (optimistic `updatedAt` check: open question).
- A category with a limit is deleted → its `category_limits` and `watched_categories` rows are removed.
- Rounding: all sums in `numeric`, never in floating point.

---

## Open Questions

1. **Two transfer models** (one row for own accounts, two rows for family). Migrate everything to two rows later?
2. **Optimistic concurrency** on corrections (reject if `updatedAt` changed) or last-write-wins?
3. Can a parent belong to a family **and** later want a second one (blended families)? Currently blocked by `UNIQUE(userId)`.
4. Exact Stack server API for creating a user and setting a password → ADR-005 after the Context7 check. The legacy Neon Auth (Stack) is no longer offered to new users; migrating to the Better Auth based Neon Auth, where user creation is admin-only, is a separate decision.
5. A child without a personal email: is a parent-chosen placeholder address acceptable to the auth provider?

## v2 — Automatic allowance

Amount + frequency + source account, paid by a scheduled job with an idempotency key per (child, period) so a retry never pays twice.
