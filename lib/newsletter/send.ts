import { prisma } from '@/lib/db';
import { sendBatch } from '@/lib/email/send';
import { getEmailTranslations } from '@/lib/i18n/emails';
import { filterRecipientsByLevel, listNewsletterRecipients } from '@/lib/newsletter/recipients';
import { renderIssueEmail } from '@/lib/newsletter/issue-email';

export type SendResult =
  | { ok: true; recipientCount: number }
  | { ok: false; error: 'not_found' | 'already_sent' | 'empty_issue' };

export async function sendIssue(
  issueId: string,
  options: { autoSent: boolean },
  now = new Date(),
): Promise<SendResult> {
  const issue = await prisma.newsletterIssue.findUnique({
    where: { id: issueId },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: { summary: { include: { article: { include: { source: true } } } } },
      },
    },
  });

  if (!issue) return { ok: false, error: 'not_found' };
  if (issue.status === 'SENT') return { ok: false, error: 'already_sent' };

  const item = issue.items[0];
  if (!item) return { ok: false, error: 'empty_issue' };

  const summary = item.summary;
  const levels = getEmailTranslations('levels');
  const categories = getEmailTranslations('categories');

  const subscribers = await listNewsletterRecipients();
  const recipients = filterRecipientsByLevel(subscribers, summary.level);

  const messages = recipients.map((recipient) => {
    const { html, text } = renderIssueEmail({
      intro: issue.intro,
      date: now,
      levelLabel: levels(String(Math.min(summary.level, 3)) as '1' | '2' | '3'),
      categoryLabel: categories(summary.category),
      article: {
        titleLocalized: summary.titleLocalized,
        summary: summary.summary,
        whyItMatters: summary.whyItMatters,
        sourceName: summary.article.source.name,
        sourceUrl: summary.article.sourceUrl,
      },
      unsubscribeToken: recipient.confirmToken,
    });

    return { to: recipient.email, subject: issue.subject, html, text };
  });

  if (messages.length > 0) await sendBatch(messages);

  await prisma.newsletterIssue.update({
    where: { id: issue.id },
    data: {
      status: 'SENT',
      sentAt: now,
      autoSent: options.autoSent,
      recipientCount: messages.length,
    },
  });

  return { ok: true, recipientCount: messages.length };
}

export async function runAutoSendJob(now = new Date()): Promise<{ sent: string[] }> {
  const due = await prisma.newsletterIssue.findMany({
    where: { status: 'DRAFT', intendedSendAt: { lte: now } },
    select: { id: true },
  });

  const sent: string[] = [];
  for (const issue of due) {
    const result = await sendIssue(issue.id, { autoSent: true }, now);
    if (result.ok) sent.push(issue.id);
  }

  return { sent };
}
