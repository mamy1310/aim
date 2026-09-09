'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { sendIssue } from '@/lib/newsletter/send';

export type AdminResult = { ok: true } | { ok: false; error: string };

const sourceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  rssUrl: z.string().trim().url(),
  category: z.enum(['OFFICIAL', 'RESEARCH', 'COMMUNITY']),
  enabled: z.boolean(),
});

export async function saveSourceAction(
  sourceId: string | null,
  input: unknown,
): Promise<AdminResult> {
  await requireAdmin();

  const parsed = sourceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const conflict = await prisma.newsletterSource.findUnique({
    where: { rssUrl: parsed.data.rssUrl },
  });
  if (conflict && conflict.id !== sourceId) return { ok: false, error: 'url_taken' };

  if (sourceId) {
    await prisma.newsletterSource.update({ where: { id: sourceId }, data: parsed.data });
  } else {
    await prisma.newsletterSource.create({ data: parsed.data });
  }

  revalidatePath('/admin/newsletter/sources');
  return { ok: true };
}

export async function deleteSourceAction(sourceId: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.newsletterSource.delete({ where: { id: sourceId } });
  revalidatePath('/admin/newsletter/sources');
  return { ok: true };
}

export async function requeueArticleAction(articleId: string): Promise<AdminResult> {
  await requireAdmin();

  await prisma.newsletterArticle.update({
    where: { id: articleId },
    data: { status: 'PENDING', skipReason: null },
  });

  revalidatePath('/admin/newsletter/articles');
  return { ok: true };
}

const issueSchema = z.object({
  subject: z.string().trim().min(3).max(180),
  intro: z.string().trim().max(1200),
});

export async function updateIssueAction(issueId: string, input: unknown): Promise<AdminResult> {
  await requireAdmin();

  const parsed = issueSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const issue = await prisma.newsletterIssue.findUnique({ where: { id: issueId } });
  if (!issue) return { ok: false, error: 'not_found' };
  if (issue.status === 'SENT') return { ok: false, error: 'already_sent' };

  await prisma.newsletterIssue.update({ where: { id: issueId }, data: parsed.data });
  revalidatePath(`/admin/newsletter/issues/${issueId}/edit`);
  return { ok: true };
}

export async function sendIssueAction(issueId: string): Promise<AdminResult> {
  await requireAdmin();

  const result = await sendIssue(issueId, { autoSent: false });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath('/admin/newsletter/issues');
  return { ok: true };
}

export async function deleteIssueAction(issueId: string): Promise<AdminResult> {
  await requireAdmin();

  const issue = await prisma.newsletterIssue.findUnique({ where: { id: issueId } });
  if (!issue) return { ok: false, error: 'not_found' };
  if (issue.status === 'SENT') return { ok: false, error: 'already_sent' };

  await prisma.newsletterIssue.delete({ where: { id: issueId } });
  revalidatePath('/admin/newsletter/issues');
  redirect('/admin/newsletter/issues');
}
