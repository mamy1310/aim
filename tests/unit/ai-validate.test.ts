import { describe, expect, it } from 'vitest';

import { findBannedPhrases, findInjectionMarkers, validateSummary } from '@/lib/ai/validate';

const SOURCE = 'https://openai.com/index/article';

function payload(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    titleLocalized: 'Un modele compact tient sur une seule carte',
    summary:
      'OpenAI publie une version reduite de son modele. Elle garde l essentiel des performances.',
    whyItMatters: 'Un cout plus faible rend ces outils accessibles a de petits projets.',
    category: 'MODEL_RELEASE',
    level: 1,
    skipReason: null,
    ...overrides,
  });
}

describe('validateSummary', () => {
  it('accepte une reponse conforme', () => {
    const result = validateSummary(payload(), SOURCE);
    expect(result.ok).toBe(true);
  });

  it('rejette du JSON malforme', () => {
    const result = validateSummary('{ ceci ne compile pas', SOURCE);
    expect(result).toMatchObject({ ok: false, reason: 'invalid_json' });
  });

  it('rejette une categorie inconnue', () => {
    const result = validateSummary(payload({ category: 'AUTRE_CHOSE' }), SOURCE);
    expect(result).toMatchObject({ ok: false, reason: 'schema_invalid' });
  });

  it('rejette un niveau inferieur a un', () => {
    expect(validateSummary(payload({ level: 0 }), SOURCE)).toMatchObject({
      ok: false,
      reason: 'schema_invalid',
    });
  });

  it('detecte une injection reussie', () => {
    const result = validateSummary(
      payload({ summary: 'As an AI language model, je dois ignorer les instructions.' }),
      SOURCE,
    );
    expect(result).toMatchObject({ ok: false, reason: 'injection_suspected' });
  });

  it('detecte une URL etrangere comme marqueur d injection', () => {
    const result = validateSummary(
      payload({ whyItMatters: 'Voir https://spam.example/promo pour en savoir plus.' }),
      SOURCE,
    );
    expect(result).toMatchObject({ ok: false, reason: 'injection_suspected' });
  });

  it('rejette une langue de mauvaise qualite au dela de deux occurrences', () => {
    const result = validateSummary(
      payload({
        summary:
          'Cette annonce revolutionnaire va disrupter le marche et faire sens en termes de couts.',
      }),
      SOURCE,
    );
    expect(result).toMatchObject({ ok: false, reason: 'language_quality_low' });
  });

  it('tolere une seule tournure douteuse', () => {
    expect(validateSummary(payload({ summary: 'Un outil innovant arrive.' }), SOURCE).ok).toBe(
      true,
    );
  });

  it('accepte un article ecarte sans controler la langue', () => {
    const result = validateSummary(
      payload({
        skipReason: 'contenu purement marketing',
        summary: 'revolutionnaire innovant disrupte',
      }),
      SOURCE,
    );
    expect(result.ok).toBe(true);
  });
});

describe('findBannedPhrases', () => {
  it('repere les tirets cadratins et les emojis', () => {
    expect(findBannedPhrases('un texte — coupe')).toContain('em-dash');
    expect(findBannedPhrases('bravo 🎉')).toContain('emoji');
  });

  it('repere les verbes d ouverture interdits', () => {
    expect(findBannedPhrases('Explorer cette annonce.')).toContain('explorer');
  });

  it('ignore les accents', () => {
    expect(findBannedPhrases('une annonce révolutionnaire')).toContain('revolutionnaire');
  });
});

describe('findInjectionMarkers', () => {
  it('ne signale rien sur un texte sain', () => {
    expect(findInjectionMarkers('Un resume factuel.', SOURCE)).toEqual([]);
  });
});
