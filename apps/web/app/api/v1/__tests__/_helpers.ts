import { NextRequest } from 'next/server';

/**
 * Creates a NextRequest for testing route handlers.
 */
export function makeReq(
  method: string,
  url: string,
  body?: unknown,
  query?: Record<string, string>,
): NextRequest {
  const u = new URL(url);
  if (query) {
    Object.entries(query).forEach(([k, v]) => u.searchParams.set(k, v));
  }
  return new NextRequest(
    u,
    body !== undefined
      ? { method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }
      : { method },
  );
}

/**
 * Creates a NextRequest with a FormData body.
 */
export function makeFormReq(method: string, url: string, formData: FormData): NextRequest {
  return new NextRequest(new URL(url), { method, body: formData });
}

/**
 * Creates the Next.js route context with params as a resolved Promise.
 */
export function makeCtx(params: Record<string, string> = {}) {
  return { params: Promise.resolve(params) };
}
