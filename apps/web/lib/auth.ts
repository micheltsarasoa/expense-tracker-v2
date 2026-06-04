import { db, users } from '@expense-tracker/db';
import { AppError } from '@expense-tracker/types';
import { stackServerApp } from './stack';

/**
 * Ensure a `public.users` row exists for the authenticated Stack user so that
 * FKs (budgets/transactions/…→ users.id) resolve. Stack Auth owns identity;
 * this mirrors the user into our app table on first authenticated access.
 * Idempotent via ON CONFLICT DO NOTHING.
 */
async function ensureAppUser(user: {
  id: string;
  primaryEmail: string | null;
  displayName: string | null;
}): Promise<void> {
  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.primaryEmail ?? `${user.id}@no-email.local`,
      name: user.displayName ?? 'User',
    })
    .onConflictDoNothing();
}

export async function getAuthenticatedUser(): Promise<{ userId: string }> {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw AppError.unauthorized();
  }
  await ensureAppUser(user);
  return { userId: user.id };
}

/**
 * Returns the authenticated user's id for use in Server Components.
 * If unauthenticated, Stack Auth redirects to the sign-in page (never returns).
 * Route handlers use `getAuthenticatedUser` instead, which throws a 401.
 */
export async function getUserId(): Promise<string> {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  await ensureAppUser(user);
  return user.id;
}
