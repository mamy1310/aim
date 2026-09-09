import 'server-only';

import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';

import { prisma } from '@/lib/db';

export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const secure = (process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').startsWith(
  'https://',
);

export const SESSION_COOKIE = secure ? '__Secure-authjs.session-token' : 'authjs.session-token';

export async function createSession(userId: string): Promise<void> {
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);

  await prisma.session.create({ data: { sessionToken, userId, expires } });

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionToken } });
    store.delete(SESSION_COOKIE);
  }
}
