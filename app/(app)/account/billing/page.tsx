import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';

import { mono, serif } from '../../../_components/styles';
import BillingActions from './BillingActions';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account.billing.meta');
  return { title: t('title'), description: t('description') };
}

type Props = { searchParams: Promise<{ success?: string; canceled?: string }> };

export default async function BillingPage({ searchParams }: Props) {
  const t = await getTranslations('account.billing');
  const format = await getFormatter();
  const user = await requireUser();
  const { success, canceled } = await searchParams;

  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      stripeCustomerId: true,
      stripeSubscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
      newsletterSubscription: { select: { confirmed: true, unsubscribedAt: true } },
    },
  });

  const subscription = record.stripeSubscriptions[0] ?? null;
  const newsletter = record.newsletterSubscription;

  const newsletterState = !newsletter
    ? null
    : newsletter.unsubscribedAt
      ? t('unsubscribed')
      : newsletter.confirmed
        ? t('receiving')
        : t('waitingConfirmation');

  return (
    <Box component="main" sx={{ maxWidth: 720, mx: 'auto', px: { xs: '20px', md: '32px' } }}>
      <Box sx={{ pt: { xs: 6, md: 9 }, pb: 3 }}>
        <Box sx={{ ...mono, fontSize: '11.5px', letterSpacing: '0.06em', color: 'text.disabled' }}>
          <Link href="/account" underline="none" sx={{ color: 'inherit' }}>
            {t('crumb')}
          </Link>
        </Box>
        <Typography component="h1" sx={{ ...serif, fontSize: '32px', fontWeight: 500, mt: 1.5 }}>
          {t('title')}
        </Typography>
      </Box>

      {success ? (
        <Typography sx={{ color: 'success.main', mb: 2 }}>{t('success')}</Typography>
      ) : null}
      {canceled ? (
        <Typography sx={{ color: 'text.secondary', mb: 2 }}>{t('canceled')}</Typography>
      ) : null}

      <Box
        sx={{
          p: '20px',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '14px',
          bgcolor: 'background.paper',
          display: 'grid',
          gap: 1.5,
        }}
      >
        {subscription ? (
          <>
            <Box sx={{ fontSize: '15px' }}>
              {t('status')} : {t(`statuses.${subscription.status}` as 'statuses.active')}
            </Box>
            <Box sx={{ fontSize: '15px', color: 'text.secondary' }}>
              {t('renewal')} :{' '}
              {format.dateTime(subscription.currentPeriodEnd, { dateStyle: 'long' })}
            </Box>
            {subscription.cancelAtPeriodEnd ? (
              <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('cancelAtPeriodEnd')}</Box>
            ) : null}
          </>
        ) : (
          <Typography sx={{ color: 'text.secondary' }}>{t('none')}</Typography>
        )}

        {newsletterState ? (
          <Box sx={{ ...mono, fontSize: '11px', color: 'text.disabled' }}>
            {t('newsletterState')} : {newsletterState}
          </Box>
        ) : null}

        <Box sx={{ mt: 1 }}>
          <BillingActions hasCustomer={Boolean(record.stripeCustomerId)} />
        </Box>
      </Box>
    </Box>
  );
}
