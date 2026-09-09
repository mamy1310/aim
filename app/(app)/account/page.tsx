import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';

import { mono, serif } from '../../_components/styles';
import AccountTabs from './AccountTabs';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('account.meta');
  return { title: t('title'), description: t('description') };
}

export default async function AccountPage() {
  const t = await getTranslations('account');
  const user = await requireUser();
  const [sessionCount, newsletter] = await Promise.all([
    prisma.session.count({ where: { userId: user.id, expires: { gt: new Date() } } }),
    prisma.newsletterSubscription.findUnique({
      where: { userId: user.id },
      select: { maxLevel: true },
    }),
  ]);

  return (
    <Box component="main" sx={{ maxWidth: 880, mx: 'auto', px: { xs: '20px', md: '32px' } }}>
      <Box component="section" sx={{ pt: { xs: 7, md: 10 }, pb: { xs: 3.5, md: 4 } }}>
        <Box
          sx={{
            ...mono,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '11.5px',
            letterSpacing: '0.06em',
            color: 'text.disabled',
            mb: 2.25,
          }}
        >
          <Link
            href="/dashboard"
            underline="none"
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
          >
            {t('crumb.dashboard')}
          </Link>
          <Box component="span" aria-hidden sx={{ opacity: 0.6 }}>
            /
          </Box>
          <Box component="span">{t('crumb.current')}</Box>
        </Box>
        <Typography
          component="h1"
          sx={{
            ...serif,
            fontWeight: 500,
            fontSize: 'clamp(2rem, 5vw, 2.625rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            mb: 1.5,
          }}
        >
          {t('title')}
        </Typography>
        <Typography sx={{ fontSize: '16.5px', color: 'text.secondary', maxWidth: '56ch' }}>
          {t('subtitle')}
        </Typography>
      </Box>

      <AccountTabs
        user={{ fullName: user.name ?? '', email: user.email }}
        sessionCount={sessionCount}
        maxLevel={newsletter?.maxLevel ?? null}
        hasNewsletter={Boolean(newsletter)}
      />
    </Box>
  );
}
