import { prisma } from '@/lib/db';
import { renderEmail } from '@/lib/email/layout';
import { sendEmail } from '@/lib/email/send';
import { getEmailTranslations } from '@/lib/i18n/emails';
import { env } from '@/lib/env';

export type BuildJobResult = { status: 'no_summary' } | { status: 'created'; issueId: string };

export function issueSubject(date: Date, locale = 'fr-FR'): string {
  const label = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);

  return `AIm - ${label}`;
}

export async function runBuildJob(now = new Date()): Promise<BuildJobResult> {
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const summary = await prisma.newsletterArticleSummary.findFirst({
    where: { generatedAt: { gte: since }, items: { none: {} } },
    orderBy: { generatedAt: 'desc' },
    select: { id: true, titleLocalized: true },
  });

  // Pas de resume du jour : aucune issue, aucun envoi, aucun message "rien aujourd hui".
  if (!summary) return { status: 'no_summary' };

  const issue = await prisma.newsletterIssue.create({
    data: {
      subject: issueSubject(now),
      intendedSendAt: new Date(now.getTime() + env.autoSendDelayHours * 60 * 60 * 1000),
      items: { create: { summaryId: summary.id, order: 1 } },
    },
    select: { id: true, subject: true, intendedSendAt: true },
  });

  const t = getEmailTranslations('adminDraft');
  const { html, text } = renderEmail({
    preheader: t('preheader'),
    heading: t('heading'),
    paragraphs: [
      t('body', { title: summary.titleLocalized }),
      t('autoSend', {
        time: new Intl.DateTimeFormat('fr-FR', {
          dateStyle: 'short',
          timeStyle: 'short',
          timeZone: 'UTC',
        }).format(issue.intendedSendAt),
      }),
    ],
    cta: { label: t('cta'), url: `${env.siteUrl}/admin/newsletter/issues/${issue.id}/edit` },
    footer: t('footer'),
  });

  await sendEmail({
    to: env.adminNotificationEmail,
    subject: `${t('subject')} - ${issue.subject}`,
    html,
    text,
  });

  return { status: 'created', issueId: issue.id };
}
