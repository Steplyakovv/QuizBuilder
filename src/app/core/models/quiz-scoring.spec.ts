import { Quiz } from './quiz.models';
import { scoreAttempt } from './quiz-scoring';

function baseQuiz(isGraded: boolean): Quiz {
  return {
    id: 'quiz1',
    title: 'Опрос',
    questions: [],
    settings: { isGraded },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('scoreAttempt', () => {
  it('returns undefined for a non-graded quiz', () => {
    const quiz = baseQuiz(false);
    quiz.questions.push({
      id: 'q1',
      type: 'single-choice',
      prompt: 'p',
      required: true,
      options: [{ id: 'o1', label: 'a' }],
      correctOptionId: 'o1',
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o1'] }])).toBeUndefined();
  });

  it('returns undefined when no question has a correct answer configured', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'text',
      prompt: 'p',
      required: true,
      multiline: false,
    });

    expect(scoreAttempt(quiz, [])).toBeUndefined();
  });

  it('scores single-choice questions', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'single-choice',
      prompt: 'p',
      required: true,
      options: [
        { id: 'o1', label: 'a' },
        { id: 'o2', label: 'b' },
      ],
      correctOptionId: 'o1',
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o1'] }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o2'] }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('requires an exact set match for multiple-choice questions', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'multiple-choice',
      prompt: 'p',
      required: true,
      options: [
        { id: 'o1', label: 'a' },
        { id: 'o2', label: 'b' },
        { id: 'o3', label: 'c' },
      ],
      correctOptionIds: ['o1', 'o2'],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o2', 'o1'] }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(
      scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o1', 'o2', 'o3'] }]),
    ).toEqual({ correct: 0, total: 1 });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o1'] }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('ignores text questions and ungraded questions when counting the total', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push(
      {
        id: 'q1',
        type: 'single-choice',
        prompt: 'p',
        required: true,
        options: [{ id: 'o1', label: 'a' }],
        correctOptionId: 'o1',
      },
      { id: 'q2', type: 'text', prompt: 'p2', required: false, multiline: false },
      {
        id: 'q3',
        type: 'single-choice',
        prompt: 'p3',
        required: false,
        options: [{ id: 'o2', label: 'a' }],
      },
    );

    expect(
      scoreAttempt(quiz, [
        { questionId: 'q1', selectedOptionIds: ['o1'] },
        { questionId: 'q2', text: 'что угодно' },
      ]),
    ).toEqual({ correct: 1, total: 1 });
  });

  it('treats an unanswered gradable question as incorrect', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'single-choice',
      prompt: 'p',
      required: false,
      options: [{ id: 'o1', label: 'a' }],
      correctOptionId: 'o1',
    });

    expect(scoreAttempt(quiz, [])).toEqual({ correct: 0, total: 1 });
  });

  it('scores true-false questions', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'true-false',
      prompt: 'p',
      required: true,
      correctAnswer: true,
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', text: 'true' }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', text: 'false' }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('ignores a true-false question with no correct answer configured', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({ id: 'q1', type: 'true-false', prompt: 'p', required: true });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', text: 'true' }])).toBeUndefined();
  });

  it('scores dropdown questions', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'dropdown',
      prompt: 'p',
      required: true,
      options: [
        { id: 'o1', label: 'a' },
        { id: 'o2', label: 'b' },
      ],
      correctOptionId: 'o1',
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o1'] }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o2'] }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('ignores number and date questions when counting the total', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push(
      { id: 'q1', type: 'number', prompt: 'p', required: false },
      { id: 'q2', type: 'date', prompt: 'p2', required: false },
    );

    expect(scoreAttempt(quiz, [{ questionId: 'q1', text: '42' }])).toBeUndefined();
  });

  it('ignores rating, slider, and constant-sum questions when counting the total', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push(
      { id: 'q1', type: 'rating', prompt: 'p', required: false, min: 1, max: 5 },
      { id: 'q2', type: 'slider', prompt: 'p2', required: false, min: 0, max: 100, step: 1 },
      {
        id: 'q3',
        type: 'constant-sum',
        prompt: 'p3',
        required: false,
        options: [{ id: 'o1', label: 'a' }],
        total: 100,
      },
    );

    expect(scoreAttempt(quiz, [{ questionId: 'q1', text: '4' }])).toBeUndefined();
  });
});
