import { AppError } from '@expense-tracker/types';
import { stackServerApp } from './stack';

export async function getAuthenticatedUser(): Promise<{ userId: string }> {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw AppError.unauthorized();
  }
  return { userId: user.id };
}
