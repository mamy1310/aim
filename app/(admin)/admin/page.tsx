import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';

import { mono, serif } from '../../_components/styles';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('admin.meta');
  return { title: t('title'), description: t('description') };
}

export default async function AdminHomePage() {
  const t = await getTranslations('admin.home');

  const [users, verified, published, drafts, badges, subscribers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.course.count({ where: { published: true } }),
    prisma.course.count({ where: { published: false } }),
    prisma.badge.count(),
    prisma.newsletterSubscription.count({ where: { confirmed: true, unsubscribedAt: null } }),
  ]);

  const stats = [
    { label: t('users'), value: users },
    { label: t('verified'), value: verified },
    { label: t('courses'), value: published },
    { label: t('drafts'), value: drafts },
    { label: t('badges'), value: badges },
    { label: t('subscribers'), value: subscribers },
  ];

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '30px', fontWeight: 500, mb: 3 }}>
        {t('title')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        {stats.map((stat) => (
          <Box
            key={stat.label}
            sx={{
              p: '18px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              component="span"
              sx={{ ...mono, fontSize: '10.5px', letterSpacing: '0.06em', color: 'text.disabled' }}
            >
              {stat.label}
            </Box>
            <Typography sx={{ ...serif, fontSize: '30px', fontWeight: 500, mt: 0.5 }}>
              {stat.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}
