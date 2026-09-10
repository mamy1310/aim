import Stripe from 'stripe';

import { env } from '@/lib/env';

function localOverrides(): Stripe.StripeConfig {
  const base = env.stripeApiBase;
  if (!base) return {};

  const url = new URL(base);
  return {
    host: url.hostname,
    port: Number(url.port || (url.protocol === 'https:' ? 443 : 80)),
    protocol: url.protocol === 'https:' ? 'https' : 'http',
  };
}

let client: Stripe | undefined;

export function stripe(): Stripe {
  client ??= new Stripe(env.stripeSecretKey, localOverrides());
  return client;
}
