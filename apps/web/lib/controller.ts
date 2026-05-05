import type { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@expense-tracker/types';
import { getAuthenticatedUser } from './auth';
import { apiSuccess, handleError } from './api';

/** Extract a required URL segment or throw 400. */
export function requireParam(params: Record<string, string>, key: string): string {
  const val = params[key];
  if (!val) throw AppError.validation(`Missing route parameter: ${key}`);
  return val;
}

export interface RouteContext {
  params: Promise<Record<string, string>>;
}

type Handler<TResult> = (
  req: NextRequest,
  userId: string,
  params: Record<string, string>,
) => Promise<TResult>;

/**
 * Wraps a route handler with the standard Auth → Execute → Respond pipeline.
 * The returned function is a valid Next.js Route Handler export.
 *
 * Usage:
 *   export const GET = controller(async (_req, userId) =>
 *     myService.list(userId)
 *   );
 *   export const POST = controller(async (req, userId) => {
 *     const data = await parseBody(req, schema);
 *     return myService.create(userId, data);
 *   }, 201);
 */
export function controller<TResult>(
  handler: Handler<TResult>,
  status = 200,
): (req: NextRequest, ctx: RouteContext) => Promise<NextResponse> {
  return async (req, ctx) => {
    try {
      const { userId } = await getAuthenticatedUser();
      const params = await ctx.params;
      const result = await handler(req, userId, params);
      return apiSuccess(result, status);
    } catch (err) {
      return handleError(err);
    }
  };
}
