import { Quiz } from './quiz.models';
import { formatCorrectAnswer, scoreAttempt } from './quiz-scoring';

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

  it('scores word-choice questions by exact word order', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'word-choice',
      prompt: 'p',
      required: true,
      words: [
        { id: 'w1', label: 'Небо' },
        { id: 'w2', label: 'голубое' },
      ],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['w1', 'w2'] }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['w2', 'w1'] }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('ignores a word-choice question with fewer than two words', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'word-choice',
      prompt: 'p',
      required: true,
      words: [{ id: 'w1', label: 'Небо' }],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['w1'] }])).toBeUndefined();
  });

  it('scores ranking questions by exact order', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'ranking',
      prompt: 'p',
      required: true,
      options: [
        { id: 'o1', label: 'Маленький' },
        { id: 'o2', label: 'Большой' },
      ],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o1', 'o2'] }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', selectedOptionIds: ['o2', 'o1'] }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('scores fill-in-the-blank questions case-insensitively, trimmed', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'fill-in-the-blank',
      prompt: 'p',
      required: true,
      template: 'Суп едят с {{}}.',
      correctAnswers: ['хлебом'],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', blanks: ['  ХЛЕБОМ  '] }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', blanks: ['молоком'] }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('ignores blanks with no configured correct answer', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'fill-in-the-blank',
      prompt: 'p',
      required: true,
      template: 'Суп едят с {{}}, а кашу с {{}}.',
      correctAnswers: ['хлебом', ''],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', blanks: ['хлебом', 'чем угодно'] }])).toEqual({
      correct: 1,
      total: 1,
    });
  });

  it('scores matching questions by exact pair matches', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'matching',
      prompt: 'p',
      required: true,
      pairs: [
        { id: 'p1', left: 'Франция', right: 'Париж' },
        { id: 'p2', left: 'Италия', right: 'Рим' },
      ],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', matches: { p1: 'p1', p2: 'p2' } }])).toEqual({
      correct: 1,
      total: 1,
    });
    expect(scoreAttempt(quiz, [{ questionId: 'q1', matches: { p1: 'p2', p2: 'p1' } }])).toEqual({
      correct: 0,
      total: 1,
    });
  });

  it('never scores matrix questions', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'matrix',
      prompt: 'p',
      required: true,
      rows: [{ id: 'r1', label: 'Утверждение' }],
      columns: [{ id: 'c1', label: 'Да' }],
    });

    expect(scoreAttempt(quiz, [{ questionId: 'q1', matches: { r1: 'c1' } }])).toBeUndefined();
  });
});

describe('formatCorrectAnswer', () => {
  it('returns undefined for a question with no correct answer configured', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'single-choice',
        prompt: 'p',
        required: true,
        options: [{ id: 'o1', label: 'a' }],
      }),
    ).toBeUndefined();
  });

  it('shows the correct option label for single-choice/dropdown questions', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'single-choice',
        prompt: 'p',
        required: true,
        options: [
          { id: 'o1', label: 'a' },
          { id: 'o2', label: 'b' },
        ],
        correctOptionId: 'o2',
      }),
    ).toBe('b');
  });

  it('joins the correct option labels for multiple-choice questions', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'multiple-choice',
        prompt: 'p',
        required: true,
        options: [
          { id: 'o1', label: 'a' },
          { id: 'o2', label: 'b' },
          { id: 'o3', label: 'c' },
        ],
        correctOptionIds: ['o1', 'o3'],
      }),
    ).toBe('a, c');
  });

  it('shows Да/Нет for true-false questions', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'true-false',
        prompt: 'p',
        required: true,
        correctAnswer: true,
      }),
    ).toBe('Да');
  });

  it('joins the words in correct order for word-choice questions', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'word-choice',
        prompt: 'p',
        required: true,
        words: [
          { id: 'w1', label: 'Небо' },
          { id: 'w2', label: 'голубое' },
        ],
      }),
    ).toBe('Небо голубое');
  });

  it('joins the options in correct order for ranking questions', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'ranking',
        prompt: 'p',
        required: true,
        options: [
          { id: 'o1', label: 'Маленький' },
          { id: 'o2', label: 'Большой' },
        ],
      }),
    ).toBe('Маленький → Большой');
  });

  it('fills the template with correct answers, marking ungraded blanks', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'fill-in-the-blank',
        prompt: 'p',
        required: true,
        template: 'Суп едят с {{}}, а кашу с {{}}.',
        correctAnswers: ['хлебом', ''],
      }),
    ).toBe('Суп едят с хлебом, а кашу с [любой ответ].');
  });

  it('shows the pair matches for matching questions', () => {
    expect(
      formatCorrectAnswer({
        id: 'q1',
        type: 'matching',
        prompt: 'p',
        required: true,
        pairs: [
          { id: 'p1', left: 'Франция', right: 'Париж' },
          { id: 'p2', left: 'Италия', right: 'Рим' },
        ],
      }),
    ).toBe('Франция → Париж, Италия → Рим');
  });
});
