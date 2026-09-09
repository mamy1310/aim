import { describe, expect, it } from 'vitest';

import { displayName, formatDateLine } from '@/lib/user';

describe('displayName', () => {
  it('prend le prenom quand le nom est renseigne', () => {
    expect(displayName({ name: 'Lea Bonnaire', email: 'lea@example.com' })).toBe('Lea');
  });

  it('retombe sur la partie locale de l adresse', () => {
    expect(displayName({ name: null, email: 'lea.bonnaire@example.com' })).toBe('lea.bonnaire');
  });
});

describe('formatDateLine', () => {
  it('produit une date lisible et une heure', () => {
    const line = formatDateLine(new Date('2026-06-03T09:24:00Z'), 'fr-FR');
    expect(line).toMatch(/juin/);
    expect(line).toContain('·');
  });
});
