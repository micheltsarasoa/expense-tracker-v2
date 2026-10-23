# ADR-005 — Parents Create Child Accounts Through a Privileged Server Route

**Date:** 2026-10-23  
**Status:** Proposed

## Context

`docs/specs/spec-family.md` §2 requires a parent to create a child's login directly (name, email, password) and to set a new password for that child later. Until now, every account has been created by its owner through the Stack sign-up flow, and `ensureAppUser` (`apps/web/lib/auth.ts`) mirrors the Stack user into `public.users` on first access, with `users.id` = Stack user id.

The repo uses `@stackframe/stack` 2.8.81 (legacy Neon Auth). Its server SDK exposes, in `StackServerApp` and `ServerUser` (checked in the package's type definitions):

- `createUser(options: ServerUserCreateOptions): Promise<ServerUser>`, with `primaryEmail`, `password`, `displayName`, `primaryEmailAuthEnabled`, `primaryEmailVerified`, `serverMetadata`
- `getUser(id: string): Promise<ServerUser | null>`
- `ServerUser.update({ password })`, `ServerUser.setPassword({ password })`, `ServerUser.delete()`

These calls are authorised by the project's server secret key, already present in the server environment for `StackServerApp`. Nothing in the SDK checks _who_ in our app asked for them: the app must do that check itself.

## Decision

Two server-only operations in a `FamilyAccountService`, exposed via `POST /api/v1/family/children` and `PUT /api/v1/family/children/:userId/password`. Both go through `controller()`, so the caller is authenticated first.

**Create child**

1. Validate the body with a Zod schema from `packages/types`.
2. Check that the caller is a `parent` in `family_members`. Otherwise → 404.
3. `stackServerApp.createUser({ primaryEmail, password, displayName, primaryEmailAuthEnabled: true, serverMetadata: { familyId, role: 'child' } })`.
4. In one `db.transaction()`: insert the `users` row (id = Stack id), the `family_members` row (`role = child`, `addedBy` = caller), the wallet (`payment_methods`, `type = cash`) and the seeded categories.
5. If step 4 fails → **compensate**: `createdUser.delete()`, then rethrow a typed error. If the compensation also fails, log the orphan Stack id at error level and return the same typed error.

**Set child password**

1. Check that the caller is a `parent`, and that the target is a `child` **of the same family**. Otherwise → 404.
2. `(await stackServerApp.getUser(childId))?.update({ password })`.

Neither endpoint ever returns the password, and neither logs it.

## Consequences

**Positive**

- Matches the product decision: no email round-trip, works for a child without their own inbox.
- One small surface (two endpoints, one service) holds all privileged auth calls, so it is easy to review and test.
- Authorisation stays in our code, next to the family data it depends on.

**Negative**

- **No cross-system transaction.** Stack and Neon cannot commit together; compensation (step 5) covers the common failure, but a crash between steps 3 and 5 can leave an orphan Stack user. If that user later signs in, `ensureAppUser` would create a family-less account. Mitigation: `ensureAppUser` refuses users whose `serverMetadata.role === 'child'` and who have no `family_members` row.
- Parents know the child's initial password. Accepted by the product decision.
- Ties the feature to the legacy Stack SDK. Moving to the Better Auth based Neon Auth means using its Admin plugin (`admin.createUser`, `admin.setUserPassword`), which needs an admin-role caller: a separate migration ADR.
- Whether Stack allows password sign-in when `primaryEmailVerified` is false depends on project settings. Check in the Stack dashboard before release.

## Rejected alternatives

- **Email invitation, child sets the password** — the standard flow with no privileged route, but rejected in the spec interview: the parent must be able to create and reset the login.
- **Migrate to Better Auth Neon Auth first** — widens this change into an auth migration and requires giving the app an admin-role identity.
- **Create children manually in the Stack dashboard** — not usable by parents; not reproducible.
- **Calling Stack from the client** — would expose the server key.
