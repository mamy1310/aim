import { beforeEach, describe, expect, it, vi } from 'vitest';
import Stripe from 'stripe';

import { prisma } from '@/lib/db';
import { handleStripeEvent } from '@/lib/stripe/webhook';
import { confirmSubscription, unsubscribe } from '@/lib/newsletter/subscription';
import { canReceiveNewsletter } from '@/lib/newsletter/recipients';

const sentEmails: { to: string | string[]; subject: string; text: string }[] = [];

vi.mock('@/lib/email/send', () => ({
  sendEmail: vi.fn(async (message: { to: string; subject: string; text: string }) => {
    sentEmails.push(message);
  }),
  sendBatch: vi.fn(async () => undefined),
}));

const CUSTOMER = 'cus_test_1';
const SUBSCRIPTION = 'sub_test_1';
const PRICE = 'price_test_newsletter';
const PERIOD_START = 1_780_000_000;
const PERIOD_END = 1_782_600_000;

function subscriptionEvent(type: string, overrides: Record<string, unknown> = {}) {
  return {
    id: `evt_${type}`,
    type,
    data: {
      object: {
        id: SUBSCRIPTION,
        customer: CUSTOMER,
        status: 'active',
        cancel_at_period_end: false,
        start_date: PERIOD_START,
        items: {
          data: [
            {
              price: { id: PRICE },
              current_period_start: PERIOD_START,
              current_period_end: PERIOD_END,
            },
          ],
        },
        ...overrides,
      },
    },
  } as unknown as Stripe.Event;
}

async function seedUser(withCustomer = true) {
  return prisma.user.create({
    data: {
      email: 'abonnee@example.com',
      name: 'Lea',
      emailVerified: new Date(),
      stripeCustomerId: withCustomer ? CUSTOMER : null,
    },
  });
}

beforeEach(() => {
  sentEmails.length = 0;
});

describe('signature du webhook', () => {
  it('accepte une charge utile signee localement et refuse une signature invalide', () => {
    const stripe = new Stripe('sk_test_fake');
    const payload = JSON.stringify({ id: 'evt_1', type: 'ping', data: { object: {} } });
    const secret = 'whsec_test_fake_secret';

    const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(stripe.webhooks.constructEvent(payload, header, secret).id).toBe('evt_1');

    expect(() => stripe.webhooks.constructEvent(payload, 't=1,v1=faux', secret)).toThrow();
  });
});

