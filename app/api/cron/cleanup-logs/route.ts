import { NextResponse } from 'next/server';

import { assertCronRequest } from '@/lib/cron';
import { purgeOldGenerationLogs } from '@/lib/ai/retention';

export async function POST(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;

  return NextResponse.json(await purgeOldGenerationLogs());
}

export const GET = POST;
