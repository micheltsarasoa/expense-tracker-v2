import { NextResponse } from 'next/server';
import { AppError, type ApiResponse } from '@expense-tracker/types';
import { logger } from './logger';

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data } as ApiResponse<T>, { status });
}

export function apiError(err: AppError): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: { code: err.code, message: err.message } } as ApiResponse<never>,
    { status: err.status },
  );
}

export function handleError(err: unknown): NextResponse<ApiResponse<never>> {
  if (err instanceof AppError) {
    return apiError(err);
  }
  logger.error({ err }, 'Unhandled error in route handler');
  return apiError(AppError.internal());
}
