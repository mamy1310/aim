import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import { deleteCourseAction } from '@/lib/admin/actions';
import { prisma } from '@/lib/db';

import CourseForm from '../../../_components/CourseForm';
import DeleteButton from '../../../_components/DeleteButton';
import { ghostSx, mono, serif } from '../../../../_components/styles';

type Props = { params: Promise<{ id: string }> };

export default async function AdminCoursePage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('admin.course');
  const tl = await getTranslations('admin.courses');

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      quiz: { select: { id: true, _count: { select: { questions: true } } } },
    },
  });

  if (!course) notFound();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          alignItems: 'baseline',
          mb: 3,
        }}
      >
        <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500 }}>
          {t('editTitle')}
        </Typography>
        <DeleteButton
          label={tl('delete')}
          confirmLabel={tl('deleteConfirm')}
          onDelete={deleteCourseAction.bind(null, course.id)}
          redirectTo="/admin/courses"
        />
      </Box>

      <CourseForm
        courseId={course.id}
        initial={{
          slug: course.slug,
          title: course.title,
          description: course.description,
          level: course.level,
          order: course.order,
          published: course.published,
          aiAssisted: course.aiAssisted,
        }}
      />

      <Box component="section" sx={{ mt: 6 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography component="h2" sx={{ ...serif, fontSize: '22px', fontWeight: 500 }}>
            {t('lessonsTitle')}
          </Typography>
          <Button
            href={`/admin/courses/${course.id}/lessons/new/edit`}
            variant="outlined"
            size="small"
            sx={ghostSx}
          >
            {t('addLesson')}
          </Button>
        </Box>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {course.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`}
              underline="none"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: 2,
                alignItems: 'center',
                p: '12px 18px',
                color: 'text.primary',
                borderBottom: index < course.lessons.length - 1 ? '1px solid' : 'none',
                borderColor: 'dividerSoft',
                '&:hover': { bgcolor: 'background.sunk' },
              }}
            >
              <Box component="span" sx={{ ...mono, fontSize: '11px', color: 'text.disabled' }}>
                {String(lesson.order).padStart(2, '0')}
              </Box>
              <Box component="span" sx={{ fontSize: '15px' }}>
                {lesson.title}
              </Box>
            </Link>
          ))}
        </Box>
      </Box>

      <Box component="section" sx={{ mt: 5 }}>
        <Typography component="h2" sx={{ ...serif, fontSize: '22px', fontWeight: 500, mb: 1.5 }}>
          {t('quizTitle')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            href={`/admin/courses/${course.id}/quiz/edit`}
            variant="outlined"
            size="small"
            sx={ghostSx}
          >
            {t('editQuiz')}
          </Button>
          <Box sx={{ fontSize: '14px', color: 'text.secondary' }}>
            {course.quiz ? t('questions', { count: course.quiz._count.questions }) : t('noQuiz')}
          </Box>
        </Box>
      </Box>
    </>
  );
}
