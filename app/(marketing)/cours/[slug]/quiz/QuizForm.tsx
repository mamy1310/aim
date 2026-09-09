'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { mono, serif } from '../../../../_components/styles';

type Question = {
  id: string;
  text: string;
  explanation: string | null;
  options: { label: string; originalIndex: number }[];
};

type Result = {
  score: number;
  passed: boolean;
  badgeToken: string | null;
  corrections: { questionId: string; correctIndex: number; chosenIndex: number | null }[];
};

const cardSx = {
  p: '20px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '14px',
  bgcolor: 'background.paper',
} as const;

export default function QuizForm({
  quizId,
  courseSlug,
  passScore,
  questions,
}: {
  quizId: string;
  courseSlug: string;
  passScore: number;
  questions: Question[];
}) {
  const t = useTranslations('quiz');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [startedAt] = useState(() => Date.now());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const complete = questions.every((question) => answers[question.id] !== undefined);

  async function submit() {
    setPending(true);
    setError('');

    const response = await fetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        quizId,
        durationSeconds: Math.round((Date.now() - startedAt) / 1000),
        answers: questions.map((question) => ({
          questionId: question.id,
          optionIndex: answers[question.id] ?? null,
        })),
      }),
    });

    setPending(false);
    if (!response.ok) {
      setError(t('error'));
      return;
    }

    setResult(await response.json());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const correctionOf = (questionId: string) =>
    result?.corrections.find((correction) => correction.questionId === questionId);

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      {result ? (
        <Box sx={{ ...cardSx, display: 'grid', gap: 1 }}>
          <Box
            component="span"
            sx={{ ...mono, fontSize: '11px', letterSpacing: '0.07em', color: 'text.disabled' }}
          >
            {t('resultTitle')}
          </Box>
          <Typography sx={{ ...serif, fontSize: '38px', fontWeight: 500, lineHeight: 1 }}>
            {t('score', { score: result.score })}
          </Typography>
          <Typography sx={{ fontSize: '15px', color: 'text.secondary' }}>
            {result.passed ? t('passed') : t('failed')}
          </Typography>
          <Box
            component="span"
            sx={{ ...mono, fontSize: '11px', color: 'text.disabled', letterSpacing: '0.05em' }}
          >
            {t('passScore', { passScore })}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
            {result.passed && result.badgeToken ? (
              <Button href={`/badge/${result.badgeToken}`} variant="contained" size="small">
                {t('seeBadge')}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setResult(null);
                  setAnswers({});
                }}
              >
                {t('retry')}
              </Button>
            )}
            <Button href={`/cours/${courseSlug}`} variant="outlined" size="small">
              {t('backToCourse')}
            </Button>
          </Box>
        </Box>
      ) : null}

      {questions.map((question, index) => {
        const correction = correctionOf(question.id);

        return (
          <Box key={question.id} component="fieldset" sx={{ ...cardSx, border: '1px solid', m: 0 }}>
            <Box
              component="legend"
              sx={{ ...mono, fontSize: '11px', letterSpacing: '0.07em', color: 'text.disabled' }}
            >
              {t('question', { index: index + 1, total: questions.length })}
            </Box>
            <Typography sx={{ fontSize: '16.5px', fontWeight: 500, mt: 1, mb: 2 }}>
              {question.text}
            </Typography>

            <Box sx={{ display: 'grid', gap: 1 }}>
              {question.options.map((option) => {
                const chosen = answers[question.id] === option.originalIndex;
                const isCorrect = correction?.correctIndex === option.originalIndex;
                const isWrongChoice =
                  correction?.chosenIndex === option.originalIndex && !isCorrect;

                return (
                  <Box
                    key={option.originalIndex}
                    component="label"
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.25,
                      p: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid',
                      cursor: result ? 'default' : 'pointer',
                      fontSize: '15px',
                      borderColor: isCorrect
                        ? 'success.main'
                        : isWrongChoice
                          ? 'error.main'
                          : chosen
                            ? 'text.primary'
                            : 'divider',
                      bgcolor: isCorrect
                        ? 'success.light'
                        : isWrongChoice
                          ? 'error.light'
                          : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      disabled={Boolean(result)}
                      checked={chosen}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: option.originalIndex,
                        }))
                      }
                    />
                    <span>{option.label}</span>
                  </Box>
                );
              })}
            </Box>

            {result && question.explanation ? (
              <Typography sx={{ mt: 1.5, fontSize: '14px', color: 'text.secondary' }}>
                {question.explanation}
              </Typography>
            ) : null}
          </Box>
        );
      })}

      {result ? null : (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" disabled={!complete || pending} onClick={submit}>
            {pending ? t('submitting') : t('submit')}
          </Button>
          <Box sx={{ fontSize: '14px', color: error ? 'error.main' : 'text.secondary' }}>
            {error || (complete ? '' : t('incomplete'))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
