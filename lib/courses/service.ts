import { z } from 'zod';

import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth/tokens';
import { computeProgress, scoreQuiz, type QuizAnswer } from '@/lib/courses/scoring';

export const quizSubmissionSchema = z.object({
  quizId: z.string().min(1),
  durationSeconds: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      optionIndex: z.number().int().min(0).nullable(),
    }),
  ),
});

const optionSchema = z.array(z.object({ label: z.string(), isCorrect: z.boolean() }));

export function parseOptions(raw: unknown): { label: string; isCorrect: boolean }[] {
  return optionSchema.parse(raw);
}

export async function listPublishedCourses(userId?: string) {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: [{ level: 'asc' }, { order: 'asc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      level: true,
      aiAssisted: true,
      _count: { select: { lessons: true } },
      enrollments: userId ? { where: { userId }, select: { progress: true } } : false,
    },
  });

  return courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    level: course.level,
    aiAssisted: course.aiAssisted,
    lessonCount: course._count.lessons,
    progress: course.enrollments?.[0]?.progress ?? 0,
  }));
}

export async function getCourseDetail(slug: string, userId?: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      level: true,
      published: true,
      aiAssisted: true,
      lessons: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true, order: true, estimatedMinutes: true },
      },
      quiz: { select: { id: true, passScore: true } },
    },
  });

  if (!course || !course.published) return null;

  const [completions, badge, bestAttempt] = userId
    ? await Promise.all([
        prisma.lessonCompletion.findMany({
          where: { userId, lesson: { courseId: course.id } },
          select: { lessonId: true },
        }),
        prisma.badge.findUnique({
          where: { userId_courseId: { userId, courseId: course.id } },
          select: { verifyToken: true },
        }),
        course.quiz
          ? prisma.quizAttempt.findFirst({
              where: { userId, quizId: course.quiz.id, passed: true },
              select: { score: true },
            })
          : null,
      ])
    : [[], null, null];

  const completedLessonIds = new Set(completions.map((completion) => completion.lessonId));

  return {
    ...course,
    completedLessonIds: [...completedLessonIds],
    progress: computeProgress(completedLessonIds.size, course.lessons.length),
    allLessonsCompleted:
      course.lessons.length > 0 && completedLessonIds.size === course.lessons.length,
    badgeToken: badge?.verifyToken ?? null,
    quizPassed: Boolean(bestAttempt),
  };
}

export async function getLessonDetail(slug: string, lessonId: string, userId?: string) {
  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, course: { slug, published: true } },
    select: {
      id: true,
      title: true,
      contentMd: true,
      order: true,
      estimatedMinutes: true,
      aiAssisted: true,
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          lessons: { orderBy: { order: 'asc' }, select: { id: true, order: true, title: true } },
        },
      },
    },
  });

  if (!lesson) return null;

  const completed = userId
    ? Boolean(
        await prisma.lessonCompletion.findUnique({
          where: { userId_lessonId: { userId, lessonId } },
          select: { id: true },
        }),
      )
    : false;

  const index = lesson.course.lessons.findIndex((item) => item.id === lesson.id);

  return {
    ...lesson,
    completed,
    previous: index > 0 ? lesson.course.lessons[index - 1] : null,
    next: index < lesson.course.lessons.length - 1 ? lesson.course.lessons[index + 1] : null,
  };
}

async function refreshEnrollment(userId: string, courseId: string) {
  const [totalLessons, completedLessons, quiz] = await Promise.all([
    prisma.lesson.count({ where: { courseId } }),
    prisma.lessonCompletion.count({ where: { userId, lesson: { courseId } } }),
    prisma.quiz.findUnique({ where: { courseId }, select: { id: true } }),
  ]);

  const quizPassed = quiz
    ? Boolean(
        await prisma.quizAttempt.findFirst({
          where: { userId, quizId: quiz.id, passed: true },
          select: { id: true },
        }),
      )
    : true;

  const progress = computeProgress(completedLessons, totalLessons);
  const finished = progress === 100 && quizPassed;

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    update: {
      progress,
      lastAccessedAt: new Date(),
      completedAt: finished ? new Date() : null,
    },
    create: {
      userId,
      courseId,
      progress,
      completedAt: finished ? new Date() : null,
    },
  });

  return progress;
}

export async function completeLesson(
  user: { id: string; emailVerified: Date | null },
  lessonId: string,
) {
  if (!user.emailVerified) return { ok: false as const, error: 'email_not_verified' };

  const lesson = await prisma.lesson.findFirst({
    where: { id: lessonId, course: { published: true } },
    select: { id: true, courseId: true },
  });
  if (!lesson) return { ok: false as const, error: 'not_found' };

  await prisma.lessonCompletion.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {},
    create: { userId: user.id, lessonId },
  });

  const progress = await refreshEnrollment(user.id, lesson.courseId);
  return { ok: true as const, progress };
}

export async function submitQuiz(user: { id: string; emailVerified: Date | null }, input: unknown) {
  if (!user.emailVerified) return { ok: false as const, error: 'email_not_verified' };

  const parsed = quizSubmissionSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: 'invalid_input' };

  const quiz = await prisma.quiz.findFirst({
    where: { id: parsed.data.quizId, course: { published: true } },
    select: {
      id: true,
      passScore: true,
      courseId: true,
      questions: { orderBy: { order: 'asc' }, select: { id: true, options: true } },
    },
  });
  if (!quiz) return { ok: false as const, error: 'not_found' };

  const questions = quiz.questions.map((question) => ({
    id: question.id,
    options: parseOptions(question.options),
  }));

  const result = scoreQuiz(questions, parsed.data.answers as QuizAnswer[], quiz.passScore);

  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId: quiz.id,
      score: result.score,
      passed: result.passed,
      answers: parsed.data.answers,
      durationSeconds: parsed.data.durationSeconds,
    },
  });

  let badgeToken: string | null = null;
  if (result.passed) {
    const badge = await prisma.badge.upsert({
      where: { userId_courseId: { userId: user.id, courseId: quiz.courseId } },
      update: {},
      create: { userId: user.id, courseId: quiz.courseId, verifyToken: generateToken() },
      select: { verifyToken: true },
    });
    badgeToken = badge.verifyToken;
  }

  await refreshEnrollment(user.id, quiz.courseId);

  return { ok: true as const, ...result, badgeToken };
}

export async function getBadgeByToken(verifyToken: string) {
  return prisma.badge.findUnique({
    where: { verifyToken },
    select: {
      issuedAt: true,
      verifyToken: true,
      user: { select: { name: true, email: true } },
      course: { select: { title: true, slug: true, level: true } },
    },
  });
}
