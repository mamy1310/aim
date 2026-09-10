import { NextResponse } from 'next/server';

import { assertCronRequest } from '@/lib/cron';
import { runSummarizeJob } from '@/lib/newsletter/summarize-job';

// 6h UTC is attempt 1, 8h is 2, 10h is 3.
function attemptNumberFor(hour: number): number {
  if (hour < 7) return 1;
  if (hour < 9) return 2;
  return 3;
}

export async function POST(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;

  const result = await runSummarizeJob(attemptNumberFor(new Date().getUTCHours()));
  if (result.status === 'disabled') {
    console.info('AI summarization disabled by env');
  }

  return NextResponse.json(result);
}

export const GET = POST;
