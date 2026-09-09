import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/db';
import {
  completeLesson,
  getBadgeByToken,
  getCourseDetail,
  submitQuiz,
} from '@/lib/courses/service';

async function seedCourse() {
  const course = await prisma.course.create({
    data: {
      slug: 'cours-test',
      title: 'Cours de test',
      description: 'Un cours de test.',
      level: 1,
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
                text: 'Question 1',
                options: [
                  { label: 'bonne', isCorrect: true },
                  { label: 'mauvaise', isCorrect: false },
                ],
              },
              {
                order: 2,
                text: 'Question 2',
                options: [
                  { label: 'mauvaise', isCorrect: false },
                  { label: 'bonne', isCorrect: true },
                ],
              },
            ],
          },
        },
      },
    },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
    },
  });

  return course;
}

async function seedUser(emailVerified: Date | null = new Date()) {
  return prisma.user.create({
    data: { email: `etudiant-${Math.random()}@example.com`, name: 'Lea', emailVerified },
  });
}

let course: Awaited<ReturnType<typeof seedCourse>>;
let user: Awaited<ReturnType<typeof seedUser>>;

beforeEach(async () => {
  course = await seedCourse();
  user = await seedUser();
});

describe('completion des lecons', () => {
  it('met la progression a jour et cree l inscription', async () => {
    const first = await completeLesson(user, course.lessons[0].id);
    expect(first).toEqual({ ok: true, progress: 50 });

    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    expect(enrollment.progress).toBe(50);
    expect(enrollment.completedAt).toBeNull();
  });

  it('est idempotente', async () => {
    await completeLesson(user, course.lessons[0].id);
    await completeLesson(user, course.lessons[0].id);
    expect(await prisma.lessonCompletion.count()).toBe(1);
  });

  it('refuse un compte dont l adresse n est pas verifiee', async () => {
    const pending = await seedUser(null);
    expect(await completeLesson(pending, course.lessons[0].id)).toEqual({
      ok: false,
      error: 'email_not_verified',
    });
    expect(await prisma.lessonCompletion.count()).toBe(0);
  });

  it('ignore une lecon inconnue', async () => {
    expect(await completeLesson(user, 'lecon-inexistante')).toEqual({
      ok: false,
      error: 'not_found',
    });
  });
});

describe('soumission du quiz', () => {
  function goodAnswers() {
    return [
      { questionId: course.quiz!.questions[0].id, optionIndex: 0 },
      { questionId: course.quiz!.questions[1].id, optionIndex: 1 },
    ];
  }

  it('enregistre une tentative ratee sans creer d attestation', async () => {
    const result = await submitQuiz(user, {
      quizId: course.quiz!.id,
      durationSeconds: 30,
      answers: [
        { questionId: course.quiz!.questions[0].id, optionIndex: 1 },
        { questionId: course.quiz!.questions[1].id, optionIndex: 0 },
      ],
    });

    expect(result).toMatchObject({ ok: true, score: 0, passed: false, badgeToken: null });
    expect(await prisma.badge.count()).toBe(0);
    expect(await prisma.quizAttempt.count()).toBe(1);
  });

  it('delivre une attestation quand le quiz est reussi', async () => {
    const result = await submitQuiz(user, {
      quizId: course.quiz!.id,
      durationSeconds: 42,
      answers: goodAnswers(),
    });

    expect(result).toMatchObject({ ok: true, score: 100, passed: true });
    const badge = await prisma.badge.findFirstOrThrow();
    expect(badge.verifyToken).toHaveLength(32);
    expect(result.ok && result.badgeToken).toBe(badge.verifyToken);
  });

  it('ne delivre qu une seule attestation par cours', async () => {
    await submitQuiz(user, {
      quizId: course.quiz!.id,
      durationSeconds: 42,
      answers: goodAnswers(),
    });
    await submitQuiz(user, {
      quizId: course.quiz!.id,
      durationSeconds: 20,
      answers: goodAnswers(),
    });

    expect(await prisma.badge.count()).toBe(1);
    expect(await prisma.quizAttempt.count()).toBe(2);
  });

  it('marque le cours termine quand toutes les lecons sont lues et le quiz reussi', async () => {
    for (const lesson of course.lessons) await completeLesson(user, lesson.id);
    await submitQuiz(user, {
      quizId: course.quiz!.id,
      durationSeconds: 42,
      answers: goodAnswers(),
    });

    const enrollment = await prisma.enrollment.findUniqueOrThrow({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    expect(enrollment.progress).toBe(100);
    expect(enrollment.completedAt).not.toBeNull();
  });

  it('refuse une charge utile invalide', async () => {
    expect(await submitQuiz(user, { quizId: course.quiz!.id, answers: [] })).toEqual({
      ok: false,
      error: 'invalid_input',
    });
  });
});

describe('attestation publique', () => {
  it('se consulte par son jeton et reste introuvable sinon', async () => {
    for (const lesson of course.lessons) await completeLesson(user, lesson.id);
    const result = await submitQuiz(user, {
      quizId: course.quiz!.id,
      durationSeconds: 42,
      answers: [
        { questionId: course.quiz!.questions[0].id, optionIndex: 0 },
        { questionId: course.quiz!.questions[1].id, optionIndex: 1 },
      ],
    });

    const token = result.ok ? result.badgeToken! : '';
    const badge = await getBadgeByToken(token);
    expect(badge?.course.title).toBe('Cours de test');
    expect(await getBadgeByToken('jeton-inconnu')).toBeNull();
  });
});

describe('detail du cours', () => {
  it('reste invisible tant que le cours n est pas publie', async () => {
    await prisma.course.update({ where: { id: course.id }, data: { published: false } });
    expect(await getCourseDetail('cours-test')).toBeNull();
  });

  it('ouvre le quiz une fois toutes les lecons lues', async () => {
    for (const lesson of course.lessons) await completeLesson(user, lesson.id);
    const detail = await getCourseDetail('cours-test', user.id);
    expect(detail?.allLessonsCompleted).toBe(true);
    expect(detail?.progress).toBe(100);
  });
});
