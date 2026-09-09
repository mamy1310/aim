import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import { requireAdmin } from '@/lib/auth/guards';

import ThemeToggle from '../_components/ThemeToggle';
import TopBar from '../_components/TopBar';
import { mono } from '../_components/styles';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('admin.nav');
  await requireAdmin();

  const nav = (
    <Box sx={{ display: 'flex', gap: 2.5, fontSize: '14px' }}>
      {[
        { label: t('dashboard'), href: '/admin' },
        { label: t('courses'), href: '/admin/courses' },
        { label: t('back'), href: '/' },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          underline="none"
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          {item.label}
        </Link>
      ))}
    </Box>
  );

  return (
    <>
      <TopBar nav={nav} actions={<ThemeToggle />} />
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 1040,
          mx: 'auto',
          px: { xs: '20px', md: '32px' },
          py: { xs: 4, md: 6 },
        }}
      >
        {children}
      </Box>
      <Box
        sx={{
          ...mono,
          textAlign: 'center',
          pb: 5,
          fontSize: '11px',
          letterSpacing: '0.06em',
          color: 'text.disabled',
        }}
      >
        AIm · admin
      </Box>
    </>
  );
}
