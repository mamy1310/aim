import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { getSessionUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';

import { container, mono, serif } from '../../_components/styles';
import NewsletterCta, { type CtaState } from './NewsletterCta';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('newsletter.meta');
  return { title: t('title'), description: t('description') };
}

type Props = { searchParams: Promise<{ confirmation?: string; desabonnement?: string }> };

export default async function NewsletterPage({ searchParams }: Props) {
  const t = await getTranslations('newsletter');
  const user = await getSessionUser();
  const { confirmation, desabonnement } = await searchParams;

  const subscription = user
    ? await prisma.stripeSubscription.findFirst({
        where: { userId: user.id, status: { in: ['active', 'trialing'] } },
        select: { id: true },
      })
    : null;

  const state: CtaState = !user
    ? 'anonymous'
    : !user.emailVerified
      ? 'unverified'
      : subscription
        ? 'subscribed'
        : 'ready';

  const notice =
    confirmation === 'ok'
      ? t('confirmationOk')
      : confirmation === 'invalide'
        ? t('confirmationInvalid')
        : desabonnement === 'ok'
          ? t('unsubscribeOk')
          : desabonnement === 'invalide'
            ? t('unsubscribeInvalid')
            : null;

  const bullets = t.raw('bullets') as string[];

  return (
    <Box component="main" sx={{ ...container, maxWidth: 720, py: { xs: 7, md: 11 } }}>
      {notice ? (
        <Box
          role="status"
          sx={{
            mb: 4,
            p: '12px 14px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            bgcolor: 'background.paper',
            fontSize: '14px',
          }}
        >
          {notice}
        </Box>
      ) : null}

      <Box
        component="span"
        sx={{ ...mono, fontSize: '11px', letterSpacing: '0.08em', color: 'text.disabled' }}
      >
        {t('kicker')}
      </Box>
      <Typography
        component="h1"
        sx={{
          ...serif,
          mt: 1.5,
          mb: 1.5,
          fontWeight: 500,
          fontSize: 'clamp(2rem, 5.5vw, 2.75rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}
      >
        {t('title')}
      </Typography>
      <Typography sx={{ fontSize: '16.5px', color: 'text.secondary', mb: 3 }}>
        {t('lede')}
      </Typography>

      <Box component="ul" sx={{ display: 'grid', gap: 1, pl: 2.5, mb: 4, fontSize: '15.5px' }}>
        {bullets.map((bullet) => (
          <Box component="li" key={bullet}>
            {bullet}
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 3 }}>
        <Typography sx={{ ...serif, fontSize: '36px', fontWeight: 500 }}>{t('price')}</Typography>
        <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('per')}</Box>
      </Box>

      <NewsletterCta state={state} />
    </Box>
  );
}
