'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { postJson } from '@/lib/client-action';

import { ghostSx } from '../../../_components/styles';

export default function BillingActions({ hasCustomer }: { hasCustomer: boolean }) {
  const t = useTranslations('account.billing');
  const tn = useTranslations('newsletter');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function go(endpoint: string) {
    setPending(true);
    setError('');
    const response = await postJson<{ url?: string }>(endpoint);

    if (!response.ok || !response.data.url) {
      setPending(false);
      setError(tn('error'));
      return;
    }
    window.location.href = response.data.url;
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button
        variant="contained"
        size="small"
        disabled={pending}
        onClick={() => go('/api/stripe/checkout')}
      >
        {t('subscribe')}
      </Button>
      {hasCustomer ? (
        <Button
          variant="outlined"
          size="small"
          sx={ghostSx}
          disabled={pending}
          onClick={() => go('/api/stripe/portal')}
        >
          {t('manage')}
        </Button>
      ) : null}
      <Box sx={{ fontSize: '14px', color: 'error.main' }}>{error}</Box>
    </Box>
  );
}
