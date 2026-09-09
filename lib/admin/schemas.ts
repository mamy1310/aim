import { z } from 'zod';

export const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug_kebab_case'),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(300),
  level: z.coerce.number().int().min(1),
  order: z.coerce.number().int().min(1),
  published: z.boolean(),
  aiAssisted: z.boolean(),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(3).max(160),
  contentMd: z.string().trim().min(1),
  order: z.coerce.number().int().min(1),
  estimatedMinutes: z.coerce.number().int().min(1).max(600).nullable(),
  aiAssisted: z.boolean(),
});

export const quizSchema = z.object({
  passScore: z.coerce.number().int().min(0).max(100),
  questions: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string().trim().min(3),
        explanation: z.string().trim().max(600).nullable(),
        options: z
          .array(z.object({ label: z.string().trim().min(1), isCorrect: z.boolean() }))
          .min(2)
          .max(6)
          .refine((options) => options.filter((option) => option.isCorrect).length === 1, {
            message: 'exactly_one_correct_option',
          }),
      }),
    )
    .min(1),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
