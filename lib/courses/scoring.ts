export type QuizQuestion = {
  id: string;
  options: { label: string; isCorrect: boolean }[];
};

export type QuizAnswer = { questionId: string; optionIndex: number | null };

export type QuizResult = {
  score: number;
  passed: boolean;
  corrections: { questionId: string; correctIndex: number; chosenIndex: number | null }[];
};

export function scoreQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  passScore: number,
): QuizResult {
  const chosenByQuestion = new Map(
    answers.map((answer) => [answer.questionId, answer.optionIndex]),
  );

  const corrections = questions.map((question) => ({
    questionId: question.id,
    correctIndex: question.options.findIndex((option) => option.isCorrect),
    chosenIndex: chosenByQuestion.get(question.id) ?? null,
  }));

  const correctCount = corrections.filter(
    (correction) =>
      correction.chosenIndex !== null && correction.chosenIndex === correction.correctIndex,
  ).length;

  const score = questions.length === 0 ? 0 : Math.round((correctCount / questions.length) * 100);

  return { score, passed: score >= passScore, corrections };
}

export function computeProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  return Math.round((Math.min(completedLessons, totalLessons) / totalLessons) * 100);
}

// Melange deterministe a partir d'une graine, pour que l'ordre des options reste
// stable entre le rendu serveur et l'hydratation client.
export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  let state = 0;
  for (const char of seed) state = (state * 31 + char.charCodeAt(0)) >>> 0;

  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
