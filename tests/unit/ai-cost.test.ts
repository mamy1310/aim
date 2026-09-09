import { describe, expect, it } from 'vitest';

import { estimateCost } from '@/lib/ai/cost';

describe('estimateCost', () => {
  it('facture les tokens non caches au tarif plein', () => {
    expect(estimateCost(1_000_000, 0, 0, 'deepseek-v4-flash')).toBeCloseTo(0.14, 6);
  });

  it('applique la reduction sur les tokens caches', () => {
    expect(estimateCost(1_000_000, 0, 1_000_000, 'deepseek-v4-flash')).toBeCloseTo(0.0028, 6);
  });

  it('facture la sortie', () => {
    expect(estimateCost(0, 1_000_000, 0, 'deepseek-v4-flash')).toBeCloseTo(0.28, 6);
  });

  it('reste realiste sur un article', () => {
    expect(estimateCost(3000, 300, 0, 'deepseek-v4-flash')).toBeLessThan(0.001);
  });

  it('retombe sur la grille par defaut pour un modele inconnu', () => {
    expect(estimateCost(1_000_000, 0, 0, 'modele-inconnu')).toBeCloseTo(0.14, 6);
  });
});
