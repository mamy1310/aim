import { describe, expect, it } from 'vitest';

import { emailSchema, loginSchema, passwordSchema, registerSchema } from '@/lib/auth/schemas';

describe('emailSchema', () => {
  it('normalise la casse et les espaces', () => {
    expect(emailSchema.parse('  Lea@Example.COM ')).toBe('lea@example.com');
  });

  it('refuse une adresse invalide', () => {
    expect(emailSchema.safeParse('lea@').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it.each([
    ['court1', false],
    ['motdepassesanschiffre', false],
    ['1234567890123', false],
    ['motdepasse1', true],
  ])('%s -> %s', (value, expected) => {
    expect(passwordSchema.safeParse(value).success).toBe(expected);
  });
});

describe('registerSchema', () => {
  it('exige un nom non vide', () => {
    expect(
      registerSchema.safeParse({ name: '   ', email: 'a@b.fr', password: 'motdepasse1' }).success,
    ).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepte un mot de passe faible pour la connexion', () => {
    expect(loginSchema.safeParse({ email: 'a@b.fr', password: 'x' }).success).toBe(true);
  });
});
