export type SelectableArticle = {
  id: string;
  publishedAt: Date;
  source: { category: 'OFFICIAL' | 'RESEARCH' | 'COMMUNITY' };
};

const CATEGORY_SCORE: Record<SelectableArticle['source']['category'], number> = {
  OFFICIAL: 3,
  RESEARCH: 2,
  COMMUNITY: 1,
};

// Les flux RSS ne donnent aucune metrique de popularite : on classe par
// fiabilite de la source, puis par fraicheur.
export function rankArticles<T extends SelectableArticle>(articles: T[]): T[] {
  return [...articles].sort((a, b) => {
    const byCategory = CATEGORY_SCORE[b.source.category] - CATEGORY_SCORE[a.source.category];
    if (byCategory !== 0) return byCategory;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
}

export function selectArticleOfTheDay<T extends SelectableArticle>(articles: T[]): T | null {
  return rankArticles(articles)[0] ?? null;
}
