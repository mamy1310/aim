import type { Metadata } from 'next';
import { getFormatter, getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { getBadgeByToken } from '@/lib/courses/service';
import { env } from '@/lib/env';
import { levelKey } from '@/lib/levels';

import { container, ghostSx, mono, serif } from '../../../_components/styles';

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('badges.meta');
  return { title: t('title'), description: t('description') };
}

export default async function BadgePage({ params }: Props) {
  const { token } = await params;
  const t = await getTranslations('badges');
  const tc = await getTranslations('common');
  const format = await getFormatter();
  const badge = await getBadgeByToken(token);

  if (!badge) {
    return (
      <Box component="main" sx={{ ...container, maxWidth: 640, py: { xs: 8, md: 12 } }}>
        <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 1.5 }}>
          {t('notFound')}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{t('notFoundBody')}</Typography>
      </Box>
    );
  }

  const holder = badge.user.name?.trim() || badge.user.email.split('@')[0];
  const verifyUrl = `${env.siteUrl}/badge/${badge.verifyToken}`;
  const linkedInUrl = new URL('https://www.linkedin.com/profile/add');
  linkedInUrl.searchParams.set('startTask', 'CERTIFICATION_NAME');
  linkedInUrl.searchParams.set('name', badge.course.title);
  linkedInUrl.searchParams.set('organizationName', 'AIm');
  linkedInUrl.searchParams.set('issueYear', String(badge.issuedAt.getFullYear()));
  linkedInUrl.searchParams.set('issueMonth', String(badge.issuedAt.getMonth() + 1));
  linkedInUrl.searchParams.set('certUrl', verifyUrl);

  return (
    <Box component="main" sx={{ ...container, maxWidth: 640, py: { xs: 7, md: 11 } }}>
      <Box
        sx={{
          p: { xs: '24px', md: '32px' },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          bgcolor: 'background.paper',
          display: 'grid',
          gap: 2,
        }}
      >
        <Box
          component="span"
          sx={{ ...mono, fontSize: '11px', letterSpacing: '0.08em', color: 'success.main' }}
        >
          {t('kicker')}
        </Box>
        <Typography
          component="h1"
          sx={{
            ...serif,
            fontSize: 'clamp(1.6rem, 4.5vw, 2.125rem)',
            fontWeight: 500,
            lineHeight: 1.15,
          }}
        >
          {t('heading', { name: holder, course: badge.course.title })}
        </Typography>
        <Box
          component="span"
          sx={{ ...mono, fontSize: '11.5px', letterSpacing: '0.05em', color: 'text.disabled' }}
        >
          {tc(levelKey(badge.course.level))} ·{' '}
          {t('issuedOn', { date: format.dateTime(badge.issuedAt, { dateStyle: 'long' }) })}
        </Box>
        <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
          {t('disclaimer')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
          <Button href={linkedInUrl.toString()} variant="contained" size="small" target="_blank">
            {t('addToLinkedIn')}
          </Button>
          <Button href="/cours" variant="outlined" size="small" sx={ghostSx}>
            {t('discover')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
