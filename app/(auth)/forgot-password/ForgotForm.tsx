'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { forgotPasswordAction } from '@/lib/auth/actions';

import { MailIcon } from '../../_components/icons';
import { mono, serif } from '../../_components/styles';
import { Field } from '../_components/fields';
import { AuthSubmit } from '../_components/buttons';
import AuthHead from '../_components/AuthHead';
import { inlineLinkSx } from '../_components/swap';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotForm() {
  const t = useTranslations('auth.forgot');
  const tc = useTranslations('auth.common');

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resendLabel, setResendLabel] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('emailInvalid'));
      return;
    }
    setLoading(true);
    await forgotPasswordAction({ email: email.trim() });
    setLoading(false);
    setSentEmail(email.trim());
    setSent(true);
  }

  async function resend() {
    setResendLabel(t('resending'));
    await forgotPasswordAction({ email: sentEmail });
    setResendLabel(t('resent'));
    setTimeout(() => setResendLabel(''), 2200);
  }

  if (sent) {
    return (
      <>
        <AuthHead route="/forgot-password" title={t('title')} subtitle={t('subtitle')} />
        <Box
          sx={{
            display: 'grid',
            gap: 2.25,
            justifyItems: 'center',
            textAlign: 'center',
            p: '28px 22px',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 56,
              height: 56,
              borderRadius: '999px',
              bgcolor: 'success.light',
              color: 'success.main',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            <MailIcon />
          </Box>
          <Typography
            component="h2"
            sx={{ ...serif, fontWeight: 500, fontSize: '22px', lineHeight: 1.2 }}
          >
            {t('sentTitle')}
          </Typography>
          <Typography sx={{ fontSize: '14.5px', color: 'text.secondary', maxWidth: '38ch' }}>
            {t('sentBody')}
          </Typography>
          <Box
            component="span"
            sx={{
              ...mono,
              textTransform: 'none',
              fontSize: '13.5px',
              color: 'text.primary',
              p: '6px 10px',
              bgcolor: 'background.sunk',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: 'dividerSoft',
            }}
          >
            {sentEmail}
          </Box>
          <Box
            sx={{
              width: '100%',
              mt: 0.75,
              pt: 1.75,
              borderTop: '1px solid',
              borderColor: 'dividerSoft',
              fontSize: '13px',
              color: 'text.disabled',
              '& a': inlineLinkSx,
            }}
          >
            {t.rich('resendPrompt', {
              link: (chunks) => (
                <Box
                  component="a"
                  role="button"
                  tabIndex={0}
                  onClick={resend}
                  sx={{ ...inlineLinkSx, cursor: 'pointer' }}
                >
                  {resendLabel || chunks}
                </Box>
              ),
            })}
            <br />
            <Link href="/login" underline="none" sx={inlineLinkSx}>
              {t('back')}
            </Link>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <AuthHead route="/forgot-password" title={t('title')} subtitle={t('subtitle')} />
      <Box component="form" onSubmit={submit} noValidate sx={{ display: 'grid', gap: 2 }}>
        <Field
          label={tc('email')}
          type="email"
          autoComplete="email"
          placeholder={tc('emailPlaceholder')}
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError('');
          }}
          error={!!error}
          message={error}
          messageError
        />
        <AuthSubmit label={t('submit')} loadingLabel={t('submitLoading')} loading={loading} />
      </Box>
      <Box sx={{ textAlign: 'center', fontSize: '14px', '& a': inlineLinkSx }}>
        <Link href="/login" underline="none" sx={inlineLinkSx}>
          {t('back')}
        </Link>
      </Box>
    </>
  );
}
