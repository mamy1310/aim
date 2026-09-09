import { NextResponse } from 'next/server';

import { assertCronRequest } from '@/lib/cron';
import { fetchNewsletterArticles } from '@/lib/newsletter/fetch';

export async function POST(request: Request) {
  const denied = assertCronRequest(request);
  if (denied) return denied;

  return NextResponse.json(await fetchNewsletterArticles());
}

export const GET = POST;
