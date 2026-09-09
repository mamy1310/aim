import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/db';
import { SESSION_COOKIE } from '@/lib/auth/session';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: 'STUDENT' | 'ADMIN';
  emailVerified: Date | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const sessionToken = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      expires: true,
      user: {
        select: { id: true, email: true, name: true, role: true, emailVerified: true },
      },
    },
  });

  if (!session || session.expires.getTime() < Date.now()) return null;
  return session.user;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}
