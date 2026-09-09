import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { getCourseDetail, parseOptions } from '@/lib/courses/service';
import { shuffleWithSeed } from '@/lib/courses/scoring';

import { container, mono, serif } from '../../../../_components/styles';
import QuizForm from './QuizForm';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('quiz.meta');
  return { title: t('title'), description: t('description') };
}

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations('quiz');
  const user = await requireUser();
  const course = await getCourseDetail(slug, user.id);

  if (!course || !course.quiz) notFound();
  if (!course.allLessonsCompleted) redirect(`/cours/${slug}`);

  const questions = await prisma.question.findMany({
    where: { quizId: course.quiz.id },
    orderBy: { order: 'asc' },
    select: { id: true, text: true, explanation: true, options: true },
  });

  const prepared = questions.map((question) => ({
    id: question.id,
    text: question.text,
    explanation: question.explanation,
    options: shuffleWithSeed(
      parseOptions(question.options).map((option, index) => ({
        label: option.label,
        originalIndex: index,
      })),
      `${user.id}:${question.id}`,
    ),
  }));

  return (
    <Box
      component="main"
      sx={{ ...container, maxWidth: 760, pt: { xs: 5, md: 8 }, pb: { xs: 8, md: 12 } }}
    >
      <Box sx={{ ...mono, fontSize: '11px', letterSpacing: '0.07em', color: 'text.disabled' }}>
        {t('kicker')}
      </Box>
      <Typography
        component="h1"
        sx={{
          ...serif,
          mt: 1.5,
          mb: 1.5,
          fontWeight: 500,
          fontSize: 'clamp(1.75rem, 5vw, 2.375rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        {course.title}
      </Typography>
      <Typography sx={{ fontSize: '16px', color: 'text.secondary', mb: 4 }}>
        {t('intro')}
      </Typography>

      <QuizForm
        quizId={course.quiz.id}
        courseSlug={course.slug}
        passScore={course.quiz.passScore}
        questions={prepared}
      />
    </Box>
  );
}
