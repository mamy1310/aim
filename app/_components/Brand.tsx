import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import { serif } from './styles';

export default async function Brand() {
  const t = await getTranslations('common');
  return (
    <Link
      href="/"
      aria-label={`${t('appName')}, accueil`}
      underline="none"
      sx={{
        ...serif,
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 1,
        fontSize: '22px',
        fontWeight: 500,
        letterSpacing: '-0.02em',
        color: 'text.primary',
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 10,
          height: 10,
          borderRadius: '2px',
          bgcolor: 'text.primary',
          transform: 'translateY(-2px)',
        }}
      />
      {t('appName')}
    </Link>
  );
}
