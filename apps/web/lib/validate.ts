import type { NextRequest } from 'next/server';
import type { ZodType } from 'zod';
import { AppError } from '@expense-tracker/types';

function formatZodError(error: import('zod').ZodError): string {
  return error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function parseBody<T>(req: NextRequest, schema: ZodType<T, any, any>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw AppError.validation('Request body must be valid JSON');
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw AppError.validation(formatZodError(result.error));
  }
  return result.data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseQuery<T>(searchParams: URLSearchParams, schema: ZodType<T, any, any>): T {
  const raw = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw AppError.validation(formatZodError(result.error));
  }
  return result.data;
}

/** Validate an already-parsed value (e.g. a Server Action argument). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseInput<T>(value: unknown, schema: ZodType<T, any, any>): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw AppError.validation(formatZodError(result.error));
  }
  return result.data;
}
