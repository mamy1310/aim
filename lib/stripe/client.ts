import Stripe from 'stripe';

import { env } from '@/lib/env';

// En developpement et en test, STRIPE_API_BASE pointe sur stripe-mock : aucun
// compte Stripe n'est necessaire pour exercer les appels d'API.
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
