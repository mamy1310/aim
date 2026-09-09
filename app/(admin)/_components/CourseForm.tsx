'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';

import { saveCourseAction } from '@/lib/admin/actions';

export type CourseValues = {
  slug: string;
  title: string;
  description: string;
  level: number;
  order: number;
  published: boolean;
  aiAssisted: boolean;
};

export default function CourseForm({
  courseId,
  initial,
}: {
  courseId: string | null;
  initial: CourseValues;
}) {
  const t = useTranslations('admin.course');
  const te = useTranslations('admin.errors');
  const router = useRouter();

  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  function set<K extends keyof CourseValues>(key: K, value: CourseValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Box
      component="form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage('');
        const result = await saveCourseAction(courseId, values);
        setPending(false);
        if (result && !result.ok) {
          setError(true);
          setMessage(te(result.error));
          return;
        }
        setError(false);
        setMessage(t('saved'));
        router.refresh();
      }}
      sx={{ display: 'grid', gap: 2, maxWidth: 640 }}
    >
      <TextField
        label={t('titleField')}
        value={values.title}
        onChange={(event) => set('title', event.target.value)}
        size="small"
        required
      />
      <TextField
        label={t('slug')}
        helperText={t('slugHelp')}
        value={values.slug}
        onChange={(event) => set('slug', event.target.value)}
        size="small"
        required
      />
      <TextField
        label={t('description')}
        helperText={t('descriptionHelp')}
        value={values.description}
        onChange={(event) => set('description', event.target.value)}
        size="small"
        multiline
        minRows={3}
        slotProps={{ htmlInput: { maxLength: 300 } }}
        required
      />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '1fr 1fr' }}>
        <TextField
          label={t('level')}
          type="number"
          value={values.level}
          onChange={(event) => set('level', Number(event.target.value))}
          size="small"
          slotProps={{ htmlInput: { min: 1 } }}
        />
        <TextField
          label={t('order')}
          type="number"
          value={values.order}
          onChange={(event) => set('order', Number(event.target.value))}
          size="small"
          slotProps={{ htmlInput: { min: 1 } }}
        />
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={values.published}
            onChange={(event) => set('published', event.target.checked)}
          />
        }
        label={t('published')}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={values.aiAssisted}
            onChange={(event) => set('aiAssisted', event.target.checked)}
          />
        }
        label={t('aiAssisted')}
      />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button type="submit" variant="contained" size="small" disabled={pending}>
          {t('save')}
        </Button>
        <Box sx={{ fontSize: '14px', color: error ? 'error.main' : 'success.main' }}>{message}</Box>
      </Box>
    </Box>
  );
}
