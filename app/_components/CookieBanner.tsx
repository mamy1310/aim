'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';

import { ghostSx } from './styles';

const STORAGE_KEY = 'aim-cookies';

function readChoice(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Stockage indisponible : on n'affiche pas une banniere qu'on ne saurait pas memoriser.
    return 'necessary';
  }
}

// Le rendu serveur ne connait pas le choix : il considere la banniere deja traitee,
// ce qui evite tout ecart d'hydratation.
const noopSubscribe = () => () => {};

export default function CookieBanner() {
  const t = useTranslations('cookies');
  const storedChoice = useSyncExternalStore(noopSubscribe, readChoice, () => 'necessary');
  const [dismissed, setDismissed] = useState(false);

  function choose(value: 'all' | 'necessary') {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Rien a faire : le choix ne sera pas memorise.
    }
    setDismissed(true);
  }

  if (storedChoice || dismissed) return null;

  return (
    <Box
      role="dialog"
      aria-label={t('title')}
      sx={{
        position: 'fixed',
        zIndex: 20,
        bottom: { xs: 12, md: 20 },
        left: { xs: 12, md: 20 },
        right: { xs: 12, md: 'auto' },
        maxWidth: 420,
        p: '16px 18px',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '14px',
        bgcolor: 'background.paper',
        boxShadow: 'var(--mui-palette-elevation3)',
        display: 'grid',
        gap: 1.5,
      }}
    >
      <Box sx={{ fontSize: '14px', fontWeight: 600 }}>{t('title')}</Box>
      <Box sx={{ fontSize: '13.5px', color: 'text.secondary', lineHeight: 1.5 }}>{t('body')}</Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button size="small" variant="contained" onClick={() => choose('all')}>
          {t('accept')}
        </Button>
        <Button size="small" variant="outlined" sx={ghostSx} onClick={() => choose('necessary')}>
          {t('refuse')}
        </Button>
        <Link
          href="/cookies"
          underline="none"
          sx={{ fontSize: '13px', color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          {t('more')}
        </Link>
      </Box>
    </Box>
  );
}
