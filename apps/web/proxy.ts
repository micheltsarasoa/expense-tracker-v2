import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }
  return NextResponse.next();
}

/** Protect all routes except auth pages, Stack Auth handler, and static files. */
export const proxyConfig = {
  matcher: ['/((?!auth/|handler/|api/auth/|_next/|favicon\\.ico).*)'],
};
