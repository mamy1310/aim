'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { postJson } from '@/lib/client-action';

import { ghostSx } from '../../_components/styles';

export type CtaState = 'anonymous' | 'unverified' | 'ready' | 'subscribed';

export default function NewsletterCta({ state }: { state: CtaState }) {
  const t = useTranslations('newsletter');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (state === 'anonymous') {
    return (
      <Button href="/login" variant="contained" size="large">
        {t('loginFirst')}
      </Button>
    );
  }

  if (state === 'unverified') {
    return <Box sx={{ fontSize: '15px', color: 'text.secondary' }}>{t('verifyFirst')}</Box>;
  }

  if (state === 'subscribed') {
    return (
      <Box sx={{ display: 'grid', gap: 1.5, justifyItems: 'flex-start' }}>
        <Box sx={{ fontSize: '15px', color: 'text.secondary' }}>{t('alreadySubscribed')}</Box>
        <Button href="/account/billing" variant="outlined" size="small" sx={ghostSx}>
          {t('manage')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 1, justifyItems: 'flex-start' }}>
      <Button
        variant="contained"
        size="large"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError('');
          const response = await postJson<{ url?: string }>('/api/stripe/checkout');
          if (!response.ok || !response.data.url) {
            setPending(false);
            setError(t('error'));
            return;
          }
          window.location.href = response.data.url;
        }}
      >
        {pending ? t('ctaLoading') : t('cta')}
      </Button>
      <Box sx={{ fontSize: '14px', color: 'error.main' }}>{error}</Box>
    </Box>
  );
}
