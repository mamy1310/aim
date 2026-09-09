'use client';

import { type ReactNode, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { AlertCircleIcon, EyeIcon, EyeOffIcon } from '../../_components/icons';
import { mono } from '../../_components/styles';

const inputSx = {
  borderRadius: '10px',
  bgcolor: 'background.paper',
  fontSize: '15px',
  '& .MuiOutlinedInput-input': { py: '12px', height: '22px' },
  '& fieldset': { borderColor: 'divider', transition: 'border-color .15s' },
  '&:hover fieldset': { borderColor: 'text.disabled' },
  '&.Mui-focused fieldset': { borderColor: 'text.primary', borderWidth: '1px' },
  '&.Mui-focused': { boxShadow: '0 0 0 4px var(--mui-palette-secondary-light)' },
  '&.Mui-error fieldset': { borderColor: 'error.main' },
  '&.Mui-error.Mui-focused': { boxShadow: '0 0 0 4px var(--mui-palette-error-light)' },
} as const;

const labelSx = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 1.5,
  fontSize: '13.5px',
  fontWeight: 500,
  color: 'text.secondary',
} as const;

type FieldProps = {
  label: string;
  type?: 'text' | 'email';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: boolean;
  message?: string;
  messageError?: boolean;
  labelRight?: ReactNode;
  inputMode?: 'email' | 'text';
  children?: ReactNode;
};

export function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  message,
  messageError,
  labelRight,
  children,
}: FieldProps) {
  const id = useId();
  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      <Box component="label" htmlFor={id} sx={labelSx}>
        <span>{label}</span>
        {labelRight}
      </Box>
      <OutlinedInput
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        error={error}
        fullWidth
        sx={inputSx}
      />
      {children}
      <FieldMessage message={message} error={messageError} />
    </Box>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: boolean;
  message?: string;
  messageError?: boolean;
  labelRight?: ReactNode;
  children?: ReactNode;
};

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  message,
  messageError,
  labelRight,
  children,
}: PasswordFieldProps) {
  const id = useId();
  const t = useTranslations('auth.common');
  const [visible, setVisible] = useState(false);

  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      <Box component="label" htmlFor={id} sx={labelSx}>
        <span>{label}</span>
        {labelRight}
      </Box>
      <OutlinedInput
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        error={error}
        fullWidth
        sx={inputSx}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              type="button"
              edge="end"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? t('hide') : t('show')}
              aria-pressed={visible}
              sx={{
                color: 'text.disabled',
                fontSize: '18px',
                '&:hover': { color: 'text.primary' },
              }}
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </IconButton>
          </InputAdornment>
        }
      />
      {children}
      <FieldMessage message={message} error={messageError} />
    </Box>
  );
}

function FieldMessage({ message, error }: { message?: string; error?: boolean }) {
  if (!message) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.75,
        fontSize: '13px',
        color: error ? 'error.main' : 'text.secondary',
      }}
    >
      {error ? (
        <Box
          component="span"
          aria-hidden
          sx={{ display: 'inline-flex', fontSize: '14px', mt: '2px' }}
        >
          <AlertCircleIcon />
        </Box>
      ) : null}
      <span>{message}</span>
    </Box>
  );
}

export function scoreStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const BAR_COLORS = [
  'var(--mui-palette-warning-main)',
  'oklch(0.65 0.130 75)',
  'oklch(0.62 0.110 130)',
  'var(--mui-palette-success-main)',
];

export function PasswordStrength({ value, hint }: { value: string; hint: string }) {
  const t = useTranslations('auth.strength');
  const levels = t.raw('levels') as string[];
  const level = scoreStrength(value);
  const active = level === 0 ? 'transparent' : BAR_COLORS[level - 1];

  return (
    <Box sx={{ display: 'grid', gap: 0.75, mt: 0.25 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            sx={{
              height: '3px',
              borderRadius: '999px',
              bgcolor: i < level ? active : 'dividerSoft',
              transition: 'background-color .2s',
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          color: 'text.disabled',
        }}
      >
        <span>{hint}</span>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {level === 0 ? '' : levels[level - 1]}
        </Box>
      </Box>
    </Box>
  );
}

export function OrDivider() {
  const t = useTranslations('auth.common');
  return (
    <Box
      sx={{
        ...mono,
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        color: 'text.disabled',
        fontSize: '10.5px',
        letterSpacing: '0.1em',
        '&::before, &::after': {
          content: '""',
          flex: 1,
          height: '1px',
          bgcolor: 'dividerSoft',
        },
      }}
    >
      {t('or')}
    </Box>
  );
}
