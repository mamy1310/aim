import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '@/lib/generated/prisma/client';

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export const PASSWORD = 'motdepasse1';

export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.test`;
}

export async function createVerifiedUser(email: string, role: 'STUDENT' | 'ADMIN' = 'STUDENT') {
  const { hash } = await import('bcryptjs');
  return prisma.user.create({
    data: {
      email,
      name: 'Lea Bonnaire',
      role,
      emailVerified: new Date(),
      passwordHash: await hash(PASSWORD, 12),
    },
  });
}

export async function createCourse(slug: string) {
  return prisma.course.create({
    data: {
      slug,
      title: 'Cours de bout en bout',
      description: 'Un cours cree pour les tests de bout en bout du parcours apprenant.',
      level: 1,
      order: 99,
      published: true,
      lessons: {
        create: [
          { title: 'Premiere lecon', contentMd: '## Premiere\n\nContenu.', order: 1 },
          { title: 'Seconde lecon', contentMd: '## Seconde\n\nContenu.', order: 2 },
        ],
      },
      quiz: {
        create: {
          passScore: 70,
          questions: {
            create: [
              {
                order: 1,
                text: 'Quelle est la bonne reponse ?',
                options: [
                  { label: 'La bonne reponse', isCorrect: true },
                  { label: 'La mauvaise reponse', isCorrect: false },
                ],
              },
            ],
          },
        },
      },
    },
    include: { lessons: { orderBy: { order: 'asc' } }, quiz: true },
  });
}

export async function createSubscriber(email: string) {
  const user = await createVerifiedUser(email);

  await prisma.newsletterSubscription.create({
    data: {
      userId: user.id,
      confirmed: true,
      confirmedAt: new Date(),
      confirmToken: `e2e-${user.id}`.padEnd(32, '0').slice(0, 32),
    },
  });

  await prisma.stripeSubscription.create({
    data: {
      userId: user.id,
      stripeSubscriptionId: `sub_e2e_${user.id}`,
      stripePriceId: 'price_e2e',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return user;
}

export async function createDraftIssue() {
  const source = await prisma.newsletterSource.upsert({
    where: { rssUrl: 'https://e2e.test/rss' },
    update: {},
    create: { name: 'Source e2e', rssUrl: 'https://e2e.test/rss', category: 'OFFICIAL' },
  });

  const article = await prisma.newsletterArticle.create({
    data: {
      sourceId: source.id,
      sourceUrl: `https://e2e.test/article-${Date.now()}`,
      title: 'Titre original',
      publishedAt: new Date(),
      status: 'SUMMARIZED',
    },
  });

  const summary = await prisma.newsletterArticleSummary.create({
    data: {
      articleId: article.id,
      titleLocalized: 'Un article de test',
      summary: 'Un resume court pour les tests.',
      whyItMatters: 'Ce que cela change pour un debutant.',
      category: 'PRODUCT',
      level: 1,
      model: 'deepseek-v4-flash',
    },
  });

  return prisma.newsletterIssue.create({
    data: {
      subject: `AIm - edition de test ${Date.now()}`,
      intendedSendAt: new Date(Date.now() + 5 * 60 * 60 * 1000),
      items: { create: { summaryId: summary.id, order: 1 } },
    },
  });
}
