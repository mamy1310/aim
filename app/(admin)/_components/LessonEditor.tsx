'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';

import { saveLessonAction } from '@/lib/admin/actions';
import { runAction } from '@/lib/client-action';

import LessonBody from '../../(marketing)/cours/[slug]/lecons/[lessonId]/LessonBody';
import { mono } from '../../_components/styles';

export type LessonValues = {
  title: string;
  contentMd: string;
  order: number;
  estimatedMinutes: number | null;
  aiAssisted: boolean;
};

export default function LessonEditor({
  courseId,
  lessonId,
  initial,
}: {
  courseId: string;
  lessonId: string | null;
  initial: LessonValues;
}) {
  const t = useTranslations('admin.lesson');
  const te = useTranslations('admin.errors');
  const router = useRouter();

  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  function set<K extends keyof LessonValues>(key: K, value: LessonValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Box
      component="form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage('');
        const result = await runAction(() => saveLessonAction(courseId, lessonId, values));
        setPending(false);
        if (!result.ok) {
          setError(true);
          setMessage(te(result.error));
          return;
        }
        setError(false);
        setMessage(t('saved'));
        router.push(`/admin/courses/${courseId}`);
        router.refresh();
      }}
      sx={{ display: 'grid', gap: 2 }}
    >
      <TextField
        label={t('titleField')}
        value={values.title}
        onChange={(event) => set('title', event.target.value)}
        size="small"
        required
      />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr', maxWidth: 420 }}>
        <TextField
          label={t('order')}
          type="number"
          value={values.order}
          onChange={(event) => set('order', Number(event.target.value))}
          size="small"
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <TextField
          label={t('minutes')}
          type="number"
          value={values.estimatedMinutes ?? ''}
          onChange={(event) =>
            set('estimatedMinutes', event.target.value === '' ? null : Number(event.target.value))
          }
          size="small"
          slotProps={{ htmlInput: { min: 1 } }}
        />
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={values.aiAssisted}
            onChange={(event) => set('aiAssisted', event.target.checked)}
          />
        }
        label={t('aiAssisted')}
      />

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { md: '1fr 1fr' } }}>
        <TextField
          label={t('content')}
          value={values.contentMd}
          onChange={(event) => set('contentMd', event.target.value)}
          size="small"
          multiline
          minRows={18}
          required
          slotProps={{ htmlInput: { style: { fontFamily: 'var(--font-geist-mono), monospace' } } }}
        />
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            bgcolor: 'background.paper',
            overflowX: 'auto',
          }}
        >
          <Box
            component="span"
            sx={{ ...mono, fontSize: '10.5px', letterSpacing: '0.06em', color: 'text.disabled' }}
          >
            {t('preview')}
          </Box>
          <LessonBody contentMd={values.contentMd} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button type="submit" variant="contained" size="small" disabled={pending}>
          {t('save')}
        </Button>
        <Box sx={{ fontSize: '14px', color: error ? 'error.main' : 'success.main' }}>{message}</Box>
      </Box>
    </Box>
  );
}
