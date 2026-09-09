import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';
import { levelKey } from '@/lib/levels';

import { mono, serif } from '../../../_components/styles';

export default async function AdminCoursesPage() {
  const t = await getTranslations('admin.courses');
  const tc = await getTranslations('common');

  const courses = await prisma.course.findMany({
    orderBy: [{ level: 'asc' }, { order: 'asc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      level: true,
      published: true,
      _count: { select: { lessons: true } },
    },
  });

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 2,
          mb: 3,
        }}
      >
        <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500 }}>
          {t('title')}
        </Typography>
        <Button href="/admin/courses/new" variant="contained" size="small">
          {t('new')}
        </Button>
      </Box>

      {courses.length === 0 ? (
        <Typography sx={{ color: 'text.secondary' }}>{t('empty')}</Typography>
      ) : (
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {courses.map((course, index) => (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}`}
              underline="none"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr auto', sm: 'auto 1fr auto auto' },
                gap: 2,
                alignItems: 'center',
                p: '14px 18px',
                color: 'text.primary',
                borderBottom: index < courses.length - 1 ? '1px solid' : 'none',
                borderColor: 'dividerSoft',
                '&:hover': { bgcolor: 'background.sunk' },
              }}
            >
              <Box
                component="span"
                sx={{
                  ...mono,
                  fontSize: '10.5px',
                  color: 'text.disabled',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {tc(levelKey(course.level))}
              </Box>
              <Box component="span" sx={{ fontSize: '15px' }}>
                {course.title}
              </Box>
              <Box component="span" sx={{ ...mono, fontSize: '10.5px', color: 'text.disabled' }}>
                {t('lessons', { count: course._count.lessons })}
              </Box>
              <Box
                component="span"
                sx={{
                  ...mono,
                  fontSize: '10.5px',
                  color: course.published ? 'success.main' : 'text.disabled',
                }}
              >
                {course.published ? t('published') : t('draft')}
              </Box>
            </Link>
          ))}
        </Box>
      )}
    </>
  );
}
