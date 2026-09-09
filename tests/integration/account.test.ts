import { describe, expect, it, vi } from 'vitest';

import { prisma } from '@/lib/db';
import { exportUserData } from '@/lib/account/export';
import { getDashboardData, illustrationFor } from '@/lib/courses/dashboard';
import { completeLesson, submitQuiz } from '@/lib/courses/service';
import { purgeOldGenerationLogs } from '@/lib/ai/retention';

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(async () => undefined),
  sendBatch: vi.fn(async () => undefined),
}));

async function seedLearner() {
  const user = await prisma.user.create({
    data: { email: 'lea@example.com', name: 'Lea Bonnaire', emailVerified: new Date() },
  });

  const course = await prisma.course.create({
    data: {
      slug: 'cours-tableau-de-bord',
      title: 'Cours du tableau de bord',
      description: 'Un cours utilise pour les tests du tableau de bord.',
      level: 2,
      order: 1,
      published: true,
      lessons: {
        create: [
          { title: 'Lecon 1', contentMd: '# 1', order: 1 },
          { title: 'Lecon 2', contentMd: '# 2', order: 2 },
        ],
      },
      quiz: {
        create: {
          passScore: 70,
          questions: {
            create: [
              {
                order: 1,
                text: 'Question ?',
                options: [
                  { label: 'Bonne', isCorrect: true },
                  { label: 'Mauvaise', isCorrect: false },
                ],
              },
            ],
          },
        },
      },
    },
    include: { lessons: { orderBy: { order: 'asc' } }, quiz: true },
  });

  return { user, course };
}

describe('tableau de bord', () => {
  it('reste vide pour un compte neuf', async () => {
    const user = await prisma.user.create({
      data: { email: 'neuf@example.com', emailVerified: new Date() },
    });

    expect(await getDashboardData(user.id)).toEqual({ courses: [], badges: [] });
  });

  it('liste les cours en cours et la prochaine lecon', async () => {
    const { user, course } = await seedLearner();
    await completeLesson(user, course.lessons[0].id);

    const data = await getDashboardData(user.id);
    expect(data.courses).toHaveLength(1);
    expect(data.courses[0]).toMatchObject({
      slug: 'cours-tableau-de-bord',
      pct: 50,
      nextNum: 2,
      nextTitle: 'Lecon 2',
    });
  });

  it('liste les attestations obtenues', async () => {
    const { user, course } = await seedLearner();
    for (const lesson of course.lessons) await completeLesson(user, lesson.id);
    const questions = await prisma.question.findMany({ where: { quizId: course.quiz!.id } });
    await submitQuiz(user, {
      quizId: course.quiz!.id,
      durationSeconds: 12,
      answers: [{ questionId: questions[0].id, optionIndex: 0 }],
    });

    const data = await getDashboardData(user.id);
    expect(data.badges).toHaveLength(1);
    expect(data.badges[0].title).toBe('Cours du tableau de bord');
  });

  it('choisit une illustration stable pour une meme graine', () => {
    expect(illustrationFor('cours-a')).toBe(illustrationFor('cours-a'));
    expect(new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(illustrationFor)).size).toBeGreaterThan(1);
  });
});

describe('export RGPD', () => {
  it('rassemble le compte, la progression et les attestations', async () => {
    const { user, course } = await seedLearner();
    await completeLesson(user, course.lessons[0].id);

    const data = await exportUserData(user.id);
    expect(data?.compte.email).toBe('lea@example.com');
    expect(data?.compte.enrollments).toHaveLength(1);
    expect(data?.compte.lessonCompletions).toHaveLength(1);
    expect(data?.exportedAt).toBeTruthy();
  });

  it('renvoie null pour un compte inconnu', async () => {
    expect(await exportUserData('compte-inexistant')).toBeNull();
  });
});

describe('suppression du compte', () => {
  it('efface la progression et les attestations en cascade', async () => {
    const { user, course } = await seedLearner();
    for (const lesson of course.lessons) await completeLesson(user, lesson.id);

    await prisma.user.delete({ where: { id: user.id } });

    expect(await prisma.lessonCompletion.count()).toBe(0);
    expect(await prisma.enrollment.count()).toBe(0);
    expect(await prisma.lesson.count()).toBe(2);
  });
});

describe('purge des traces de generation', () => {
  it('supprime les traces de plus de quatre-vingt-dix jours', async () => {
    const now = new Date('2026-06-03T00:00:00Z');
    const base = {
      purpose: 'NEWSLETTER_SUMMARY' as const,
      model: 'deepseek-v4-flash',
      attemptNumber: 1,
      inputTokens: 10,
      outputTokens: 10,
      cachedInputTokens: 0,
      costUsd: 0.0001,
      success: true,
    };

    const old = await prisma.aIGenerationLog.create({ data: base });
    await prisma.$executeRaw`UPDATE "AIGenerationLog" SET "createdAt" = ${new Date('2026-01-01T00:00:00Z')} WHERE id = ${old.id}`;
    await prisma.aIGenerationLog.create({ data: base });

    expect(await purgeOldGenerationLogs(now)).toEqual({ deleted: 1 });
    expect(await prisma.aIGenerationLog.count()).toBe(1);
  });
});
