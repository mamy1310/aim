import { prisma } from '@/lib/db';
import { summarizeArticle, type Summarizer } from '@/lib/ai/summarize';
import { selectArticleOfTheDay } from '@/lib/newsletter/select';
import { env } from '@/lib/env';
import { MAX_LEVEL } from '@/lib/levels';

export const CANDIDATE_WINDOW_HOURS = 30;
export const MAX_CANDIDATES_PER_RUN = 3;

export type SummarizeJobResult =
  | { status: 'already_done' }
  | { status: 'disabled' }
  | { status: 'no_candidate' }
  | { status: 'cost_limit_reached' }
  | { status: 'retry_later'; reason: string }
  | { status: 'failed'; reason: string }
  | { status: 'summarized'; summaryId: string };

function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// The 8h and 10h runs are safety nets.
export async function runSummarizeJob(
  attemptNumber: number,
  provider?: Summarizer,
  now = new Date(),
): Promise<SummarizeJobResult> {
  const existing = await prisma.newsletterArticleSummary.findFirst({
    where: { generatedAt: { gte: startOfUtcDay(now) } },
    select: { id: true },
  });
  if (existing) return { status: 'already_done' };

  if (!env.aiSummarizationEnabled) return { status: 'disabled' };

  const since = new Date(now.getTime() - CANDIDATE_WINDOW_HOURS * 60 * 60 * 1000);
  const candidates = await prisma.newsletterArticle.findMany({
    where: { status: 'PENDING', createdAt: { gte: since } },
    include: { source: true },
  });

  const remaining = [...candidates];

  for (let attempt = 0; attempt < MAX_CANDIDATES_PER_RUN; attempt += 1) {
    const article = selectArticleOfTheDay(remaining);
    if (!article) return { status: 'no_candidate' };

    const outcome = await summarizeArticle(
      {
        id: article.id,
        title: article.title,
        sourceName: article.source.name,
        sourceCategory: article.source.category,
        sourceUrl: article.sourceUrl,
        publishedAt: article.publishedAt,
        rawContent: article.rawContent,
        maxLevel: MAX_LEVEL,
      },
      attemptNumber,
      provider,
    );

    if (outcome.status === 'disabled') return { status: 'disabled' };
    if (outcome.status === 'cost_limit_reached') return { status: 'cost_limit_reached' };

    if (outcome.status === 'retryable') {
      return { status: 'retry_later', reason: outcome.reason };
    }

    if (outcome.status === 'failed') {
      await prisma.newsletterArticle.update({
        where: { id: article.id },
        data: { status: 'FAILED', skipReason: outcome.reason },
      });
      return { status: 'failed', reason: outcome.reason };
    }

    if (outcome.status === 'skipped') {
      await prisma.newsletterArticle.update({
        where: { id: article.id },
        data: { status: 'SKIPPED', skipReason: outcome.reason },
      });
      remaining.splice(
        remaining.findIndex((candidate) => candidate.id === article.id),
        1,
      );
      continue;
    }

    const summary = await prisma.newsletterArticleSummary.create({
      data: {
        articleId: article.id,
        titleLocalized: outcome.payload.titleLocalized,
        summary: outcome.payload.summary,
        whyItMatters: outcome.payload.whyItMatters,
        category: outcome.payload.category,
        level: outcome.payload.level,
        model: outcome.model,
      },
    });

    await prisma.newsletterArticle.update({
      where: { id: article.id },
      data: { status: 'SUMMARIZED' },
    });

    return { status: 'summarized', summaryId: summary.id };
  }

  return { status: 'no_candidate' };
}
