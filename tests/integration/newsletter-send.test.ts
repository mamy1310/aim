import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '@/lib/db';
import { runAutoSendJob, sendIssue } from '@/lib/newsletter/send';

const batches: { to: string | string[]; subject: string; text: string; html: string }[][] = [];

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(async () => undefined),
  sendBatch: vi.fn(
    async (messages: { to: string; subject: string; text: string; html: string }[]) => {
      batches.push(messages);
    },
  ),
}));

const NOW = new Date('2026-06-03T16:00:00Z');

async function seedSubscriber(
  email: string,
  maxLevel: number | null,
  options: {
    confirmed?: boolean;
    unsubscribed?: boolean;
    status?: string;
    verified?: boolean;
  } = {},
) {
  const { confirmed = true, unsubscribed = false, status = 'active', verified = true } = options;

  return prisma.user.create({
    data: {
      email,
      emailVerified: verified ? new Date() : null,
      stripeCustomerId: `cus_${email}`,
      newsletterSubscription: {
        create: {
          confirmed,
          confirmToken: `token-${email}`.padEnd(32, '0').slice(0, 32),
          confirmedAt: confirmed ? new Date() : null,
          unsubscribedAt: unsubscribed ? new Date() : null,
          maxLevel,
        },
      },
      stripeSubscriptions: {
        create: {
          stripeSubscriptionId: `sub_${email}`,
          stripePriceId: 'price_test',
          status,
          currentPeriodStart: new Date('2026-06-01T00:00:00Z'),
          currentPeriodEnd: new Date('2026-07-01T00:00:00Z'),
        },
      },
    },
  });
}

async function seedIssue(level: number, intendedSendAt = NOW) {
  const source = await prisma.newsletterSource.create({
    data: { name: 'Officiel', rssUrl: `https://officiel.test/${level}`, category: 'OFFICIAL' },
  });

  const article = await prisma.newsletterArticle.create({
    data: {
      sourceId: source.id,
      sourceUrl: `https://officiel.test/article-${level}`,
      title: 'Titre original',
      publishedAt: NOW,
      status: 'SUMMARIZED',
    },
  });

  const summary = await prisma.newsletterArticleSummary.create({
    data: {
      articleId: article.id,
      titleLocalized: 'Un modele compact arrive',
      summary: 'Un resume court et factuel.',
      whyItMatters: 'Ce que cela change pour un debutant.',
      category: 'MODEL_RELEASE',
      level,
      model: 'deepseek-v4-flash',
    },
  });

  return prisma.newsletterIssue.create({
    data: {
      subject: 'AIm - mercredi 3 juin',
      intro: 'Bonjour.',
      intendedSendAt,
      items: { create: { summaryId: summary.id, order: 1 } },
    },
  });
}

beforeEach(() => {
  batches.length = 0;
});

describe('envoi d une edition', () => {
  it('n envoie qu aux abonnes eligibles et marque l edition envoyee', async () => {
    await seedSubscriber('tout@example.com', null);
    await seedSubscriber('niveau1@example.com', 1);
    await seedSubscriber('nonconfirme@example.com', null, { confirmed: false });
    await seedSubscriber('desabonne@example.com', null, { unsubscribed: true });
    await seedSubscriber('impaye@example.com', null, { status: 'canceled' });
    await seedSubscriber('nonverifie@example.com', null, { verified: false });

    const issue = await seedIssue(2);
    const result = await sendIssue(issue.id, { autoSent: false }, NOW);

    expect(result).toEqual({ ok: true, recipientCount: 1 });
    expect(batches[0].map((message) => message.to)).toEqual(['tout@example.com']);

    const updated = await prisma.newsletterIssue.findUniqueOrThrow({ where: { id: issue.id } });
    expect(updated.status).toBe('SENT');
    expect(updated.autoSent).toBe(false);
    expect(updated.recipientCount).toBe(1);
  });

  it('inclut le lien de desabonnement et la mention IA', async () => {
    await seedSubscriber('tout@example.com', null);
    const issue = await seedIssue(1);
    await sendIssue(issue.id, { autoSent: false }, NOW);

    const message = batches[0][0];
    expect(message.text).toContain('/api/newsletter/unsubscribe/');
    expect(message.text).toContain('assiste par IA');
    expect(message.text).toContain('https://officiel.test/article-1');
    expect(message.text).not.toMatch(/[—]/);
  });

  it('marque l edition envoyee meme sans destinataire', async () => {
    await seedSubscriber('niveau1@example.com', 1);
    const issue = await seedIssue(3);

    expect(await sendIssue(issue.id, { autoSent: false }, NOW)).toEqual({
      ok: true,
      recipientCount: 0,
    });
    expect(batches).toHaveLength(0);

    const updated = await prisma.newsletterIssue.findUniqueOrThrow({ where: { id: issue.id } });
    expect(updated.status).toBe('SENT');
    expect(updated.recipientCount).toBe(0);
  });

  it('refuse un second envoi', async () => {
    await seedSubscriber('tout@example.com', null);
    const issue = await seedIssue(1);
    await sendIssue(issue.id, { autoSent: false }, NOW);

    expect(await sendIssue(issue.id, { autoSent: false }, NOW)).toEqual({
      ok: false,
      error: 'already_sent',
    });
    expect(batches).toHaveLength(1);
  });
});

describe('job D, envoi automatique', () => {
  it('envoie les brouillons arrives a echeance', async () => {
    await seedSubscriber('tout@example.com', null);
    const issue = await seedIssue(1, new Date('2026-06-03T15:00:00Z'));

    const result = await runAutoSendJob(NOW);
    expect(result.sent).toEqual([issue.id]);

    const updated = await prisma.newsletterIssue.findUniqueOrThrow({ where: { id: issue.id } });
    expect(updated.autoSent).toBe(true);
  });

  it('laisse les brouillons non echus tranquilles', async () => {
    await seedSubscriber('tout@example.com', null);
    await seedIssue(1, new Date('2026-06-03T20:00:00Z'));

    expect(await runAutoSendJob(NOW)).toEqual({ sent: [] });
    expect(batches).toHaveLength(0);
  });

  it('ne renvoie pas une edition deja validee manuellement', async () => {
    await seedSubscriber('tout@example.com', null);
    const issue = await seedIssue(1, new Date('2026-06-03T15:00:00Z'));
    await sendIssue(issue.id, { autoSent: false }, NOW);

    expect(await runAutoSendJob(NOW)).toEqual({ sent: [] });
    expect(batches).toHaveLength(1);
  });
});
