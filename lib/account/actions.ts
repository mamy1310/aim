'use server';

import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth/guards';
import { destroySession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function deleteAccountAction(): Promise<void> {
  const user = await requireUser();

  await destroySession();
  await prisma.user.delete({ where: { id: user.id } });

  redirect('/?compte=supprime');
}
