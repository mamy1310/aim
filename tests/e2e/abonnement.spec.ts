import { expect, test } from '@playwright/test';
import Stripe from 'stripe';

import { createVerifiedUser, prisma, uniqueEmail } from './fixtures';
import { signIn } from './utils';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? 'whsec_dev_fake_secret';

test.describe('parcours abonnement', () => {
  test('le webhook signe cree l abonnement et le double opt-in', async ({ page, request }) => {
    const email = uniqueEmail('abonne');
    const user = await createVerifiedUser(email);
    const customerId = `cus_e2e_${user.id}`;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });

    await signIn(page, email);
    await page.goto('/newsletter');
    await expect(page.getByRole('button', { name: /m abonner|m'abonner/i })).toBeVisible();

    // La page de paiement hebergee par Stripe est hors perimetre : on injecte
    // directement l evenement que Stripe enverrait, signe localement.
    const now = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({
      id: `evt_e2e_${user.id}`,
      object: 'event',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: `sub_e2e_${user.id}`,
          customer: customerId,
          status: 'active',
          cancel_at_period_end: false,
          start_date: now,
          items: {
            data: [
              {
                price: { id: 'price_e2e' },
                current_period_start: now,
                current_period_end: now + 2_600_000,
              },
            ],
          },
        },
      },
    });

    const signature = new Stripe('sk_test_fake').webhooks.generateTestHeaderString({
      payload,
      secret: WEBHOOK_SECRET,
    });

    const response = await request.post('/api/stripe/webhook', {
      headers: { 'stripe-signature': signature, 'content-type': 'application/json' },
      data: payload,
    });
    expect(response.ok()).toBeTruthy();

    const subscription = await prisma.newsletterSubscription.findUniqueOrThrow({
      where: { userId: user.id },
    });
    expect(subscription.confirmed).toBe(false);

    await page.goto('/account/billing');
    await expect(page.getByText(/actif/i).first()).toBeVisible();

    await page.goto(`/api/newsletter/confirm/${subscription.confirmToken}`);
    await expect(page).toHaveURL(/confirmation=ok/);

    await prisma.user.deleteMany({ where: { email } });
  });

  test('une signature invalide est rejetee', async ({ request }) => {
    const response = await request.post('/api/stripe/webhook', {
      headers: { 'stripe-signature': 't=1,v1=faux', 'content-type': 'application/json' },
      data: JSON.stringify({ id: 'evt_faux', type: 'ping', data: { object: {} } }),
    });
    expect(response.status()).toBe(400);
  });
});
