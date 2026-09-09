import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '@/lib/db';
import { summarizeArticle, type Summarizer } from '@/lib/ai/summarize';

const ARTICLE = {
  id: 'article-1',
  title: 'Introducing a smaller model',
  sourceName: 'OpenAI',
  sourceCategory: 'OFFICIAL',
  sourceUrl: 'https://openai.com/index/article',
  publishedAt: new Date('2026-06-03T08:00:00Z'),
  rawContent: '<p>We are releasing a compact model.</p>',
  maxLevel: 3,
};

const VALID_JSON = JSON.stringify({
  titleLocalized: 'Un modele compact arrive',
  summary:
    'OpenAI publie une version reduite de son modele. Elle garde l essentiel des performances.',
  whyItMatters: 'Un cout plus faible ouvre ces outils a de petits projets.',
  category: 'MODEL_RELEASE',
  level: 1,
  skipReason: null,
});

function provider(responses: (string | Error)[]): Summarizer & { calls: number } {
  let index = 0;
  return {
    calls: 0,
    async generateStructured() {
      const response = responses[Math.min(index, responses.length - 1)];
      index += 1;
      this.calls += 1;
      if (response instanceof Error) throw response;
      return {
        content: response,
        inputTokens: 3000,
        outputTokens: 300,
        cachedInputTokens: 0,
        model: 'deepseek-v4-flash',
      };
    },
  };
}

beforeEach(() => {
  process.env.AI_SUMMARIZATION_ENABLED = 'true';
  process.env.AI_DAILY_COST_LIMIT_USD = '1';
});

afterEach(() => {
  process.env.AI_SUMMARIZATION_ENABLED = 'false';
  vi.restoreAllMocks();
});

describe('resume d un article', () => {
  it('ne fait aucun appel quand le coupe-circuit est ferme', async () => {
    process.env.AI_SUMMARIZATION_ENABLED = 'false';
    const fake = provider([VALID_JSON]);

    expect(await summarizeArticle(ARTICLE, 1, fake)).toEqual({ status: 'disabled' });
    expect(fake.calls).toBe(0);
    expect(await prisma.aIGenerationLog.count()).toBe(0);
  });

  it('enregistre le resume et trace la generation', async () => {
    const outcome = await summarizeArticle(ARTICLE, 1, provider([VALID_JSON]));

    expect(outcome).toMatchObject({ status: 'summarized' });
    const log = await prisma.aIGenerationLog.findFirstOrThrow();
    expect(log.success).toBe(true);
    expect(log.attemptNumber).toBe(1);
    expect(Number(log.costUsd)).toBeGreaterThan(0);
    expect(log.metadata).toMatchObject({ articleId: ARTICLE.id });
  });

  it('retente une fois en temperature basse quand le JSON est casse', async () => {
    const fake = provider(['{ pas du json', VALID_JSON]);
    const outcome = await summarizeArticle(ARTICLE, 2, fake);

    expect(outcome).toMatchObject({ status: 'summarized' });
    expect(fake.calls).toBe(2);
    expect(await prisma.aIGenerationLog.count()).toBe(2);
  });

  it('abandonne apres deux sorties invalides', async () => {
    const fake = provider(['{ pas du json', '{ toujours pas']);
    const outcome = await summarizeArticle(ARTICLE, 1, fake);

    expect(outcome).toMatchObject({ status: 'failed' });
    expect(fake.calls).toBe(2);
  });

  it('laisse l article a retraiter en cas de panne reseau', async () => {
    const fake = provider([new Error('502 Bad Gateway')]);
    const outcome = await summarizeArticle(ARTICLE, 1, fake);

    expect(outcome).toMatchObject({ status: 'retryable' });
    expect(await prisma.aIGenerationLog.count()).toBe(0);
  });

  it('ne retente pas quand la langue est de mauvaise qualite', async () => {
    const fake = provider([
      JSON.stringify({
        titleLocalized: 'Une annonce revolutionnaire',
        summary: 'Cette annonce va disrupter le marche et faire sens en termes de couts.',
        whyItMatters: 'Il est important de noter que cela marque un tournant.',
        category: 'PRODUCT',
        level: 1,
        skipReason: null,
      }),
    ]);

    expect(await summarizeArticle(ARTICLE, 1, fake)).toEqual({
      status: 'failed',
      reason: 'language_quality_low',
    });
    expect(fake.calls).toBe(1);
  });

  it('remonte un article ecarte par le modele', async () => {
    const fake = provider([
      JSON.stringify({
        titleLocalized: '',
        summary: '',
        whyItMatters: '',
        category: 'OTHER',
        level: 1,
        skipReason: 'contenu purement marketing',
      }),
    ]);

    expect(await summarizeArticle(ARTICLE, 1, fake)).toEqual({
      status: 'skipped',
      reason: 'contenu purement marketing',
    });
  });

  it('bloque les generations quand le plafond de cout est atteint', async () => {
    process.env.AI_DAILY_COST_LIMIT_USD = '0.0000001';
    await prisma.aIGenerationLog.create({
      data: {
        purpose: 'NEWSLETTER_SUMMARY',
        model: 'deepseek-v4-flash',
        attemptNumber: 1,
        inputTokens: 3000,
        outputTokens: 300,
        cachedInputTokens: 0,
        costUsd: 0.5,
        success: true,
      },
    });

    const fake = provider([VALID_JSON]);
    expect(await summarizeArticle(ARTICLE, 1, fake)).toEqual({ status: 'cost_limit_reached' });
    expect(fake.calls).toBe(0);
  });
});
