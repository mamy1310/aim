import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { clearAttempts, isRateLimited, recordAttempt } from '@/lib/auth/rate-limit';
import {
  EMAIL_VERIFICATION_TTL_MS,
  PASSWORD_RESET_TTL_MS,
  consumeToken,
  issueToken,
} from '@/lib/auth/tokens';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/auth/schemas';
import { sendPasswordResetEmail, sendVerificationEmail } from '@/lib/email/auth-emails';

export type ServiceResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { userId?: string } : { userId: string }))
  | { ok: false; error: string };

export async function registerUser(input: unknown): Promise<ServiceResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: 'email_taken' };

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });

  const token = await issueToken('verify-email', email, EMAIL_VERIFICATION_TTL_MS);
  await sendVerificationEmail(email, token);

  return { ok: true, userId: user.id };
}

export async function authenticate(input: unknown, rateLimitKey: string): Promise<ServiceResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_credentials' };

  if (isRateLimited(rateLimitKey)) return { ok: false, error: 'rate_limited' };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches =
    user?.passwordHash != null && (await verifyPassword(password, user.passwordHash));

  if (!user || !passwordMatches) {
    recordAttempt(rateLimitKey);
    return { ok: false, error: 'invalid_credentials' };
  }

  clearAttempts(rateLimitKey);
  return { ok: true, userId: user.id };
}

export async function requestPasswordReset(input: unknown): Promise<ServiceResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.passwordHash) {
    const token = await issueToken('reset-password', email, PASSWORD_RESET_TTL_MS);
    await sendPasswordResetEmail(email, token);
  }

  return { ok: true };
}

export async function resetPassword(input: unknown): Promise<ServiceResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const email = await consumeToken('reset-password', parsed.data.token);
  if (!email) return { ok: false, error: 'invalid_token' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false, error: 'invalid_token' };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.password) },
  });
  await prisma.session.deleteMany({ where: { userId: user.id } });

  return { ok: true, userId: user.id };
}

export async function verifyEmail(token: string): Promise<ServiceResult> {
  const email = await consumeToken('verify-email', token);
  if (!email) return { ok: false, error: 'invalid_token' };

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return { ok: true, userId: user.id };
}

export async function updateProfile(
  currentUser: { id: string; email: string },
  input: unknown,
): Promise<ServiceResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const { name, email } = parsed.data;
  const emailChanged = email !== currentUser.email;

  if (emailChanged) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return { ok: false, error: 'email_taken' };
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { name, email, emailVerified: emailChanged ? null : undefined },
  });

  if (emailChanged) {
    const token = await issueToken('verify-email', email, EMAIL_VERIFICATION_TTL_MS);
    await sendVerificationEmail(email, token);
  }

  return { ok: true, userId: currentUser.id };
}

export async function changePassword(userId: string, input: unknown): Promise<ServiceResult> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) return { ok: false, error: 'invalid_credentials' };

  const matches = await verifyPassword(parsed.data.current, user.passwordHash);
  if (!matches) return { ok: false, error: 'invalid_credentials' };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  });

  return { ok: true, userId: user.id };
}
