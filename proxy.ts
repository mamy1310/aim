import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

// Cookie presence only. Session and role are checked in the server layouts.
export function proxy(request: NextRequest) {
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (hasSession) return NextResponse.next();

  const login = new URL('/login', request.url);
  login.searchParams.set('suite', request.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/admin/:path*'],
};
