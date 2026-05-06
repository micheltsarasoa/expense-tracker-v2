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
  const init: RequestInit = { method };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { 'content-type': 'application/json' };
  }
  return new NextRequest(u, init);
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
