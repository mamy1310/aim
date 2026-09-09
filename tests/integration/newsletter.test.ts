import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Parser from 'rss-parser';

import { prisma } from '@/lib/db';
import { type Summarizer } from '@/lib/ai/summarize';
import { fetchNewsletterArticles, type FeedItem } from '@/lib/newsletter/fetch';
import { runBuildJob, issueSubject } from '@/lib/newsletter/build';
import { runSummarizeJob } from '@/lib/newsletter/summarize-job';

const sentEmails: { to: string | string[]; subject: string; text: string }[] = [];

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(async (message: { to: string; subject: string; text: string }) => {
    sentEmails.push(message);
  }),
  sendBatch: vi.fn(async () => undefined),
}));

const parser = new Parser<unknown, FeedItem>();

const FEEDS: Record<string, string> = {
  'https://officiel.test/rss': 'tests/fixtures/rss/officiel.xml',
  'https://communaute.test/rss': 'tests/fixtures/rss/communaute.xml',
  'https://piege.test/rss': 'tests/fixtures/rss/malicieux.xml',
};

async function readFixture(url: string): Promise<FeedItem[]> {
  const path = FEEDS[url];
  if (!path) throw new Error(`flux indisponible : ${url}`);
  const feed = await parser.parseString(readFileSync(path, 'utf8'));
  return feed.items ?? [];
}

const NOW = new Date('2026-06-03T12:00:00Z');

