import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { getSessionUser } from '@/lib/auth/guards';
import { getCourseDetail } from '@/lib/courses/service';
import { levelKey } from '@/lib/levels';

import { container, ghostSx, mono, serif } from '../../../_components/styles';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseDetail(slug);
  if (!course) return {};
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations('courses');
  const tc = await getTranslations('common');
  const user = await getSessionUser();
  const course = await getCourseDetail(slug, user?.id);

  if (!course) notFound();

  const completed = new Set(course.completedLessonIds);

  return (
    <Box component="main" sx={{ ...container, pt: { xs: 5, md: 8 }, pb: { xs: 8, md: 12 } }}>
      <Box sx={{ ...mono, fontSize: '11px', letterSpacing: '0.07em', color: 'text.disabled' }}>
        <Link href="/cours" underline="none" sx={{ color: 'inherit' }}>
          {t('detail.backToCourses')}
        </Link>
        {' / '}
        {tc(levelKey(course.level))}
      </Box>

      <Typography
        component="h1"
        sx={{
          ...serif,
          mt: 2,
          mb: 1.5,
          fontWeight: 500,
          fontSize: 'clamp(2rem, 5.5vw, 2.75rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
        }}
      >
        {course.title}
      </Typography>
      <Typography sx={{ fontSize: '16.5px', color: 'text.secondary', maxWidth: '62ch' }}>
        {course.description}
      </Typography>
      <Box
        sx={{ ...mono, mt: 2, fontSize: '11px', letterSpacing: '0.05em', color: 'text.disabled' }}
      >
        {course.aiAssisted ? t('aiAssisted') : t('handWritten')}
        {user ? ` · ${t('progress', { progress: course.progress })}` : ''}
      </Box>

      <Box component="section" sx={{ mt: { xs: 5, md: 7 } }}>
        <Box
          component="h2"
          sx={{
            ...mono,
            fontSize: '11.5px',
            letterSpacing: '0.08em',
            color: 'text.disabled',
            mb: 2,
          }}
        >
          {t('detail.lessons')}
        </Box>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {course.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/cours/${course.slug}/lecons/${lesson.id}`}
              underline="none"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: 2,
                p: '14px 18px',
                color: 'text.primary',
                borderBottom: index < course.lessons.length - 1 ? '1px solid' : 'none',
                borderColor: 'dividerSoft',
                '&:hover': { bgcolor: 'background.sunk' },
              }}
            >
              <Box
                component="span"
                sx={{ ...mono, fontSize: '11.5px', color: 'text.disabled', minWidth: 22 }}
              >
                {String(lesson.order).padStart(2, '0')}
              </Box>
              <Box component="span" sx={{ fontSize: '15px' }}>
                {lesson.title}
              </Box>
              <Box
                component="span"
                sx={{ ...mono, fontSize: '11px', color: 'text.disabled', whiteSpace: 'nowrap' }}
              >
                {completed.has(lesson.id)
                  ? t('detail.completed')
                  : lesson.estimatedMinutes
                    ? t('detail.minutes', { count: lesson.estimatedMinutes })
                    : ''}
              </Box>
            </Link>
          ))}
        </Box>
      </Box>

      {course.quiz ? (
        <Box
          component="section"
          sx={{
            mt: 3,
            p: '20px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '14px',
            bgcolor: 'background.paper',
            display: 'grid',
            gap: 1.25,
          }}
        >
          <Typography component="h2" sx={{ ...serif, fontSize: '20px', fontWeight: 500 }}>
            {t('detail.quizTitle')}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
            {course.quizPassed
              ? t('detail.quizPassed')
              : course.allLessonsCompleted
                ? t('detail.quizOpen')
                : t('detail.quizLocked')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.5 }}>
            <Button
              href={`/cours/${course.slug}/quiz`}
              variant="contained"
              size="small"
              disabled={!course.allLessonsCompleted}
            >
              {t('detail.quizStart')}
            </Button>
            {course.badgeToken ? (
              <Button
                href={`/badge/${course.badgeToken}`}
                variant="outlined"
                size="small"
                sx={ghostSx}
              >
                {t('detail.badgeView')}
              </Button>
            ) : null}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
