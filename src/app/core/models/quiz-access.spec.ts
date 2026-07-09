import {
  isAccessPasswordCorrect,
  isQuizExpired,
  isQuizPublished,
  quizRequiresPassword,
} from './quiz-access';
import { createQuiz } from './quiz.factory';
import { Quiz } from './quiz.models';

describe('isQuizPublished', () => {
  it('defaults to published when the field is unset', () => {
    const quiz = createQuiz('Quiz');
    expect(isQuizPublished(quiz)).toBe(true);
  });

  it('respects an explicit published flag', () => {
    const quiz: Quiz = { ...createQuiz('Quiz'), settings: { isGraded: false, published: false } };
    expect(isQuizPublished(quiz)).toBe(false);
  });
});

describe('isQuizExpired', () => {
  it('is not expired when there is no deadline', () => {
    const quiz = createQuiz('Quiz');
    expect(isQuizExpired(quiz)).toBe(false);
  });

  it('is expired once the deadline has passed', () => {
    const quiz: Quiz = {
      ...createQuiz('Quiz'),
      settings: { isGraded: false, expiresAt: '2026-01-01T00:00:00.000Z' },
    };
    expect(isQuizExpired(quiz, new Date('2026-01-02T00:00:00.000Z'))).toBe(true);
    expect(isQuizExpired(quiz, new Date('2025-12-31T00:00:00.000Z'))).toBe(false);
  });
});

describe('password protection', () => {
  it('does not require a password when none is set', () => {
    const quiz = createQuiz('Quiz');
    expect(quizRequiresPassword(quiz)).toBe(false);
  });

  it('requires and validates the configured password, ignoring surrounding whitespace', () => {
    const quiz: Quiz = {
      ...createQuiz('Quiz'),
      settings: { isGraded: false, accessPassword: 'secret' },
    };
    expect(quizRequiresPassword(quiz)).toBe(true);
    expect(isAccessPasswordCorrect(quiz, 'secret')).toBe(true);
    expect(isAccessPasswordCorrect(quiz, '  secret  ')).toBe(true);
    expect(isAccessPasswordCorrect(quiz, 'wrong')).toBe(false);
  });
});
