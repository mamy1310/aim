import { randomBytes } from 'node:crypto';

import { prisma } from '@/lib/db';

export const TOKEN_LENGTH = 32;
export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export type TokenPurpose = 'verify-email' | 'reset-password';

export function generateToken(): string {
  return randomBytes(24).toString('base64url').slice(0, TOKEN_LENGTH);
}

function identifierFor(purpose: TokenPurpose, email: string): string {
  return `${purpose}:${email}`;
}

export async function issueToken(purpose: TokenPurpose, email: string, ttlMs: number) {
  const identifier = identifierFor(purpose, email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  const token = generateToken();
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(Date.now() + ttlMs) },
  });
  return token;
}

export async function consumeToken(purpose: TokenPurpose, token: string): Promise<string | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;

  const prefix = `${purpose}:`;
  if (!record.identifier.startsWith(prefix)) return null;

  await prisma.verificationToken.delete({ where: { token } });
  if (record.expires.getTime() < Date.now()) return null;

  return record.identifier.slice(prefix.length);
}
