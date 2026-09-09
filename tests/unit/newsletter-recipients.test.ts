import { describe, expect, it } from 'vitest';

import { filterRecipientsByLevel } from '@/lib/newsletter/recipients';

const subscribers = [
  { email: 'tout@example.com', maxLevel: null },
  { email: 'niveau1@example.com', maxLevel: 1 },
  { email: 'niveau2@example.com', maxLevel: 2 },
  { email: 'niveau3@example.com', maxLevel: 3 },
];

describe('filterRecipientsByLevel', () => {
  it('garde tout le monde pour un article de niveau 1', () => {
    expect(filterRecipientsByLevel(subscribers, 1)).toHaveLength(4);
  });

  it('ecarte les abonnes dont la limite est trop basse', () => {
    expect(filterRecipientsByLevel(subscribers, 2).map((s) => s.email)).toEqual([
      'tout@example.com',
      'niveau2@example.com',
      'niveau3@example.com',
    ]);
  });

  it('ne garde que les abonnes sans limite ou au niveau maximum', () => {
    expect(filterRecipientsByLevel(subscribers, 3).map((s) => s.email)).toEqual([
      'tout@example.com',
      'niveau3@example.com',
    ]);
  });

  it('peut ne retenir personne', () => {
    expect(filterRecipientsByLevel([{ maxLevel: 1 }], 3)).toEqual([]);
  });

  it('accepte une liste vide', () => {
    expect(filterRecipientsByLevel([], 1)).toEqual([]);
  });
});
