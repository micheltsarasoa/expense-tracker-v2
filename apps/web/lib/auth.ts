import { AppError } from '@expense-tracker/types';
import { stackServerApp } from './stack';

export async function getAuthenticatedUser(): Promise<{ userId: string }> {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw AppError.unauthorized();
  }
  return { userId: user.id };
}

/**
 * Returns the authenticated user's id for use in Server Components.
 * If unauthenticated, Stack Auth redirects to the sign-in page (never returns).
 * Route handlers use `getAuthenticatedUser` instead, which throws a 401.
 */
export async function getUserId(): Promise<string> {
  const user = await stackServerApp.getUser({ or: 'redirect' });
  return user.id;
}
