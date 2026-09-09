import { describe, expect, it } from 'vitest';

import { computeProgress, scoreQuiz, shuffleWithSeed } from '@/lib/courses/scoring';

const questions = [
  {
    id: 'q1',
    options: [
      { label: 'a', isCorrect: true },
      { label: 'b', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    options: [
      { label: 'a', isCorrect: false },
      { label: 'b', isCorrect: true },
    ],
  },
];

describe('scoreQuiz', () => {
  it('calcule un score en pourcentage', () => {
    const result = scoreQuiz(
      questions,
      [
        { questionId: 'q1', optionIndex: 0 },
        { questionId: 'q2', optionIndex: 0 },
      ],
      70,
    );
    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
  });

  it('valide au dessus du seuil', () => {
    const result = scoreQuiz(
      questions,
      [
        { questionId: 'q1', optionIndex: 0 },
        { questionId: 'q2', optionIndex: 1 },
      ],
      70,
    );
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
  });

  it('compte une question sans reponse comme fausse', () => {
    const result = scoreQuiz(questions, [{ questionId: 'q1', optionIndex: null }], 70);
    expect(result.score).toBe(0);
    expect(result.corrections).toHaveLength(2);
    expect(result.corrections[1].chosenIndex).toBeNull();
  });

  it('renvoie zero sans question', () => {
    expect(scoreQuiz([], [], 70).score).toBe(0);
  });
});

describe('computeProgress', () => {
  it.each([
    [0, 4, 0],
    [1, 4, 25],
    [3, 4, 75],
    [4, 4, 100],
    [5, 4, 100],
    [1, 0, 0],
  ])('%i / %i -> %i', (done, total, expected) => {
    expect(computeProgress(done, total)).toBe(expected);
  });
});

describe('shuffleWithSeed', () => {
  it('conserve les elements', () => {
    const shuffled = shuffleWithSeed([1, 2, 3, 4, 5], 'graine');
    expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('donne le meme ordre pour la meme graine', () => {
    expect(shuffleWithSeed([1, 2, 3, 4, 5], 'a')).toEqual(shuffleWithSeed([1, 2, 3, 4, 5], 'a'));
  });

  it('donne des ordres differents pour des graines differentes', () => {
    const orders = new Set(
      ['a', 'b', 'c', 'd', 'e'].map((seed) => shuffleWithSeed([1, 2, 3, 4, 5], seed).join('')),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});
