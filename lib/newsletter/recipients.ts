import { prisma } from '@/lib/db';

export type Recipient = {
  id: string;
  email: string;
  name: string | null;
  maxLevel: number | null;
  confirmToken: string;
};

export function filterRecipientsByLevel<T extends { maxLevel: number | null }>(
  subscribers: T[],
  articleLevel: number,
): T[] {
  return subscribers.filter(
    (subscriber) => subscriber.maxLevel === null || subscriber.maxLevel >= articleLevel,
  );
}

const ACTIVE_STATUSES = ['active', 'trialing'];

export async function canReceiveNewsletter(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      newsletterSubscription: { select: { confirmed: true, unsubscribedAt: true } },
      stripeSubscriptions: { select: { status: true } },
    },
  });

  if (!user) return false;

  return (
    user.emailVerified !== null &&
    user.newsletterSubscription?.confirmed === true &&
    user.newsletterSubscription.unsubscribedAt === null &&
    user.stripeSubscriptions.some((subscription) => ACTIVE_STATUSES.includes(subscription.status))
  );
}

export async function listNewsletterRecipients(): Promise<Recipient[]> {
  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      newsletterSubscription: { confirmed: true, unsubscribedAt: null },
      stripeSubscriptions: { some: { status: { in: ACTIVE_STATUSES } } },
    },
    select: {
      id: true,
      email: true,
      name: true,
      newsletterSubscription: { select: { maxLevel: true, confirmToken: true } },
    },
  });

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    maxLevel: user.newsletterSubscription?.maxLevel ?? null,
    confirmToken: user.newsletterSubscription?.confirmToken ?? '',
  }));
}
