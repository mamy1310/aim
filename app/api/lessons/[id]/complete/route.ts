import { NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth/guards';
import { completeLesson } from '@/lib/courses/service';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await params;
  const result = await completeLesson(user, id);

  if (!result.ok) {
    const status = result.error === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ progress: result.progress });
}
