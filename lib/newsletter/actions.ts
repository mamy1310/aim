'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { MAX_LEVEL } from '@/lib/levels';

const maxLevelSchema = z.number().int().min(1).max(MAX_LEVEL).nullable();

export async function updateMaxLevelAction(input: unknown): Promise<{ ok: boolean }> {
  const user = await requireUser();

  const parsed = maxLevelSchema.safeParse(input);
  if (!parsed.success) return { ok: false };

  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { userId: user.id },
  });
  if (!subscription) return { ok: false };

  await prisma.newsletterSubscription.update({
    where: { id: subscription.id },
    data: { maxLevel: parsed.data },
  });

  revalidatePath('/account');
  return { ok: true };
}
