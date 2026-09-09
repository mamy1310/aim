import { describe, expect, it } from 'vitest';

import { rankArticles, selectArticleOfTheDay } from '@/lib/newsletter/select';

function article(id: string, category: 'OFFICIAL' | 'RESEARCH' | 'COMMUNITY', iso: string) {
  return { id, publishedAt: new Date(iso), source: { category } };
}

describe('selectArticleOfTheDay', () => {
  it('renvoie null sans candidat', () => {
    expect(selectArticleOfTheDay([])).toBeNull();
  });

  it('prefere une source officielle a une source de recherche', () => {
    const chosen = selectArticleOfTheDay([
      article('recherche', 'RESEARCH', '2026-06-03T10:00:00Z'),
      article('officiel', 'OFFICIAL', '2026-06-01T10:00:00Z'),
    ]);
    expect(chosen?.id).toBe('officiel');
  });

  it('prefere une source de recherche a une source communautaire', () => {
    const chosen = selectArticleOfTheDay([
      article('communaute', 'COMMUNITY', '2026-06-03T10:00:00Z'),
      article('recherche', 'RESEARCH', '2026-06-01T10:00:00Z'),
    ]);
    expect(chosen?.id).toBe('recherche');
  });

  it('departage deux sources egales par la fraicheur', () => {
    const chosen = selectArticleOfTheDay([
      article('ancien', 'OFFICIAL', '2026-06-01T10:00:00Z'),
      article('recent', 'OFFICIAL', '2026-06-03T10:00:00Z'),
    ]);
    expect(chosen?.id).toBe('recent');
  });

  it('ne modifie pas la liste d origine', () => {
    const articles = [
      article('a', 'COMMUNITY', '2026-06-01T10:00:00Z'),
      article('b', 'OFFICIAL', '2026-06-02T10:00:00Z'),
    ];
    rankArticles(articles);
    expect(articles[0].id).toBe('a');
  });
});
