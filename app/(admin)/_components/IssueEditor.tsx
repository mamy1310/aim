'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import {
  deleteIssueAction,
  sendIssueAction,
  updateIssueAction,
} from '@/lib/admin/newsletter-actions';

import { ghostSx } from '../../_components/styles';

export default function IssueEditor({
  issueId,
  initial,
  readOnly,
}: {
  issueId: string;
  initial: { subject: string; intro: string };
  readOnly: boolean;
}) {
  const t = useTranslations('admin.newsletter.issue');
  const te = useTranslations('admin.errors');
  const router = useRouter();

  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  function report(result: { ok: boolean; error?: string }, successLabel: string) {
    if (!result.ok) {
      setError(true);
      setMessage(te(result.error ?? 'unexpected'));
      return false;
    }
    setError(false);
    setMessage(successLabel);
    router.refresh();
    return true;
  }

  if (readOnly) {
    return (
      <Box sx={{ display: 'grid', gap: 1 }}>
        {message ? (
          <Box
            role="status"
            sx={{ fontSize: '14px', color: error ? 'error.main' : 'success.main' }}
          >
            {message}
          </Box>
        ) : null}
        <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>{t('alreadySent')}</Box>
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        const result = await updateIssueAction(issueId, values);
        setPending(false);
        report(result, t('saved'));
      }}
      sx={{ display: 'grid', gap: 2, maxWidth: 640 }}
    >
      <TextField
        label={t('subjectField')}
        size="small"
        value={values.subject}
        onChange={(event) => setValues({ ...values, subject: event.target.value })}
        required
      />
      <TextField
        label={t('intro')}
        size="small"
        multiline
        minRows={4}
        value={values.intro}
        onChange={(event) => setValues({ ...values, intro: event.target.value })}
      />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button type="submit" variant="outlined" size="small" sx={ghostSx} disabled={pending}>
          {t('save')}
        </Button>
        <Button
          type="button"
          variant="contained"
          size="small"
          disabled={pending}
          onClick={async () => {
            if (!window.confirm(t('sendConfirm'))) return;
            setPending(true);
            const result = await sendIssueAction(issueId);
            setPending(false);
            report(result, t('sent'));
          }}
        >
          {t('send')}
        </Button>
        <Button
          type="button"
          size="small"
          sx={{ color: 'error.main' }}
          onClick={async () => {
            if (!window.confirm(t('deleteConfirm'))) return;
            await deleteIssueAction(issueId);
          }}
        >
          {t('delete')}
        </Button>
        <Box role="status" sx={{ fontSize: '14px', color: error ? 'error.main' : 'success.main' }}>
          {message}
        </Box>
      </Box>
    </Box>
  );
}
