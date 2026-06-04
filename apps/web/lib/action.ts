import { AppError } from '@expense-tracker/types';
import { logger } from './logger';

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Wraps a Server Action body and returns a typed result the client can use to
 * toast success/failure. Known `AppError`s surface their user-facing message;
 * unexpected errors are logged and collapsed to a generic message.
 *
 * Do not call `redirect()` inside `fn` — its control-flow throw would be
 * swallowed here. Mutations should `revalidatePath` and return instead.
 */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    if (err instanceof AppError) {
      return { ok: false, error: err.message };
    }
    logger.error({ err }, 'Unhandled error in server action');
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}
