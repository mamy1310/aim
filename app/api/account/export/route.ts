import { NextResponse } from 'next/server';

import { getSessionUser } from '@/lib/auth/guards';
import { exportUserData } from '@/lib/account/export';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const data = await exportUserData(user.id);
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': 'attachment; filename="aim-mes-donnees.json"',
    },
  });
}
