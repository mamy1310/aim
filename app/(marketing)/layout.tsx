import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { getSessionUser } from '@/lib/auth/guards';

import TopBar from '../_components/TopBar';
import NavLinks from '../_components/NavLinks';
import ThemeToggle from '../_components/ThemeToggle';
import { container, ghostSx, serif } from '../_components/styles';

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const tc = await getTranslations('common');
  const t = await getTranslations('landing');
  const footerLabels = t.raw('footer.links') as string[];
  const user = await getSessionUser();
  const footerHrefs = ['/mentions-legales', '/cgv', '/confidentialite', '/contact'];

  const nav = (
    <NavLinks
      items={[
        { label: tc('nav.how'), href: '/#etapes' },
        { label: tc('nav.courses'), href: '/cours' },
        { label: tc('nav.newsletter'), href: '/#newsletter' },
        { label: tc('nav.faq'), href: '/#faq' },
      ]}
    />
  );

  const actions = (
    <>
      <Button href={user ? '/dashboard' : '/login'} variant="outlined" size="small" sx={ghostSx}>
        {user ? tc('actions.dashboard') : tc('actions.login')}
      </Button>
      <ThemeToggle />
    </>
  );

  return (
    <>
      <TopBar nav={nav} actions={actions} />
      {children}
      <Box
        component="footer"
        sx={{ py: { xs: 6, md: 7 }, color: 'text.secondary', fontSize: '14px' }}
      >
        <Box sx={container}>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              mb: 4,
              gridTemplateColumns: { md: '1fr auto' },
              alignItems: { md: 'end' },
            }}
          >
            <Box>
              <Box sx={{ ...serif, fontSize: '20px', color: 'text.primary', mb: 0.75 }}>
                {tc('appName')}
              </Box>
              <Typography sx={{ color: 'text.secondary', fontSize: '14px', maxWidth: '36ch' }}>
                {t('footer.tagline')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '18px 22px' }}>
              {footerLabels.map((label, i) => (
                <Link
                  key={label}
                  href={footerHrefs[i]}
                  underline="none"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '14px',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {label}
                </Link>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 1.5,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'dividerSoft',
              fontSize: '12.5px',
              color: 'text.disabled',
            }}
          >
            <Box component="span">{t('footer.copyright')}</Box>
            <Box component="span">{t('footer.hosting')}</Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
