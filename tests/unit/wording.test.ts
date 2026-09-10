import { describe, expect, it } from 'vitest';

import fr from '@/messages/fr.json';

type Tree = { [key: string]: string | Tree | (string | Tree)[] };

function flatten(node: Tree | string | (string | Tree)[], prefix = ''): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]];
  if (Array.isArray(node)) return node.flatMap((value, i) => flatten(value, `${prefix}.${i}`));
  return Object.entries(node).flatMap(([key, value]) =>
    flatten(value, prefix ? `${prefix}.${key}` : key),
  );
}

const entries = flatten(fr as Tree);

// Les mots ci-dessous n'existent en francais qu'avec leurs accents : les voir
// tels quels signale une chaine saisie sans diacritiques.
const UNACCENTED = [
  'necessaire',
  'deja',
  'apres',
  'tres',
  'etre',
  'meme',
  'resume',
  'cout',
  'delai',
  'securite',
  'verifie',
  'redige',
  'lecon',
  'periode',
  'reussite',
  'donnees',
  'desabonn',
  'generation',
  'reponse',
  'categorie',
  'numerique',
  'echeance',
  'achevement',
  'edition',
  'editeur',
  'completion',
  'difficulte',
  'specialiste',
  'hebergement',
  'confidentialite',
];

describe('typographie francaise', () => {
  it('accentue les mots qui l exigent', () => {
    // Une frontiere \b casse apres une lettre accentuee : on borne sur les
    // lettres Unicode pour ne pas retrouver « tres » dans « parametres ».
    const pattern = new RegExp(`(?<!\\p{L})(${UNACCENTED.join('|')})`, 'iu');
    const offenders = entries.filter(([, value]) => pattern.test(value));
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it('elide les articles au lieu de laisser une lettre isolee', () => {
    const offenders = entries.filter(([, value]) =>
      /(?<!\p{L}) [ldnjcsmt] [aàâeéèêiîouyh]/iu.test(value),
    );
    expect(offenders.map(([key]) => key)).toEqual([]);
  });
});

describe('contraintes de vocabulaire', () => {
  it('n emploie jamais le mot certificat, hors mention de non-equivalence', () => {
    const offenders = entries.filter(
      ([, value]) =>
        /certificat/i.test(value) &&
        !/ne constitue pas une certification professionnelle/i.test(value),
    );
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it('n emploie pas de tiret cadratin dans les textes envoyes par email', () => {
    const offenders = entries.filter(
      ([key, value]) => key.startsWith('emails.') && /—/.test(value),
    );
    expect(offenders.map(([key]) => key)).toEqual([]);
  });

  it('n emploie aucun emoji dans les textes envoyes par email', () => {
    const offenders = entries.filter(
      ([key, value]) => key.startsWith('emails.') && /\p{Extended_Pictographic}/u.test(value),
    );
    expect(offenders.map(([key]) => key)).toEqual([]);
  });
});
