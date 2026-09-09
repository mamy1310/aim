import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token'];

// ponytail: le proxy ne verifie que la presence du cookie de session, pas sa validite
// ni le role. La verification reelle (session en base, role ADMIN) est faite dans les
// layouts serveur, seul endroit ou l'acces a la base est legitime a chaque rendu.
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
