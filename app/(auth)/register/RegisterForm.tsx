'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Checkbox from '@mui/material/Checkbox';

import { registerAction } from '@/lib/auth/actions';
import { runAction } from '@/lib/client-action';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/schemas';

import { Field, PasswordField, PasswordStrength, OrDivider } from '../_components/fields';
import { AuthSubmit, GoogleButton } from '../_components/buttons';
import SwapLink, { inlineLinkSx } from '../_components/swap';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const t = useTranslations('auth.register');
  const tc = useTranslations('auth.common');
  const ts = useTranslations('auth.strength');
  const te = useTranslations('auth.errors');
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: boolean;
    confirm?: string;
    terms?: boolean;
  }>({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = t('firstNameRequired');
    if (!lastName.trim()) next.lastName = t('lastNameRequired');
    if (!EMAIL_RE.test(email.trim())) next.email = t('emailInvalid');
    if (password.length < PASSWORD_MIN_LENGTH || !/[a-zA-Z]/.test(password) || !/\d/.test(password))
      next.password = true;
    if (!confirm) next.confirm = t('confirmRequired');
    else if (confirm !== password) next.confirm = t('confirmMismatch');
    if (!terms) next.terms = true;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setBanner('');
    const result = await runAction(() =>
      registerAction({
        name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        password,
      }),
    );

    if (result.ok) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    setLoading(false);
    setBanner(te(result.error));
    if (result.error === 'email_taken') setErrors({ email: te('email_taken') });
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
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <Field
          label={t('firstName')}
          autoComplete="given-name"
          placeholder={t('firstNamePlaceholder')}
          value={firstName}
          onChange={(v) => {
            setFirstName(v);
            setErrors((e) => ({ ...e, firstName: undefined }));
          }}
          error={!!errors.firstName}
          message={errors.firstName}
          messageError
        />
        <Field
          label={t('lastName')}
          autoComplete="family-name"
          placeholder={t('lastNamePlaceholder')}
          value={lastName}
          onChange={(v) => {
            setLastName(v);
            setErrors((e) => ({ ...e, lastName: undefined }));
          }}
          error={!!errors.lastName}
          message={errors.lastName}
          messageError
        />
      </Box>
      <Box sx={{ fontSize: '13px', color: 'text.disabled', mt: -1 }}>{t('namesHint')}</Box>

      <Field
        label={tc('email')}
        type="email"
        autoComplete="email"
        placeholder={tc('emailPlaceholder')}
        value={email}
        onChange={(v) => {
          setEmail(v);
          setErrors((e) => ({ ...e, email: undefined }));
        }}
        error={!!errors.email}
        message={errors.email}
        messageError
      />

      <PasswordField
        label={t('password')}
        autoComplete="new-password"
        placeholder={t('passwordPlaceholder')}
        value={password}
        onChange={(v) => {
          setPassword(v);
          setErrors((e) => ({
            ...e,
            password: undefined,
            confirm: confirm && confirm === v ? undefined : e.confirm,
          }));
        }}
        error={errors.password}
      >
        <PasswordStrength value={password} hint={ts('hint')} />
      </PasswordField>

      <PasswordField
        label={t('confirm')}
        autoComplete="new-password"
        placeholder={t('confirmPlaceholder')}
        value={confirm}
        onChange={(v) => {
          setConfirm(v);
          setErrors((e) => ({ ...e, confirm: undefined }));
        }}
        error={!!errors.confirm}
        message={errors.confirm}
        messageError
      />

      <Box
        component="label"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 1.25,
          alignItems: 'start',
          cursor: 'pointer',
          fontSize: '13.5px',
          color: 'text.secondary',
          lineHeight: 1.45,
          '& a': {
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:hover': { borderColor: 'text.disabled' },
          },
        }}
      >
        <Checkbox
          checked={terms}
          onChange={(e) => {
            setTerms(e.target.checked);
            setErrors((prev) => ({ ...prev, terms: undefined }));
          }}
          size="small"
          disableRipple
          sx={{
            p: 0,
            mt: '1px',
            color: errors.terms ? 'error.main' : 'divider',
            '&.Mui-checked': { color: 'primary.main' },
          }}
        />
        <Box component="span">
          {t.rich('terms', {
            cgv: (chunks) => (
              <Link href="/cgv" underline="none">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/confidentialite" underline="none">
                {chunks}
              </Link>
            ),
          })}
        </Box>
      </Box>

      <AuthSubmit label={t('submit')} loadingLabel={t('submitLoading')} loading={loading} />

      {googleEnabled ? (
        <>
          <OrDivider />
          <GoogleButton />
        </>
      ) : null}

      <SwapLink>
        {t.rich('swap', {
          link: (chunks) => (
            <Link href="/login" underline="none" sx={inlineLinkSx}>
              {chunks}
            </Link>
          ),
        })}
      </SwapLink>
    </Box>
  );
}
