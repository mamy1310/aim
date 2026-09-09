import { prisma } from '@/lib/db';
import { computeProgress } from '@/lib/courses/scoring';

const ILLUSTRATIONS = ['arc', 'stack', 'dots', 'circle', 'split', 'rings', 'zig', 'nest'] as const;

export type Illustration = (typeof ILLUSTRATIONS)[number];

export function illustrationFor(seed: string): Illustration {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ILLUSTRATIONS[hash % ILLUSTRATIONS.length];
}

export async function getDashboardData(userId: string) {
  const [enrollments, badges] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId, course: { published: true } },
      orderBy: { lastAccessedAt: 'desc' },
      select: {
        progress: true,
        completedAt: true,
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            level: true,
            lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, order: true } },
          },
        },
      },
    }),
    prisma.badge.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      select: { verifyToken: true, issuedAt: true, course: { select: { title: true } } },
    }),
  ]);

  const completions = await prisma.lessonCompletion.findMany({
    where: { userId },
    select: { lessonId: true },
  });
  const completedIds = new Set(completions.map((completion) => completion.lessonId));

  const courses = enrollments.map((enrollment) => {
    const lessons = enrollment.course.lessons;
    const next = lessons.find((lesson) => !completedIds.has(lesson.id)) ?? lessons.at(-1) ?? null;

    return {
      slug: enrollment.course.slug,
      title: enrollment.course.title,
      level: enrollment.course.level,
      pct: computeProgress(
        lessons.filter((lesson) => completedIds.has(lesson.id)).length,
        lessons.length,
      ),
      nextNum: next?.order ?? 1,
      nextTitle: next?.title ?? '',
      nextLessonId: next?.id ?? null,
      ill: illustrationFor(enrollment.course.slug),
    };
  });

  return {
    courses,
    badges: badges.map((badge) => ({
      token: badge.verifyToken,
      title: badge.course.title,
      issuedAt: badge.issuedAt,
      ill: illustrationFor(badge.verifyToken),
    })),
  };
}
