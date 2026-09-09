import 'server-only';

import { NextResponse } from 'next/server';

import { env } from '@/lib/env';

export function assertCronRequest(request: Request): NextResponse | null {
  const header = request.headers.get('authorization');
  if (header !== `Bearer ${env.cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return null;
}
