import { NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/client';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  if (!user.emailVerified)
    return NextResponse.json({ error: 'email_not_verified' }, { status: 403 });

  const client = stripe();
  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  let customerId = record.stripeCustomerId;
  if (!customerId) {
    const customer = await client.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const session = await client.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    metadata: { userId: user.id },
    line_items: [{ price: env.stripePriceId, quantity: 1 }],
    success_url: `${env.siteUrl}/account/billing?success=1`,
    cancel_url: `${env.siteUrl}/account/billing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