describe('cycle de vie de l abonnement', () => {
  it('lie le client Stripe au compte a la fin du checkout', async () => {
    const user = await seedUser(false);

    const outcome = await handleStripeEvent({
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: { object: { customer: CUSTOMER, client_reference_id: user.id } },
    } as unknown as Stripe.Event);

    expect(outcome.handled).toBe(true);
    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.stripeCustomerId).toBe(CUSTOMER);
  });

  it('cree l abonnement, le double opt-in et envoie l email de confirmation', async () => {
    const user = await seedUser();

    await handleStripeEvent(subscriptionEvent('customer.subscription.created'));

    const subscription = await prisma.stripeSubscription.findUniqueOrThrow({
      where: { stripeSubscriptionId: SUBSCRIPTION },
    });
    expect(subscription.status).toBe('active');
    expect(subscription.currentPeriodEnd.getTime()).toBe(PERIOD_END * 1000);

    const newsletter = await prisma.newsletterSubscription.findUniqueOrThrow({
      where: { userId: user.id },
    });
    expect(newsletter.confirmed).toBe(false);
    expect(newsletter.confirmToken).toHaveLength(32);
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe(user.email);
  });

  it('reste identique quand Stripe rejoue le meme evenement', async () => {
    await seedUser();
    const event = subscriptionEvent('customer.subscription.created');

    await handleStripeEvent(event);
    await handleStripeEvent(event);

    expect(await prisma.stripeSubscription.count()).toBe(1);
    expect(await prisma.newsletterSubscription.count()).toBe(1);
    expect(sentEmails).toHaveLength(1);
  });

  it('met a jour le statut et la periode', async () => {
    await seedUser();
    await handleStripeEvent(subscriptionEvent('customer.subscription.created'));
    await handleStripeEvent(
      subscriptionEvent('customer.subscription.updated', {
        status: 'past_due',
        cancel_at_period_end: true,
      }),
    );

    const subscription = await prisma.stripeSubscription.findUniqueOrThrow({
      where: { stripeSubscriptionId: SUBSCRIPTION },
    });
    expect(subscription.status).toBe('past_due');
    expect(subscription.cancelAtPeriodEnd).toBe(true);
  });

  it('annule l abonnement supprime', async () => {
    await seedUser();
    await handleStripeEvent(subscriptionEvent('customer.subscription.created'));
    await handleStripeEvent(subscriptionEvent('customer.subscription.deleted'));

    const subscription = await prisma.stripeSubscription.findUniqueOrThrow({
      where: { stripeSubscriptionId: SUBSCRIPTION },
    });
    expect(subscription.status).toBe('canceled');
  });

  it('passe en impaye et previent l utilisateur', async () => {
    const user = await seedUser();
    await handleStripeEvent(subscriptionEvent('customer.subscription.created'));
    sentEmails.length = 0;

    await handleStripeEvent({
      id: 'evt_failed',
      type: 'invoice.payment_failed',
      data: {
        object: {
          parent: { subscription_details: { subscription: SUBSCRIPTION } },
          lines: { data: [] },
        },
      },
    } as unknown as Stripe.Event);

    const subscription = await prisma.stripeSubscription.findUniqueOrThrow({
      where: { stripeSubscriptionId: SUBSCRIPTION },
    });
    expect(subscription.status).toBe('past_due');
    expect(sentEmails[0].to).toBe(user.email);
  });

  it('prolonge la periode couverte apres un paiement reussi', async () => {
    await seedUser();
    await handleStripeEvent(subscriptionEvent('customer.subscription.created'));

    const nextEnd = PERIOD_END + 2_600_000;
    await handleStripeEvent({
      id: 'evt_paid',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          parent: { subscription_details: { subscription: SUBSCRIPTION } },
          lines: { data: [{ period: { start: PERIOD_END, end: nextEnd } }] },
        },
      },
    } as unknown as Stripe.Event);

    const subscription = await prisma.stripeSubscription.findUniqueOrThrow({
      where: { stripeSubscriptionId: SUBSCRIPTION },
    });
    expect(subscription.currentPeriodEnd.getTime()).toBe(nextEnd * 1000);
    expect(subscription.status).toBe('active');
  });

  it('ignore un evenement dont le client est inconnu', async () => {
    const outcome = await handleStripeEvent(subscriptionEvent('customer.subscription.created'));
    expect(outcome.handled).toBe(false);
    expect(await prisma.stripeSubscription.count()).toBe(0);
  });
});

describe('double opt-in et desabonnement', () => {
  it('ne rend eligible qu apres confirmation', async () => {
    const user = await seedUser();
    await handleStripeEvent(subscriptionEvent('customer.subscription.created'));

    expect(await canReceiveNewsletter(user.id)).toBe(false);

    const token = (
      await prisma.newsletterSubscription.findUniqueOrThrow({ where: { userId: user.id } })
    ).confirmToken;
    expect(await confirmSubscription(token)).toBe(true);
    expect(await canReceiveNewsletter(user.id)).toBe(true);
  });

  it('arrete les envois sans toucher a l abonnement Stripe', async () => {
    const user = await seedUser();
    await handleStripeEvent(subscriptionEvent('customer.subscription.created'));
    const token = (
      await prisma.newsletterSubscription.findUniqueOrThrow({ where: { userId: user.id } })
    ).confirmToken;
    await confirmSubscription(token);

    expect(await unsubscribe(token)).toBe(true);
    expect(await canReceiveNewsletter(user.id)).toBe(false);

    const subscription = await prisma.stripeSubscription.findUniqueOrThrow({
      where: { stripeSubscriptionId: SUBSCRIPTION },
    });
    expect(subscription.status).toBe('active');
  });

  it('refuse un jeton inconnu', async () => {
    expect(await confirmSubscription('jeton-inconnu')).toBe(false);
    expect(await unsubscribe('jeton-inconnu')).toBe(false);
  });
});
