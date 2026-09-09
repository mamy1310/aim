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
