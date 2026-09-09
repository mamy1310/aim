'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { ghostSx } from '../../_components/styles';

function Spinner() {
  return (
    <Box
      aria-hidden
      sx={{
        width: 16,
        height: 16,
        borderRadius: '999px',
        border: '2px solid currentColor',
        borderRightColor: 'transparent',
        animation: 'auth-spin .7s linear infinite',
        '@keyframes auth-spin': { to: { transform: 'rotate(360deg)' } },
      }}
    />
  );
}

export function AuthSubmit({
  label,
  loadingLabel,
  loading,
}: {
  label: string;
  loadingLabel: string;
  loading: boolean;
}) {
  return (
    <Button
      type="submit"
      variant="contained"
      fullWidth
      disabled={loading}
      startIcon={loading ? <Spinner /> : undefined}
      sx={{ height: 46 }}
    >
      {loading ? loadingLabel : label}
    </Button>
  );
}

export function GoogleButton() {
  const t = useTranslations('auth.common');
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outlined"
      fullWidth
      disabled={loading}
      onClick={() => {
        setLoading(true);
        void signIn('google', { redirectTo: '/dashboard' });
      }}
      startIcon={
        loading ? (
          <Spinner />
        ) : (
          <Box
            aria-hidden
            sx={{
              width: 16,
              height: 16,
              borderRadius: '999px',
              background:
                'conic-gradient(from -60deg, oklch(0.62 0.18 28) 0 25%, oklch(0.66 0.14 85) 25% 50%, oklch(0.55 0.14 145) 50% 75%, oklch(0.55 0.16 250) 75% 100%)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: '30%',
                bgcolor: 'background.paper',
                borderRadius: '999px',
              },
            }}
          />
        )
      }
      sx={{ ...ghostSx, height: 46, bgcolor: 'background.paper' }}
    >
      {loading ? t('googleLoading') : t('google')}
    </Button>
  );
}
