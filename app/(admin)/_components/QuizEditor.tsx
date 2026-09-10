'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { saveQuizAction } from '@/lib/admin/actions';
import { runAction } from '@/lib/client-action';

import { ghostSx, mono } from '../../_components/styles';

export type QuestionValues = {
  id?: string;
  text: string;
  explanation: string | null;
  options: { label: string; isCorrect: boolean }[];
};

const emptyQuestion = (): QuestionValues => ({
  text: '',
  explanation: null,
  options: [
    { label: '', isCorrect: true },
    { label: '', isCorrect: false },
  ],
});

export default function QuizEditor({
  courseId,
  initialPassScore,
  initialQuestions,
}: {
  courseId: string;
  initialPassScore: number;
  initialQuestions: QuestionValues[];
}) {
  const t = useTranslations('admin.quiz');
  const te = useTranslations('admin.errors');
  const router = useRouter();

  const [passScore, setPassScore] = useState(initialPassScore);
  const [questions, setQuestions] = useState<QuestionValues[]>(
    initialQuestions.length > 0 ? initialQuestions : [emptyQuestion()],
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  function updateQuestion(index: number, patch: Partial<QuestionValues>) {
    setQuestions((current) =>
      current.map((question, i) => (i === index ? { ...question, ...patch } : question)),
    );
  }

  return (
    <Box
      component="form"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setMessage('');
        const result = await runAction(() => saveQuizAction(courseId, { passScore, questions }));
        setPending(false);
        if (!result.ok) {
          setError(true);
          setMessage(te(result.error));
          return;
        }
        setError(false);
        setMessage(t('saved'));
        router.refresh();
      }}
      sx={{ display: 'grid', gap: 3 }}
    >
      <TextField
        label={t('passScore')}
        type="number"
        value={passScore}
        onChange={(event) => setPassScore(Number(event.target.value))}
        size="small"
        sx={{ maxWidth: 260 }}
        slotProps={{ htmlInput: { min: 0, max: 100 } }}
      />

      {questions.map((question, questionIndex) => (
        <Box
          key={question.id ?? `nouvelle-${questionIndex}`}
          sx={{
            display: 'grid',
            gap: 2,
            p: '18px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              component="span"
              sx={{ ...mono, fontSize: '10.5px', letterSpacing: '0.06em', color: 'text.disabled' }}
            >
              {t('question', { index: questionIndex + 1 })}
            </Typography>
            {questions.length > 1 ? (
              <Button
                type="button"
                size="small"
                sx={{ color: 'error.main' }}
                onClick={() =>
                  setQuestions((current) => current.filter((_, i) => i !== questionIndex))
                }
              >
                {t('removeQuestion')}
              </Button>
            ) : null}
          </Box>

          <TextField
            label={t('questionText')}
            value={question.text}
            onChange={(event) => updateQuestion(questionIndex, { text: event.target.value })}
            size="small"
            required
          />

          {question.options.map((option, optionIndex) => (
            <Box key={optionIndex} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Radio
                checked={option.isCorrect}
                onChange={() =>
                  updateQuestion(questionIndex, {
                    options: question.options.map((item, i) => ({
                      ...item,
                      isCorrect: i === optionIndex,
                    })),
                  })
                }
                slotProps={{ input: { 'aria-label': t('correct') } }}
              />
              <TextField
                label={t('option', { index: optionIndex + 1 })}
                value={option.label}
                onChange={(event) =>
                  updateQuestion(questionIndex, {
                    options: question.options.map((item, i) =>
                      i === optionIndex ? { ...item, label: event.target.value } : item,
                    ),
                  })
                }
                size="small"
                fullWidth
                required
              />
              {question.options.length > 2 ? (
                <Button
                  type="button"
                  size="small"
                  sx={{ color: 'text.secondary' }}
                  onClick={() =>
                    updateQuestion(questionIndex, {
                      options: question.options.filter((_, i) => i !== optionIndex),
                    })
                  }
                >
                  {t('removeOption')}
                </Button>
              ) : null}
            </Box>
          ))}

          {question.options.length < 6 ? (
            <Button
              type="button"
              size="small"
              variant="outlined"
              sx={{ ...ghostSx, justifySelf: 'flex-start' }}
              onClick={() =>
                updateQuestion(questionIndex, {
                  options: [...question.options, { label: '', isCorrect: false }],
                })
              }
            >
              {t('addOption')}
            </Button>
          ) : null}

          <TextField
            label={t('explanation')}
            value={question.explanation ?? ''}
            onChange={(event) =>
              updateQuestion(questionIndex, { explanation: event.target.value || null })
            }
            size="small"
            multiline
            minRows={2}
          />
        </Box>
      ))}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          sx={ghostSx}
          onClick={() => setQuestions((current) => [...current, emptyQuestion()])}
        >
          {t('addQuestion')}
        </Button>
        <Button type="submit" variant="contained" size="small" disabled={pending}>
          {t('save')}
        </Button>
        <Box sx={{ fontSize: '14px', color: error ? 'error.main' : 'success.main' }}>{message}</Box>
      </Box>
    </Box>
  );
}
