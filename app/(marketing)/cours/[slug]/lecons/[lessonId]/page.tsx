import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { getSessionUser } from '@/lib/auth/guards';
import { getLessonDetail } from '@/lib/courses/service';

import { mono, serif } from '../../../../../_components/styles';
import CompleteButton from './CompleteButton';
import LessonBody from './LessonBody';

type Props = { params: Promise<{ slug: string; lessonId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const lesson = await getLessonDetail(slug, lessonId);
  return lesson ? { title: `${lesson.title} — ${lesson.course.title}` } : {};
}

export default async function LessonPage({ params }: Props) {
  const { slug, lessonId } = await params;
  const t = await getTranslations('courses.lesson');
  const user = await getSessionUser();
  const lesson = await getLessonDetail(slug, lessonId, user?.id);

  if (!lesson) notFound();

  const total = lesson.course.lessons.length;

  return (
    <Box
      component="main"
      sx={{
        width: '100%',
        maxWidth: '760px',
        mx: 'auto',
        px: { xs: '20px', md: '32px' },
        pt: { xs: 5, md: 8 },
        pb: { xs: 8, md: 12 },
      }}
    >
      <Box sx={{ ...mono, fontSize: '11px', letterSpacing: '0.07em', color: 'text.disabled' }}>
        <Link href={`/cours/${lesson.course.slug}`} underline="none" sx={{ color: 'inherit' }}>
          {lesson.course.title}
        </Link>
        {' / '}
        {t('position', { index: lesson.order, total })}
      </Box>

      <Typography
        component="h1"
        sx={{
          ...serif,
          mt: 2,
          mb: 3,
          fontWeight: 500,
          fontSize: 'clamp(1.75rem, 5vw, 2.375rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        {lesson.title}
      </Typography>

      <LessonBody contentMd={lesson.contentMd} />

      <Box
        sx={{
          mt: 5,
          pt: 3,
          borderTop: '1px solid',
          borderColor: 'dividerSoft',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CompleteButton
          lessonId={lesson.id}
          completed={lesson.completed}
          state={!user ? 'anonymous' : user.emailVerified ? 'ready' : 'unverified'}
        />
        <Box sx={{ display: 'flex', gap: 2.5, fontSize: '14px' }}>
          {lesson.previous ? (
            <Link
              href={`/cours/${lesson.course.slug}/lecons/${lesson.previous.id}`}
              underline="none"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {t('previous')}
            </Link>
          ) : null}
          {lesson.next ? (
            <Link
              href={`/cours/${lesson.course.slug}/lecons/${lesson.next.id}`}
              underline="none"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {t('next')}
            </Link>
          ) : (
            <Link
              href={`/cours/${lesson.course.slug}`}
              underline="none"
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {t('backToCourse')}
            </Link>
          )}
        </Box>
      </Box>
    </Box>
  );
}
