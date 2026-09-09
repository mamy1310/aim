import type Stripe from 'stripe';

import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth/tokens';
import { renderEmail } from '@/lib/email/layout';
import { sendEmail } from '@/lib/email/send';
import { getEmailTranslations } from '@/lib/i18n/emails';
import { env } from '@/lib/env';

export type WebhookOutcome = { handled: boolean; reason?: string };

function periodDates(subscription: Stripe.Subscription): { start: Date; end: Date } {
  const item = subscription.items?.data?.[0];
  const start = item?.current_period_start ?? subscription.start_date;
  const end = item?.current_period_end ?? subscription.start_date;

  return { start: new Date(start * 1000), end: new Date(end * 1000) };
}

async function userForCustomer(customerId: string) {
  return prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
}

async function sendDoubleOptInEmail(to: string, token: string) {
  const t = getEmailTranslations('newsletterOptIn');
  const { html, text } = renderEmail({
    preheader: t('preheader'),
    heading: t('heading'),
    paragraphs: [t('body')],
    cta: { label: t('cta'), url: `${env.siteUrl}/api/newsletter/confirm/${token}` },
    footer: t('footer'),
  });

  await sendEmail({ to, subject: t('subject'), html, text });
}

async function upsertSubscription(subscription: Stripe.Subscription): Promise<WebhookOutcome> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const user = await userForCustomer(customerId);
  if (!user) return { handled: false, reason: 'client inconnu' };

  const { start, end } = periodDates(subscription);

  await prisma.stripeSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status,
      stripePriceId: subscription.items.data[0]?.price.id ?? '',
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id ?? '',
      status: subscription.status,
      currentPeriodStart: start,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    },
  });

  return { handled: true };
}

// Chaque traitement est idempotent : rejouer le meme evenement laisse la base
// dans le meme etat, ce que Stripe fait regulierement.
export async function handleStripeEvent(event: Stripe.Event): Promise<WebhookOutcome> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.userId;
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id;

      if (!userId || !customerId) return { handled: false, reason: 'session incomplete' };

      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
      return { handled: true };
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      const result = await upsertSubscription(subscription);
      if (!result.handled) return result;

      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;
      const user = await userForCustomer(customerId);
      if (!user) return { handled: false, reason: 'client inconnu' };

      const existing = await prisma.newsletterSubscription.findUnique({
        where: { userId: user.id },
      });
      if (existing) return { handled: true };

      const confirmToken = generateToken();
      await prisma.newsletterSubscription.create({
        data: { userId: user.id, confirmToken },
      });
      await sendDoubleOptInEmail(user.email, confirmToken);

      return { handled: true };
    }

    case 'customer.subscription.updated':
      return upsertSubscription(event.data.object as Stripe.Subscription);

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.stripeSubscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'canceled' },
      });
      return { handled: true };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (!subscriptionId) return { handled: false, reason: 'facture sans abonnement' };

      const record = await prisma.stripeSubscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
        include: { user: { select: { email: true } } },
      });
      if (!record) return { handled: false, reason: 'abonnement inconnu' };

      await prisma.stripeSubscription.update({
        where: { id: record.id },
        data: { status: 'past_due' },
      });

      const t = getEmailTranslations('paymentFailed');
      const { html, text } = renderEmail({
        preheader: t('preheader'),
        heading: t('heading'),
        paragraphs: [t('body')],
        cta: { label: t('cta'), url: `${env.siteUrl}/account/billing` },
        footer: t('footer'),
      });
      await sendEmail({ to: record.user.email, subject: t('subject'), html, text });

      return { handled: true };
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (!subscriptionId) return { handled: false, reason: 'facture sans abonnement' };

      const line = invoice.lines?.data?.[0];
      if (!line?.period) return { handled: false, reason: 'facture sans periode' };

      await prisma.stripeSubscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
          status: 'active',
          currentPeriodStart: new Date(line.period.start * 1000),
          currentPeriodEnd: new Date(line.period.end * 1000),
        },
      });
      return { handled: true };
    }

    default:
      return { handled: false, reason: `evenement ignore : ${event.type}` };
  }
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as { subscription_details?: { subscription?: string } } | null;
  const fromParent = parent?.subscription_details?.subscription;
  if (fromParent) return fromParent;

  const legacy = (invoice as unknown as { subscription?: string | { id: string } }).subscription;
  if (!legacy) return null;
  return typeof legacy === 'string' ? legacy : legacy.id;
}
