import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';

import Brand from '../_components/Brand';
import ThemeToggle from '../_components/ThemeToggle';

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('auth');

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'dividerSoft',
          bgcolor: 'background.default',
        }}
      >
        <Box
          sx={{
            maxWidth: 'clamp(1040px, 92vw, 1120px)',
            mx: 'auto',
            px: { xs: '20px', md: '32px' },
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Brand />
          <ThemeToggle />
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: { xs: 'flex-start', md: 'center' },
          px: '20px',
          pt: { xs: 7, md: 11 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420, display: 'grid', gap: 3.25 }}>{children}</Box>
      </Box>

      <Box
        component="footer"
        sx={{
          textAlign: 'center',
          py: 3,
          fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontSize: '12.5px',
          color: 'text.disabled',
        }}
      >
        {t('footer')}
      </Box>
    </Box>
  );
}
