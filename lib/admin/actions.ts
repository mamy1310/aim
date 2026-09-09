'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { courseSchema, lessonSchema, quizSchema } from '@/lib/admin/schemas';

export type AdminResult = { ok: true } | { ok: false; error: string };

export async function saveCourseAction(courseId: string | null, input: unknown) {
  await requireAdmin();

  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: 'invalid_input' };

  const conflict = await prisma.course.findUnique({ where: { slug: parsed.data.slug } });
  if (conflict && conflict.id !== courseId) return { ok: false as const, error: 'slug_taken' };

  const course = courseId
    ? await prisma.course.update({ where: { id: courseId }, data: parsed.data })
    : await prisma.course.create({ data: parsed.data });

  revalidatePath('/admin/courses');
  revalidatePath('/cours');
  if (courseId) return { ok: true as const };
  redirect(`/admin/courses/${course.id}`);
}

export async function deleteCourseAction(courseId: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath('/admin/courses');
  revalidatePath('/cours');
  return { ok: true };
}

export async function saveLessonAction(
  courseId: string,
  lessonId: string | null,
  input: unknown,
): Promise<AdminResult> {
  await requireAdmin();

  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  if (lessonId) {
    await prisma.lesson.update({ where: { id: lessonId }, data: parsed.data });
  } else {
    await prisma.lesson.create({ data: { ...parsed.data, courseId } });
  }

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/cours');
  return { ok: true };
}

export async function deleteLessonAction(courseId: string, lessonId: string): Promise<AdminResult> {
  await requireAdmin();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/admin/courses/${courseId}`);
  return { ok: true };
}

export async function saveQuizAction(courseId: string, input: unknown): Promise<AdminResult> {
  await requireAdmin();

  const parsed = quizSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const quiz = await prisma.quiz.upsert({
    where: { courseId },
    update: { passScore: parsed.data.passScore },
    create: { courseId, passScore: parsed.data.passScore },
    select: { id: true },
  });

  const keptIds = parsed.data.questions.map((question) => question.id).filter(Boolean) as string[];
  await prisma.question.deleteMany({
    where: { quizId: quiz.id, id: { notIn: keptIds.length > 0 ? keptIds : ['aucun'] } },
  });

  for (const [index, question] of parsed.data.questions.entries()) {
    const data = {
      text: question.text,
      explanation: question.explanation,
      options: question.options,
      order: index + 1,
    };

    if (question.id) {
      await prisma.question.update({ where: { id: question.id }, data });
    } else {
      await prisma.question.create({ data: { ...data, quizId: quiz.id } });
    }
  }

  revalidatePath(`/admin/courses/${courseId}/quiz/edit`);
  return { ok: true };
}
