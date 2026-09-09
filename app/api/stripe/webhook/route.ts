import { NextResponse } from 'next/server';

import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/client';
import { handleStripeEvent } from '@/lib/stripe/webhook';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'missing_signature' }, { status: 400 });

  const payload = await request.text();

  let event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  const outcome = await handleStripeEvent(event);
  return NextResponse.json(outcome);
}
