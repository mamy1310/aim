import { describe, expect, it } from 'vitest';

import fr from '@/messages/fr.json';
import { MAX_LEVEL, levelKey } from '@/lib/levels';

type Tree = { [key: string]: string | Tree | (string | Tree)[] };

function flatten(node: Tree | string | (string | Tree)[], prefix = ''): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]];
  if (Array.isArray(node)) return node.flatMap((v, i) => flatten(v, `${prefix}.${i}`));
  return Object.entries(node).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
}

describe('messages fr.json', () => {
  const entries = flatten(fr as Tree);

  it('ne contient aucune valeur vide ou a completer', () => {
    const suspects = entries.filter(([, value]) => !value.trim() || /TODO|FIXME/i.test(value));
    expect(suspects.map(([key]) => key)).toEqual([]);
  });

  it('declare un libelle pour chaque niveau', () => {
    const keys = new Set(entries.map(([key]) => key));
    for (let level = 1; level <= MAX_LEVEL; level += 1) {
      expect(keys.has(`common.${levelKey(level)}`)).toBe(true);
    }
  });
});

describe('levelKey', () => {
  it('borne les niveaux hors echelle', () => {
    expect(levelKey(0)).toBe('levels.1');
    expect(levelKey(2)).toBe('levels.2');
    expect(levelKey(99)).toBe(`levels.${MAX_LEVEL}`);
  });
});
