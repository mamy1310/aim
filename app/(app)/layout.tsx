import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import TopBar from '../_components/TopBar';
import NavLinks from '../_components/NavLinks';
import ThemeToggle from '../_components/ThemeToggle';
import { container, serif } from '../_components/styles';
import { currentUser } from './_data';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('dashboard');

  const nav = (
    <NavLinks
      items={[
        { label: t('nav.dashboard'), href: '/dashboard' },
        { label: t('nav.courses'), href: '/cours' },
        { label: t('nav.badges'), href: '/dashboard#mes-badges' },
        { label: t('nav.newsletter'), href: '/dashboard#newsletter' },
      ]}
    />
  );

  const actions = (
    <>
      <ThemeToggle />
      <Link
        href="/account"
        aria-label={t('account.open')}
        underline="none"
        sx={{
          height: 36,
          pl: '6px',
          pr: '12px',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '999px',
          bgcolor: 'background.paper',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '13.5px',
          color: 'text.secondary',
          transition: 'border-color .15s, color .15s',
          '&:hover': { borderColor: 'text.disabled', color: 'text.primary' },
        }}
      >
        <Box
          aria-hidden
          sx={{
            ...serif,
            width: 26,
            height: 26,
            borderRadius: '999px',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {currentUser.name.charAt(0).toUpperCase()}
        </Box>
        {currentUser.name}
      </Link>
    </>
  );

  return (
    <>
      <TopBar nav={nav} actions={actions} />
      {children}
      <Box
        component="footer"
        sx={{ mt: 3, py: 7, borderTop: '1px solid', borderColor: 'dividerSoft' }}
      >
        <Box
          sx={{
            ...container,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
            fontSize: '12.5px',
            color: 'text.disabled',
          }}
        >
          <Box component="span">
            {t('footer.copyright')} · {t('footer.signedInAs', { name: currentUser.name })}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.25 }}>
            <Link
              href="/account"
              underline="none"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {t('footer.account')}
            </Link>
            <Link
              href="/aide"
              underline="none"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {t('footer.help')}
            </Link>
            <Link
              href="/logout"
              underline="none"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {t('footer.logout')}
            </Link>
          </Box>
        </Box>
      </Box>
    </>
  );
}
