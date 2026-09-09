'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/auth/guards';
import { SESSION_COOKIE, createSession, destroySession } from '@/lib/auth/session';
import {
  authenticate,
  changePassword,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  verifyEmail,
} from '@/lib/auth/service';

export type ActionResult = { ok: true } | { ok: false; error: string };

function strip(result: { ok: true; userId?: string } | { ok: false; error: string }): ActionResult {
  return result.ok ? { ok: true } : result;
}

async function clientIp(): Promise<string> {
  const list = await headers();
  return list.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnue';
}

export async function registerAction(input: unknown): Promise<ActionResult> {
  const result = await registerUser(input);
  if (result.ok && result.userId) await createSession(result.userId);
  return strip(result);
}

export async function loginAction(input: unknown): Promise<ActionResult> {
  const result = await authenticate(input, await clientIp());
  if (result.ok && result.userId) await createSession(result.userId);
  return strip(result);
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  return strip(await requestPasswordReset(input));
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  return strip(await resetPassword(input));
}

export async function verifyEmailAction(token: string): Promise<ActionResult> {
  return strip(await verifyEmail(token));
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const result = await updateProfile(user, input);
  if (result.ok) revalidatePath('/account');
  return strip(result);
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  return strip(await changePassword(user.id, input));
}

export async function revokeOtherSessionsAction(): Promise<ActionResult> {
  const user = await requireUser();
  const currentToken = (await cookies()).get(SESSION_COOKIE)?.value;

  await prisma.session.deleteMany({
    where: { userId: user.id, NOT: { sessionToken: currentToken ?? '' } },
  });

  revalidatePath('/account');
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/login');
}
