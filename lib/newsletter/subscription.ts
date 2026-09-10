import { prisma } from '@/lib/db';

export async function confirmSubscription(token: string): Promise<boolean> {
  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { confirmToken: token },
  });
  if (!subscription) return false;

  await prisma.newsletterSubscription.update({
    where: { id: subscription.id },
    data: { confirmed: true, confirmedAt: subscription.confirmedAt ?? new Date() },
  });

  return true;
}

// Stops the emails, leaves the Stripe subscription active.
export async function unsubscribe(token: string): Promise<boolean> {
  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { confirmToken: token },
  });
  if (!subscription) return false;

  await prisma.newsletterSubscription.update({
    where: { id: subscription.id },
    data: { unsubscribedAt: subscription.unsubscribedAt ?? new Date() },
  });

  return true;
}
