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

The Ledger v2 review (decision 10 in `docs/ledger-v2-decisions.md`) wants the parent to choose a **username** for the child, with email as the fallback. The 2.8.81 types settle what Stack can do:

- `signInWithCredential` takes `{ email, password }` only.
- `ServerUserCreateOptions` has no username field.
- Every `username` in the SDK types belongs to the SMTP mail-server config, not to users.

Stack has no username sign-in. A username has to be built on top of email.

## Decision

**Child login identifier: a username stored as a placeholder email.**

- The parent chooses a username. It is lowercased and must match `^[a-z0-9][a-z0-9._-]{2,29}$`, so it never contains `@`. The Zod schema lives in `packages/types`.
- The Stack user is created with `primaryEmail = <username>@<CHILD_LOGIN_DOMAIN>`, with `primaryEmailVerified: true` and `primaryEmailAuthEnabled: true`.
- `CHILD_LOGIN_DOMAIN` is a server config value. It **must be a domain we own**, so nothing Stack sends to that address can reach a stranger. It is chosen and checked before release.
- Usernames are **unique across the app**, not only within a family. The sign-in screen doesn't know the family, so the address cannot contain a family id. Stack already refuses two users with the same sign-in email. A taken username returns a typed "username taken" error, and the parent picks another one, for example `lea.m`.
- `users.email` stores the placeholder address. The UI shows the username, which is the part before `@`. No schema change.
- **Sign-in page.** The app gets its own sign-in page, and Stack's `urls.signIn` points to it, because `StackHandler`'s form accepts only an email. The field is labelled "E-mail ou nom d'utilisateur". Input without `@` is turned into `<input>@<CHILD_LOGIN_DOMAIN>`, then `signInWithCredential` is called. Adults keep signing in with their real email.
- A parent who prefers can enter a real email for the child instead. It goes through the same create call.

Two server-only operations in a `FamilyAccountService`, exposed via `POST /api/v1/family/children` and `PUT /api/v1/family/children/:userId/password`. Both go through `controller()`, so the caller is authenticated first.

**Create child**

1. Validate the body with a Zod schema from `packages/types`.
2. Check that the caller is a `parent` in `family_members`. Otherwise → 404.
3. `stackServerApp.createUser({ primaryEmail, password, displayName, primaryEmailAuthEnabled: true, primaryEmailVerified: true, serverMetadata: { familyId, role: 'child' } })`. Here `primaryEmail` is the placeholder address built from the username, or the real email if the parent gave one. A duplicate email → typed "username taken" error, nothing else written.
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
- Whether Stack allows password sign-in when `primaryEmailVerified` is false depends on project settings. Child users are created verified. Check in the Stack dashboard before release.
- Usernames are global, so a short name like `lea` may already be taken by another family. Accepted: the parent picks a variant.
- The app owns its sign-in page instead of relying on `StackHandler`'s, so it has to handle the loading, error and two-factor states itself.
- A child account has no real inbox. Account recovery always goes through the parent's password reset, which this ADR already provides.
- `CHILD_LOGIN_DOMAIN` must stay under our control for as long as child accounts exist. If the domain lapses, someone else could receive mail sent to those addresses.

## Rejected alternatives

- **Email invitation, child sets the password** — the standard flow with no privileged route, but rejected in the spec interview: the parent must be able to create and reset the login.
- **Migrate to Better Auth Neon Auth first** — widens this change into an auth migration and requires giving the app an admin-role identity.
- **Create children manually in the Stack dashboard** — not usable by parents; not reproducible.
- **Calling Stack from the client** — would expose the server key.
- **Family id in the placeholder address** (`lea.<familyId>@…`) — usernames would only need to be unique per family, but the child would have to type a family code at sign-in.
- **Placeholder addresses on a made-up domain** (`kids.example`, `.invalid`) — Stack may send verification or security mail there. If the domain exists or is later registered, a stranger receives it, and Stack's email validation may reject reserved domains anyway.
- **Real email only** (the decision 10 fallback) — works without changes, but a young child has to type a full email address.
- **Wait for Better Auth's username plugin** — native usernames, but it ties this feature to the auth migration.
