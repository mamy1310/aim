import 'server-only';

import { renderEmail } from '@/lib/email/layout';
import { sendEmail } from '@/lib/email/send';
import { getEmailTranslations } from '@/lib/i18n/emails';
import { env } from '@/lib/env';

export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const t = getEmailTranslations('verifyEmail');
  const { html, text } = renderEmail({
    preheader: t('preheader'),
    heading: t('heading'),
    paragraphs: [t('body'), t('expiry')],
    cta: { label: t('cta'), url: `${env.siteUrl}/verify-email/${token}` },
    footer: t('footer'),
  });

  await sendEmail({ to, subject: t('subject'), html, text });
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const t = getEmailTranslations('resetPassword');
  const { html, text } = renderEmail({
    preheader: t('preheader'),
    heading: t('heading'),
    paragraphs: [t('body'), t('expiry')],
    cta: { label: t('cta'), url: `${env.siteUrl}/reset-password/${token}` },
    footer: t('footer'),
  });

  await sendEmail({ to, subject: t('subject'), html, text });
}
