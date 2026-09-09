import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { deleteLessonAction } from '@/lib/admin/actions';
import { prisma } from '@/lib/db';

import DeleteButton from '../../../../../../_components/DeleteButton';
import LessonEditor from '../../../../../../_components/LessonEditor';
import { serif } from '../../../../../../../_components/styles';

type Props = { params: Promise<{ id: string; lessonId: string }> };

export default async function LessonEditPage({ params }: Props) {
  const { id, lessonId } = await params;
  const t = await getTranslations('admin.lesson');

  const isNew = lessonId === 'new';
  const lesson = isNew ? null : await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!isNew && (!lesson || lesson.courseId !== id)) notFound();

  const nextOrder = isNew ? (await prisma.lesson.count({ where: { courseId: id } })) + 1 : 1;

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
          {isNew ? t('newTitle') : t('editTitle')}
        </Typography>
        {lesson ? (
          <DeleteButton
            label={t('delete')}
            confirmLabel={t('deleteConfirm')}
            onDelete={deleteLessonAction.bind(null, id, lesson.id)}
            redirectTo={`/admin/courses/${id}`}
          />
        ) : null}
      </Box>

      <LessonEditor
        courseId={id}
        lessonId={lesson?.id ?? null}
        initial={{
          title: lesson?.title ?? '',
          contentMd: lesson?.contentMd ?? '',
          order: lesson?.order ?? nextOrder,
          estimatedMinutes: lesson?.estimatedMinutes ?? null,
          aiAssisted: lesson?.aiAssisted ?? false,
        }}
      />
    </>
  );
}
