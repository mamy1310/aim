import { describe, expect, it } from 'vitest';

import { courseSchema, lessonSchema, quizSchema } from '@/lib/admin/schemas';

const course = {
  slug: 'comprendre-l-ia',
  title: 'Comprendre l IA',
  description: 'Une description suffisamment longue pour passer la validation.',
  level: 1,
  order: 1,
  published: true,
  aiAssisted: false,
};

describe('courseSchema', () => {
  it('accepte un cours complet', () => {
    expect(courseSchema.safeParse(course).success).toBe(true);
  });

  it('refuse un identifiant qui n est pas en kebab-case', () => {
    expect(courseSchema.safeParse({ ...course, slug: 'Comprendre IA' }).success).toBe(false);
  });

  it('refuse un niveau inferieur a un', () => {
    expect(courseSchema.safeParse({ ...course, level: 0 }).success).toBe(false);
  });

  it('refuse une description de plus de trois cents caracteres', () => {
    expect(courseSchema.safeParse({ ...course, description: 'a'.repeat(301) }).success).toBe(false);
  });

  it('convertit les nombres transmis en chaine', () => {
    const parsed = courseSchema.parse({ ...course, level: '2', order: '3' });
    expect(parsed.level).toBe(2);
    expect(parsed.order).toBe(3);
  });
});

describe('lessonSchema', () => {
  it('accepte une duree absente', () => {
    const parsed = lessonSchema.parse({
      title: 'Une lecon',
      contentMd: '# Titre',
      order: 1,
      estimatedMinutes: null,
      aiAssisted: false,
    });
    expect(parsed.estimatedMinutes).toBeNull();
  });

  it('refuse un contenu vide', () => {
    expect(
      lessonSchema.safeParse({
        title: 'Une lecon',
        contentMd: '   ',
        order: 1,
        estimatedMinutes: null,
        aiAssisted: false,
      }).success,
    ).toBe(false);
  });
});

describe('quizSchema', () => {
  const question = {
    text: 'Une question ?',
    explanation: null,
    options: [
      { label: 'Bonne', isCorrect: true },
      { label: 'Mauvaise', isCorrect: false },
    ],
  };

  it('accepte un quiz valide', () => {
    expect(quizSchema.safeParse({ passScore: 70, questions: [question] }).success).toBe(true);
  });

  it('exige exactement une bonne reponse', () => {
    const twoCorrect = {
      ...question,
      options: [
        { label: 'Bonne', isCorrect: true },
        { label: 'Aussi bonne', isCorrect: true },
      ],
    };
    expect(quizSchema.safeParse({ passScore: 70, questions: [twoCorrect] }).success).toBe(false);

    const noneCorrect = {
      ...question,
      options: [
        { label: 'Une', isCorrect: false },
        { label: 'Deux', isCorrect: false },
      ],
    };
    expect(quizSchema.safeParse({ passScore: 70, questions: [noneCorrect] }).success).toBe(false);
  });

  it('exige au moins deux reponses et au moins une question', () => {
    expect(
      quizSchema.safeParse({
        passScore: 70,
        questions: [{ ...question, options: [{ label: 'Seule', isCorrect: true }] }],
      }).success,
    ).toBe(false);
    expect(quizSchema.safeParse({ passScore: 70, questions: [] }).success).toBe(false);
  });

  it('refuse un seuil hors bornes', () => {
    expect(quizSchema.safeParse({ passScore: 140, questions: [question] }).success).toBe(false);
  });
});
