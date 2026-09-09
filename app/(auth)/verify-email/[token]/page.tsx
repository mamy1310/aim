import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import { verifyEmailAction } from '@/lib/auth/actions';

import AuthHead from '../../_components/AuthHead';
import { inlineLinkSx } from '../../_components/swap';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.meta.verify');
  return { title: t('title'), description: t('description') };
}

export default async function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
  const t = await getTranslations('auth.verify');
  const { token } = await params;
  const result = await verifyEmailAction(token);

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <AuthHead
        route="/verify-email"
        title={result.ok ? t('title') : t('errorTitle')}
        subtitle={result.ok ? t('subtitle') : t('errorSubtitle')}
      />
      <Box sx={{ fontSize: '14px' }}>
        <Link href={result.ok ? '/dashboard' : '/login'} underline="none" sx={inlineLinkSx}>
          {result.ok ? t('cta') : t('ctaError')}
        </Link>
      </Box>
    </Box>
  );
}
