import { expect, test } from '@playwright/test';

import { createSubscriber, prisma, uniqueEmail } from './fixtures';

test('le lien de desabonnement arrete les envois sans annuler le paiement', async ({ page }) => {
  const email = uniqueEmail('desabo');
  const user = await createSubscriber(email);
  const subscription = await prisma.newsletterSubscription.findUniqueOrThrow({
    where: { userId: user.id },
  });

  await page.goto(`/api/newsletter/unsubscribe/${subscription.confirmToken}`);
  await expect(page).toHaveURL(/desabonnement=ok/);
  await expect(page.getByText(/desabonne|désabonné/i).first()).toBeVisible();

  const updated = await prisma.newsletterSubscription.findUniqueOrThrow({
    where: { userId: user.id },
  });
  expect(updated.unsubscribedAt).not.toBeNull();

  const stripeSubscription = await prisma.stripeSubscription.findFirstOrThrow({
    where: { userId: user.id },
  });
  expect(stripeSubscription.status).toBe('active');

  await prisma.user.deleteMany({ where: { email } });
});
