'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

import { resetPasswordAction } from '@/lib/auth/actions';
import { runAction } from '@/lib/client-action';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/schemas';

import { PasswordField, PasswordStrength } from '../../_components/fields';
import { AuthSubmit } from '../../_components/buttons';
import { inlineLinkSx } from '../../_components/swap';

export default function ResetForm({ token }: { token: string }) {
  const t = useTranslations('auth.reset');
  const te = useTranslations('auth.errors');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwError, setPwError] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [banner, setBanner] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let ok = true;
    if (
      password.length < PASSWORD_MIN_LENGTH ||
      !/[a-zA-Z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setPwError(true);
      ok = false;
    }
    if (confirm !== password) {
      setConfirmError(t('confirmMismatch'));
      ok = false;
    }
    if (!ok) return;

    setLoading(true);
    setBanner('');
    const result = await runAction(() => resetPasswordAction({ token, password }));

    if (!result.ok) {
      setLoading(false);
      setBanner(te(result.error));
      return;
    }

    setDone(true);
    router.push('/login');
  }

  return (
    <Box component="form" onSubmit={submit} noValidate sx={{ display: 'grid', gap: 2 }}>
      {banner ? (
        <Box
          role="alert"
          sx={{
            p: '12px 14px',
            borderRadius: '10px',
            border: '1px solid',
            borderColor: 'error.main',
            bgcolor: 'error.light',
            color: 'error.main',
            fontSize: '13.5px',
            lineHeight: 1.45,
          }}
        >
          {banner}
        </Box>
      ) : null}
      <PasswordField
        label={t('password')}
        autoComplete="new-password"
        placeholder={t('passwordPlaceholder')}
        value={password}
        onChange={(v) => {
          setPassword(v);
          setPwError(false);
        }}
        error={pwError}
      >
        <PasswordStrength value={password} hint={t('hint')} />
      </PasswordField>

      <PasswordField
        label={t('confirm')}
        autoComplete="new-password"
        placeholder={t('confirmPlaceholder')}
        value={confirm}
        onChange={(v) => {
          setConfirm(v);
          setConfirmError('');
        }}
        error={!!confirmError}
        message={confirmError}
        messageError
      />

      <AuthSubmit
        label={t('submit')}
        loadingLabel={done ? t('submitDone') : t('submitLoading')}
        loading={loading}
      />

      <Box sx={{ textAlign: 'center', fontSize: '14px' }}>
        <Link href="/login" underline="none" sx={inlineLinkSx}>
          {t('back')}
        </Link>
      </Box>
    </Box>
  );
}
