import { renderEmail } from '@/lib/email/layout';
import { getEmailTranslations } from '@/lib/i18n/emails';
import { env } from '@/lib/env';

export type IssueEmailInput = {
  intro: string;
  date: Date;
  levelLabel: string;
  categoryLabel: string;
  article: {
    titleLocalized: string;
    summary: string;
    whyItMatters: string;
    sourceName: string;
    sourceUrl: string;
  };
  unsubscribeToken: string;
};

export function renderIssueEmail(input: IssueEmailInput): { html: string; text: string } {
  const t = getEmailTranslations('issue');
  const dateLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(input.date);

  const paragraphs = [
    ...(input.intro.trim() ? [input.intro.trim()] : []),
    `${input.levelLabel} · ${input.categoryLabel}`,
    input.article.summary,
    `${t('whyItMatters')} ${input.article.whyItMatters}`,
    `${t('source')} ${input.article.sourceName}`,
    t('aiNotice'),
  ];

  return renderEmail({
    preheader: input.article.titleLocalized,
    heading: input.article.titleLocalized,
    paragraphs: [dateLabel, ...paragraphs],
    cta: { label: t('readOriginal'), url: input.article.sourceUrl },
    footer: `${t('unsubscribe')} ${env.siteUrl}/api/newsletter/unsubscribe/${input.unsubscribeToken} · ${env.siteUrl}`,
  });
}
