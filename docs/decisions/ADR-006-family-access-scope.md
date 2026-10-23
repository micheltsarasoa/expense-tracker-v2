# ADR-006 — Family Access Scope: Who Can Read and Write Whose Rows

**Date:** 2026-10-23  
**Status:** Proposed

## Context

Every query today is scoped to one user: services filter with `eq(table.userId, userId)` (helper: `withUserScope` in `packages/db`), `userId` coming from `controller()` → `getAuthenticatedUser()`. A row is visible to its owner only.

`docs/specs/spec-family.md` §3 widens this:

| Viewer → data of         | Read | Write                                                  |
| ------------------------ | ---- | ------------------------------------------------------ |
| Self                     | yes  | yes                                                    |
| Co-parent                | yes  | no                                                     |
| Own child                | yes  | correct expenses, edit rules, mark flags seen, comment |
| Child → parent / sibling | no   | no                                                     |

Each row still has exactly one owner (`userId`). What changes is who may **read** it, and a few named **write** exceptions on a child's data.

## Decision

**1. One scope object per request, computed from `family_members`.**

`packages/db` exports `getAccessScope(viewerId)`, one query on `family_members`, which returns:

```ts
interface AccessScope {
  self: string;
  role: 'parent' | 'child' | null;
  coParentIds: string[];
  childIds: string[];
  canRead(ownerId: string): boolean;
  canActOnChild(childId: string): boolean;
  readIds(filter: 'me' | 'all' | string): string[];
}
```

- A child gets `coParentIds = []` and `childIds = []`. They can read only themselves.
- `readIds('me')` → `[self]`, `readIds('all')` → `[self, ...coParentIds]`, `readIds(id)` → `[id]` only if `canRead(id)`, else 404.
- Children's rows are **never** in `readIds('all')`. Parent views read them only through family endpoints (spec §4, "Money meaning").

**2. Reads widen; writes do not.**

- Read services that support the member filter use `inArray(table.userId, scope.readIds(filter))`. Default filter = `'me'`, so existing behaviour is unchanged.
- Every generic write (create, update, delete in the existing services) keeps `eq(table.userId, self)`. A co-parent's or child's row can never be modified through them.
- The child write exceptions live only in family services (correct expense, rules, flags, comments). Each starts with `scope.canActOnChild(childId)`.

**3. Denied = 404.** Any id outside the scope is treated as "not found", so the API never confirms that a row exists.

**4. The scope is computed per request, never cached across requests.** A removed member loses access on their next request.

## Consequences

**Positive**

- A single place decides family access: unit-testable as a pure function over member rows (the table above becomes the test matrix).
- Existing services and their tests stay valid. Only list/report reads opt into `readIds`.
- Writes are safe by construction: no generic path writes outside `self`.

**Negative**

- Isolation is enforced in application code, not in Postgres. A service that forgets the scope leaks data. Mitigation: review checklist + a test per read endpoint asserting a stranger's row is invisible.
- One extra query per request for family members (indexed on `userId`, small).

## Rejected alternatives

- **Postgres Row-Level Security** — strongest guarantee, but the app connects with a single server role; RLS would need the user identity passed into every DB session (JWT claims / `SET LOCAL`), a larger change to `packages/db` than this feature warrants. Worth revisiting if more cross-user features appear.
- **Copy shared data into a household table** — duplicates rows and breaks the one-owner rule; balances and edits would drift.
- **Ad-hoc checks inside each service** — same logic copied many times; one miss leaks data.
- **Return 403 on denied access** — confirms existence of ids to an attacker.
