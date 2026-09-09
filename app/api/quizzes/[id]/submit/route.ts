import { NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth/guards';
import { submitQuiz } from '@/lib/courses/service';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = await submitQuiz(user, { ...body, quizId: id });

  if (!result.ok) {
    const status =
      result.error === 'not_found' ? 404 : result.error === 'invalid_input' ? 400 : 403;
    return NextResponse.json({ error: result.error }, { status });
  }

  const { ok: _ok, ...payload } = result;
  return NextResponse.json(payload);
}
