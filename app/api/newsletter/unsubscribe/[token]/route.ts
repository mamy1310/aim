import { NextResponse } from 'next/server';

import { unsubscribe } from '@/lib/newsletter/subscription';
import { env } from '@/lib/env';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const done = await unsubscribe(token);

  return NextResponse.redirect(
    `${env.siteUrl}/newsletter?desabonnement=${done ? 'ok' : 'invalide'}`,
  );
}
