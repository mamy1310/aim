import { beforeEach, describe, expect, it } from 'vitest';

import {
  LOGIN_MAX_ATTEMPTS,
  LOGIN_WINDOW_MS,
  clearAttempts,
  isRateLimited,
  recordAttempt,
} from '@/lib/auth/rate-limit';

describe('rate limit de connexion', () => {
  beforeEach(() => clearAttempts('ip'));

  it('laisse passer les premieres tentatives', () => {
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS - 1; i += 1) recordAttempt('ip');
    expect(isRateLimited('ip')).toBe(false);
  });

  it('bloque au dela du quota', () => {
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i += 1) recordAttempt('ip');
    expect(isRateLimited('ip')).toBe(true);
  });

  it('oublie les tentatives sorties de la fenetre', () => {
    const start = Date.now();
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i += 1) recordAttempt('ip', start);
    expect(isRateLimited('ip', start + LOGIN_WINDOW_MS + 1)).toBe(false);
  });

  it('remet le compteur a zero apres une connexion reussie', () => {
    for (let i = 0; i < LOGIN_MAX_ATTEMPTS; i += 1) recordAttempt('ip');
    clearAttempts('ip');
    expect(isRateLimited('ip')).toBe(false);
  });
});
