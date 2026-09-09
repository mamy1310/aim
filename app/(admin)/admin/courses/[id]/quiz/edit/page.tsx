import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Typography from '@mui/material/Typography';

import { prisma } from '@/lib/db';
import { parseOptions } from '@/lib/courses/service';

import QuizEditor from '../../../../../_components/QuizEditor';
import { serif } from '../../../../../../_components/styles';

type Props = { params: Promise<{ id: string }> };

export default async function QuizEditPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('admin.quiz');

  const course = await prisma.course.findUnique({
    where: { id },
    select: {
      title: true,
      quiz: {
        select: {
          passScore: true,
          questions: {
            orderBy: { order: 'asc' },
            select: { id: true, text: true, explanation: true, options: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <>
      <Typography component="h1" sx={{ ...serif, fontSize: '28px', fontWeight: 500, mb: 1 }}>
        {t('title')}
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>{course.title}</Typography>

      <QuizEditor
        courseId={id}
        initialPassScore={course.quiz?.passScore ?? 70}
        initialQuestions={(course.quiz?.questions ?? []).map((question) => ({
          id: question.id,
          text: question.text,
          explanation: question.explanation,
          options: parseOptions(question.options),
        }))}
      />
    </>
  );
}
