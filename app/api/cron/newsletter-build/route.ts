import { NextResponse } from 'next/server';

import { assertCronRequest } from '@/lib/cron';
import { runBuildJob } from '@/lib/newsletter/build';

export async function POST(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;

  return NextResponse.json(await runBuildJob());
}

export const GET = POST;
