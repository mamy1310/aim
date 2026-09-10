import { prisma } from '@/lib/db';

export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      stripeCustomerId: true,
      enrollments: {
        select: {
          progress: true,
          completedAt: true,
          lastAccessedAt: true,
          course: { select: { slug: true, title: true, level: true } },
        },
      },
      lessonCompletions: {
        select: { completedAt: true, lesson: { select: { title: true, order: true } } },
      },
      quizAttempts: {
        select: {
          score: true,
          passed: true,
          answers: true,
          durationSeconds: true,
          createdAt: true,
          quiz: { select: { course: { select: { slug: true } } } },
        },
      },
      badges: {
        select: {
          verifyToken: true,
          issuedAt: true,
          course: { select: { slug: true, title: true } },
        },
      },
      newsletterSubscription: {
        select: { confirmed: true, confirmedAt: true, unsubscribedAt: true, maxLevel: true },
      },
      stripeSubscriptions: {
        select: {
          stripeSubscriptionId: true,
          status: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      },
      sessions: { select: { expires: true } },
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return null;

  return { exportedAt: new Date().toISOString(), compte: user };
}
