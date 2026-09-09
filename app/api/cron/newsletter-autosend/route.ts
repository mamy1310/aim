import { NextResponse } from 'next/server';

import { assertCronRequest } from '@/lib/cron';
import { runAutoSendJob } from '@/lib/newsletter/send';

export async function POST(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;

  return NextResponse.json(await runAutoSendJob());
}

export const GET = POST;
