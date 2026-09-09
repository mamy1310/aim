import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { getSessionUser } from '@/lib/auth/guards';
import { listPublishedCourses } from '@/lib/courses/service';
import { levelKey } from '@/lib/levels';

import { container, ghostSx, mono, serif } from '../../_components/styles';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('courses.meta');
  return { title: t('title'), description: t('description') };
}

export default async function CoursesPage() {
  const t = await getTranslations('courses');
  const tc = await getTranslations('common');
  const user = await getSessionUser();
  const courses = await listPublishedCourses(user?.id);

  const levels = [...new Set(courses.map((course) => course.level))].sort((a, b) => a - b);

  return (
    <Box component="main" sx={{ ...container, pt: { xs: 6, md: 9 }, pb: { xs: 8, md: 12 } }}>
      <Box sx={{ maxWidth: '62ch', mb: { xs: 5, md: 7 } }}>
        <Box
          component="span"
          sx={{ ...mono, fontSize: '11px', letterSpacing: '0.08em', color: 'text.disabled' }}
        >
          {t('kicker')}
        </Box>
        <Typography
          component="h1"
          sx={{
            ...serif,
            mt: 1.5,
            mb: 1.5,
            fontWeight: 500,
            fontSize: 'clamp(2rem, 5.5vw, 2.875rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </Typography>
        <Typography sx={{ fontSize: '16.5px', color: 'text.secondary' }}>{t('lede')}</Typography>
      </Box>

      {courses.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>{t('empty')}</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: { xs: 5, md: 7 } }}>
          {levels.map((level) => (
            <Box key={level} component="section">
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
                {tc(levelKey(level))}
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                }}
              >
                {courses
                  .filter((course) => course.level === level)
                  .map((course) => (
                    <Box
                      key={course.slug}
                      component="article"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                        p: '20px',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '14px',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography
                        component="h3"
                        sx={{ ...serif, fontSize: '20px', fontWeight: 500, lineHeight: 1.2 }}
                      >
                        {course.title}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: 'text.secondary', flexGrow: 1 }}>
                        {course.description}
                      </Typography>
                      <Box
                        sx={{
                          ...mono,
                          fontSize: '11px',
                          letterSpacing: '0.05em',
                          color: 'text.disabled',
                        }}
                      >
                        {t('lessonCount', { count: course.lessonCount })}
                        {user ? ` · ${t('progress', { progress: course.progress })}` : ''}
                      </Box>
                      <Button
                        href={`/cours/${course.slug}`}
                        variant="outlined"
                        size="small"
                        sx={{ ...ghostSx, alignSelf: 'flex-start', mt: 0.5 }}
                      >
                        {course.progress === 0
                          ? t('start')
                          : course.progress === 100
                            ? t('review')
                            : t('resume')}
                      </Button>
                    </Box>
                  ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
