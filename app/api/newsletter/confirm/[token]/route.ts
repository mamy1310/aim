import { NextResponse } from 'next/server';

import { confirmSubscription } from '@/lib/newsletter/subscription';
import { env } from '@/lib/env';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const confirmed = await confirmSubscription(token);

  return NextResponse.redirect(
    `${env.siteUrl}/newsletter?confirmation=${confirmed ? 'ok' : 'invalide'}`,
  );
}