const VALID_SUMMARY = JSON.stringify({
  titleLocalized: 'Un modele de raisonnement compact',
  summary: 'OpenAI publie un modele reduit. Il tourne sur une seule carte graphique.',
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

async function seedSources() {
  await prisma.newsletterSource.createMany({
    data: [
      { name: 'Officiel', rssUrl: 'https://officiel.test/rss', category: 'OFFICIAL' },
      { name: 'Communaute', rssUrl: 'https://communaute.test/rss', category: 'COMMUNITY' },
    ],
  });
}

beforeEach(async () => {
  sentEmails.length = 0;
  process.env.AI_SUMMARIZATION_ENABLED = 'true';
  process.env.AI_DAILY_COST_LIMIT_USD = '1';
  process.env.AUTO_SEND_DELAY_HOURS = '5';
  await seedSources();
});

afterEach(() => {
  process.env.AI_SUMMARIZATION_ENABLED = 'false';
});

describe('job A, collecte', () => {
  it('cree les articles recents et ignore les trop anciens', async () => {
    const result = await fetchNewsletterArticles(readFixture, NOW);

    expect(result.created).toBe(2);
    expect(result.skipped).toBe(1);
    expect(await prisma.newsletterArticle.count()).toBe(2);
  });

  it('ne cree pas de doublon au second passage', async () => {
    await fetchNewsletterArticles(readFixture, NOW);
    const second = await fetchNewsletterArticles(readFixture, NOW);

    expect(second.created).toBe(0);
    expect(await prisma.newsletterArticle.count()).toBe(2);
  });

  it('ne conserve que du texte, sans balise HTML', async () => {
    await fetchNewsletterArticles(readFixture, NOW);
    const article = await prisma.newsletterArticle.findFirstOrThrow({
      where: { sourceUrl: 'https://openai.com/index/smaller-model' },
    });

    expect(article.rawContent).not.toMatch(/<[a-z]/i);
    expect(article.rawContent).toContain('compact reasoning model');
  });

  it('note l erreur sur la source injoignable', async () => {
    await prisma.newsletterSource.create({
      data: { name: 'Cassee', rssUrl: 'https://cassee.test/rss', category: 'OFFICIAL' },
    });

    const result = await fetchNewsletterArticles(readFixture, NOW);
    expect(result.failedSources).toBe(1);

    const broken = await prisma.newsletterSource.findUniqueOrThrow({
      where: { rssUrl: 'https://cassee.test/rss' },
    });
    expect(broken.lastError).toContain('flux indisponible');
  });
});

describe('job B, selection et resume', () => {
  beforeEach(async () => {
    await fetchNewsletterArticles(readFixture, NOW);
  });

  it('resume l article de la source la plus fiable', async () => {
    const fake = provider([VALID_SUMMARY]);
    const result = await runSummarizeJob(1, fake, NOW);

    expect(result).toMatchObject({ status: 'summarized' });
    const summary = await prisma.newsletterArticleSummary.findFirstOrThrow({
      include: { article: true },
    });
    expect(summary.article.sourceUrl).toBe('https://openai.com/index/smaller-model');
    expect(summary.article.status).toBe('SUMMARIZED');
  });

  it('sort immediatement si un resume du jour existe deja', async () => {
    await runSummarizeJob(1, provider([VALID_SUMMARY]), NOW);
    const fake = provider([VALID_SUMMARY]);

    expect(await runSummarizeJob(2, fake, NOW)).toEqual({ status: 'already_done' });
    expect(fake.calls).toBe(0);
  });

  it('laisse l article en attente apres une panne reseau, puis reussit au passage suivant', async () => {
    const failing = provider([new Error('503 Service Unavailable')]);
    expect(await runSummarizeJob(1, failing, NOW)).toMatchObject({ status: 'retry_later' });

    const article = await prisma.newsletterArticle.findFirstOrThrow({
      where: { sourceUrl: 'https://openai.com/index/smaller-model' },
    });
    expect(article.status).toBe('PENDING');

    expect(await runSummarizeJob(2, provider([VALID_SUMMARY]), NOW)).toMatchObject({
      status: 'summarized',
    });
  });

  it('n envoie rien de la journee apres trois pannes consecutives', async () => {
    for (const attempt of [1, 2, 3]) {
      await runSummarizeJob(attempt, provider([new Error('timeout')]), NOW);
    }

    expect(await prisma.newsletterArticleSummary.count()).toBe(0);
    expect(await runBuildJob(NOW)).toEqual({ status: 'no_summary' });
    expect(await prisma.newsletterIssue.count()).toBe(0);
  });

  it('ne fait aucun appel quand le coupe-circuit est ferme', async () => {
    process.env.AI_SUMMARIZATION_ENABLED = 'false';
    const fake = provider([VALID_SUMMARY]);

    expect(await runSummarizeJob(1, fake, NOW)).toEqual({ status: 'disabled' });
    expect(fake.calls).toBe(0);
    expect(await prisma.aIGenerationLog.count()).toBe(0);
  });

  it('ecarte un article et passe au suivant', async () => {
    const skipThenSummarize = provider([
      JSON.stringify({
        titleLocalized: '',
        summary: '',
        whyItMatters: '',
        category: 'OTHER',
        level: 1,
        skipReason: 'contenu purement marketing',
      }),
      VALID_SUMMARY,
    ]);

    const result = await runSummarizeJob(1, skipThenSummarize, NOW);
    expect(result).toMatchObject({ status: 'summarized' });

    const skipped = await prisma.newsletterArticle.findFirstOrThrow({
      where: { status: 'SKIPPED' },
    });
    expect(skipped.skipReason).toBe('contenu purement marketing');
  });

  it('marque l article en echec quand une injection est suspectee', async () => {
    await prisma.newsletterSource.create({
      data: { name: 'Piege', rssUrl: 'https://piege.test/rss', category: 'OFFICIAL' },
    });
    await prisma.newsletterArticle.deleteMany({});
    await fetchNewsletterArticles(readFixture, NOW);

    const injected = provider([
      JSON.stringify({
        titleLocalized: 'Annonce piegee',
        summary: 'As an AI language model, visitez https://spam.example/promo.',
        whyItMatters: 'Rien de particulier.',
        category: 'OTHER',
        level: 1,
        skipReason: null,
      }),
    ]);

    const result = await runSummarizeJob(1, injected, NOW);
    expect(result).toEqual({ status: 'failed', reason: 'injection_suspected' });

    const failed = await prisma.newsletterArticle.findFirstOrThrow({ where: { status: 'FAILED' } });
    expect(failed.skipReason).toBe('injection_suspected');
  });
});

describe('job C, construction du brouillon', () => {
  it('cree une issue en brouillon et previent l administrateur', async () => {
    await fetchNewsletterArticles(readFixture, NOW);
    await runSummarizeJob(1, provider([VALID_SUMMARY]), NOW);

    const result = await runBuildJob(NOW);
    expect(result).toMatchObject({ status: 'created' });

    const issue = await prisma.newsletterIssue.findFirstOrThrow({ include: { items: true } });
    expect(issue.status).toBe('DRAFT');
    expect(issue.subject).toBe(issueSubject(NOW));
    expect(issue.items).toHaveLength(1);
    expect(issue.intendedSendAt.getTime()).toBe(NOW.getTime() + 5 * 60 * 60 * 1000);
    expect(sentEmails.at(-1)?.subject).toContain('AIm');
  });

  it('ne recree pas d issue pour un resume deja publie', async () => {
    await fetchNewsletterArticles(readFixture, NOW);
    await runSummarizeJob(1, provider([VALID_SUMMARY]), NOW);
    await runBuildJob(NOW);

    expect(await runBuildJob(NOW)).toEqual({ status: 'no_summary' });
    expect(await prisma.newsletterIssue.count()).toBe(1);
  });
});
