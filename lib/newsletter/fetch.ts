import Parser from 'rss-parser';

import { prisma } from '@/lib/db';
import { sanitizeSourceContent } from '@/lib/ai/sanitize';

export const MAX_ARTICLE_AGE_DAYS = 14;

export type FeedItem = {
  link?: string;
  title?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  'content:encoded'?: string;
};

export type FeedReader = (url: string) => Promise<FeedItem[]>;

const parser = new Parser<unknown, FeedItem>();

const defaultReader: FeedReader = async (url) => {
  const feed = await parser.parseURL(url);
  return feed.items ?? [];
};

function itemDate(item: FeedItem): Date | null {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Seul le texte est conserve : ni images, ni videos, ni pieces jointes.
function itemText(item: FeedItem): string {
  return sanitizeSourceContent(
    item['content:encoded'] ?? item.content ?? item.contentSnippet ?? '',
  );
}

export async function fetchNewsletterArticles(
  read: FeedReader = defaultReader,
  now = new Date(),
): Promise<{ created: number; skipped: number; failedSources: number }> {
  const sources = await prisma.newsletterSource.findMany({ where: { enabled: true } });
  const oldestAccepted = new Date(now.getTime() - MAX_ARTICLE_AGE_DAYS * 24 * 60 * 60 * 1000);

  let created = 0;
  let skipped = 0;
  let failedSources = 0;

  for (const source of sources) {
    try {
      const items = await read(source.rssUrl);

      for (const item of items) {
        const link = item.link?.trim();
        const publishedAt = itemDate(item);

        if (!link || !item.title || !publishedAt || publishedAt < oldestAccepted) {
          skipped += 1;
          continue;
        }

        const existing = await prisma.newsletterArticle.findUnique({ where: { sourceUrl: link } });
        if (existing) {
          skipped += 1;
          continue;
        }

        await prisma.newsletterArticle.create({
          data: {
            sourceId: source.id,
            sourceUrl: link,
            title: item.title.trim(),
            rawContent: itemText(item) || null,
            publishedAt,
          },
        });
        created += 1;
      }

      await prisma.newsletterSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: now, lastError: null },
      });
    } catch (error) {
      failedSources += 1;
      await prisma.newsletterSource.update({
        where: { id: source.id },
        data: {
          lastFetchedAt: now,
          lastError: error instanceof Error ? error.message : 'erreur inconnue',
        },
      });
    }
  }

  return { created, skipped, failedSources };
}
