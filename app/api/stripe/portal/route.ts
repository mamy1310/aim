import { NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/client';

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });
  if (!record.stripeCustomerId) {
    return NextResponse.json({ error: 'no_customer' }, { status: 400 });
  }

  const session = await stripe().billingPortal.sessions.create({
    customer: record.stripeCustomerId,
    return_url: `${env.siteUrl}/account/billing`,
  });

  return NextResponse.json({ url: session.url });
}
