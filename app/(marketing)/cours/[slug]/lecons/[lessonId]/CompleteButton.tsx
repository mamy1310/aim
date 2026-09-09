'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function CompleteButton({
  lessonId,
  completed,
  state,
}: {
  lessonId: string;
  completed: boolean;
  state: 'ready' | 'anonymous' | 'unverified';
}) {
  const t = useTranslations('courses.lesson');
  const router = useRouter();
  const [done, setDone] = useState(completed);
  const [pending, setPending] = useState(false);

  if (state !== 'ready') {
    return (
      <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
        {state === 'anonymous' ? t('loginToTrack') : t('verifyToTrack')}
      </Box>
    );
  }

  return (
    <Button
      variant={done ? 'outlined' : 'contained'}
      size="small"
      disabled={done || pending}
      onClick={async () => {
        setPending(true);
        const response = await fetch(`/api/lessons/${lessonId}/complete`, { method: 'POST' });
        setPending(false);
        if (!response.ok) return;
        setDone(true);
        router.refresh();
      }}
    >
      {done ? t('marked') : t('markRead')}
    </Button>
  );
}
