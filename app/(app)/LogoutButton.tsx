'use client';

import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';

import { logoutAction } from '@/lib/auth/actions';

export default function LogoutButton() {
  const t = useTranslations('dashboard.footer');

  return (
    <Box component="form" action={logoutAction}>
      <Box
        component="button"
        type="submit"
        sx={{
          border: 0,
          p: 0,
          bgcolor: 'transparent',
          font: 'inherit',
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': { color: 'text.primary' },
        }}
      >
        {t('logout')}
      </Box>
    </Box>
  );
}
