import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '@/lib/db';
import { LOGIN_MAX_ATTEMPTS, clearAttempts } from '@/lib/auth/rate-limit';
import {
  authenticate,
  changePassword,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  verifyEmail,
} from '@/lib/auth/service';

const sentEmails: { to: string; subject: string; text: string }[] = [];

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(async (message: { to: string; subject: string; text: string }) => {
    sentEmails.push(message);
  }),
  sendBatch: vi.fn(async () => undefined),
}));

const CREDENTIALS = { name: 'Lea Bonnaire', email: 'lea@example.com', password: 'motdepasse1' };

function tokenFromLastEmail(): string {
  const last = sentEmails.at(-1);
  if (!last) throw new Error('aucun email envoye');
  const match = last.text.match(/\/(?:verify-email|reset-password)\/([\w-]{32})/);
  if (!match) throw new Error(`aucun jeton dans l email : ${last.text}`);
  return match[1];
}

beforeEach(() => {
  sentEmails.length = 0;
  clearAttempts('test-ip');
});

describe('inscription', () => {
  it('cree un compte, hashe le mot de passe et envoie un lien de verification', async () => {
    const result = await registerUser(CREDENTIALS);
    expect(result.ok).toBe(true);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: CREDENTIALS.email } });
    expect(user.passwordHash).not.toBe(CREDENTIALS.password);
    expect(user.passwordHash?.startsWith('$2')).toBe(true);
    expect(user.emailVerified).toBeNull();
    expect(user.role).toBe('STUDENT');

    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe(CREDENTIALS.email);

    const token = await prisma.verificationToken.findFirstOrThrow();
    expect(token.identifier).toBe(`verify-email:${CREDENTIALS.email}`);
  });

  it('refuse une adresse deja utilisee', async () => {
    await registerUser(CREDENTIALS);
    const second = await registerUser({ ...CREDENTIALS, name: 'Autre' });
    expect(second).toEqual({ ok: false, error: 'email_taken' });
    expect(await prisma.user.count()).toBe(1);
  });

  it('refuse un mot de passe trop court', async () => {
    const result = await registerUser({ ...CREDENTIALS, password: 'court1' });
    expect(result).toEqual({ ok: false, error: 'invalid_input' });
    expect(await prisma.user.count()).toBe(0);
  });
});

describe('verification de l adresse', () => {
  it('valide le compte avec le jeton recu', async () => {
    await registerUser(CREDENTIALS);
    const result = await verifyEmail(tokenFromLastEmail());
    expect(result.ok).toBe(true);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: CREDENTIALS.email } });
    expect(user.emailVerified).not.toBeNull();
    expect(await prisma.verificationToken.count()).toBe(0);
  });

  it('refuse un jeton deja consomme', async () => {
    await registerUser(CREDENTIALS);
    const token = tokenFromLastEmail();
    await verifyEmail(token);
    expect(await verifyEmail(token)).toEqual({ ok: false, error: 'invalid_token' });
  });
});

describe('connexion', () => {
  it('accepte les bons identifiants', async () => {
    await registerUser(CREDENTIALS);
    const result = await authenticate(
      { email: CREDENTIALS.email, password: CREDENTIALS.password },
      'test-ip',
    );
    expect(result.ok).toBe(true);
  });

  it('renvoie la meme erreur pour un compte inexistant et un mauvais mot de passe', async () => {
    await registerUser(CREDENTIALS);
    const wrongPassword = await authenticate(
      { email: CREDENTIALS.email, password: 'mauvaisecle1' },
      'test-ip',
    );
    const unknownUser = await authenticate(
      { email: 'inconnu@example.com', password: 'motdepasse1' },
      'test-ip',
    );
    expect(wrongPassword).toEqual({ ok: false, error: 'invalid_credentials' });
    expect(unknownUser).toEqual(wrongPassword);
  });

  it('bloque apres cinq echecs consecutifs', async () => {
    await registerUser(CREDENTIALS);
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i += 1) {
      await authenticate({ email: CREDENTIALS.email, password: 'mauvaisecle1' }, 'test-ip');
    }

    const blocked = await authenticate(
      { email: CREDENTIALS.email, password: CREDENTIALS.password },
      'test-ip',
    );
    expect(blocked).toEqual({ ok: false, error: 'rate_limited' });
  });
});

describe('reinitialisation du mot de passe', () => {
  it('remplace le mot de passe et invalide les sessions', async () => {
    const registered = await registerUser(CREDENTIALS);
    const userId = registered.ok ? registered.userId! : '';
    await prisma.session.create({
      data: { sessionToken: 'jeton-session', userId, expires: new Date(Date.now() + 60_000) },
    });

    await requestPasswordReset({ email: CREDENTIALS.email });
    const result = await resetPassword({
      token: tokenFromLastEmail(),
      password: 'nouveaupass1',
    });
    expect(result.ok).toBe(true);

    expect(await prisma.session.count()).toBe(0);
    const login = await authenticate(
      { email: CREDENTIALS.email, password: 'nouveaupass1' },
      'test-ip',
    );
    expect(login.ok).toBe(true);
  });

  it('ne revele pas l existence du compte', async () => {
    const result = await requestPasswordReset({ email: 'inconnu@example.com' });
    expect(result.ok).toBe(true);
    expect(sentEmails).toHaveLength(0);
  });

  it('refuse un jeton de verification utilise comme jeton de reinitialisation', async () => {
    await registerUser(CREDENTIALS);
    const verificationToken = tokenFromLastEmail();
    const result = await resetPassword({ token: verificationToken, password: 'nouveaupass1' });
    expect(result).toEqual({ ok: false, error: 'invalid_token' });
  });
});

describe('compte', () => {
  it('redemande une verification quand l adresse change', async () => {
    const registered = await registerUser(CREDENTIALS);
    const userId = registered.ok ? registered.userId! : '';
    await verifyEmail(tokenFromLastEmail());

    const result = await updateProfile(
      { id: userId, email: CREDENTIALS.email },
      { name: 'Lea B.', email: 'nouvelle@example.com' },
    );
    expect(result.ok).toBe(true);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    expect(user.email).toBe('nouvelle@example.com');
    expect(user.emailVerified).toBeNull();
    expect(sentEmails.at(-1)?.to).toBe('nouvelle@example.com');
  });

  it('exige le mot de passe actuel pour en changer', async () => {
    const registered = await registerUser(CREDENTIALS);
    const userId = registered.ok ? registered.userId! : '';

    expect(await changePassword(userId, { current: 'faux', next: 'nouveaupass1' })).toEqual({
      ok: false,
      error: 'invalid_credentials',
    });

    const ok = await changePassword(userId, {
      current: CREDENTIALS.password,
      next: 'nouveaupass1',
    });
    expect(ok.ok).toBe(true);
  });
});
