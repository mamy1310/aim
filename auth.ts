import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';

import { prisma } from '@/lib/db';
import { SESSION_MAX_AGE_MS } from '@/lib/auth/session';
import { env } from '@/lib/env';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database', maxAge: SESSION_MAX_AGE_MS / 1000, updateAge: 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: env.googleOAuthEnabled ? [Google] : [],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});
