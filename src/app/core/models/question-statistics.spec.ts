import { Quiz, QuizAttempt } from './quiz.models';
import { questionStatistics } from './question-statistics';

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

function attempt(id: string, selectedOptionIds: string[]): QuizAttempt {
  return {
    id,
    quizId: 'quiz1',
    startedAt: '2026-01-01T00:00:00.000Z',
    responses: [{ questionId: 'q1', selectedOptionIds }],
  };
}

describe('questionStatistics', () => {
  it('returns nothing for a non-graded quiz', () => {
    const quiz = baseQuiz(false);
    quiz.questions.push({
      id: 'q1',
      type: 'single-choice',
      prompt: 'p',
      required: true,
      options: [{ id: 'o1', label: 'a' }],
      correctOptionId: 'o1',
    });

    expect(questionStatistics(quiz, [attempt('a1', ['o1'])])).toEqual([]);
  });

  it('skips questions without a configured correct answer', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'text',
      prompt: 'p',
      required: true,
      multiline: false,
    });

    expect(questionStatistics(quiz, [])).toEqual([]);
  });

  it('counts correct and incorrect responses per question', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'single-choice',
      prompt: 'Любимый напиток?',
      required: true,
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
      correctOptionId: 'o1',
    });

    const attempts = [attempt('a1', ['o1']), attempt('a2', ['o2']), attempt('a3', ['o1'])];

    expect(questionStatistics(quiz, attempts)).toEqual([
      { questionId: 'q1', correct: 2, incorrect: 1, total: 3 },
    ]);
  });

  it('treats an unanswered question as incorrect', () => {
    const quiz = baseQuiz(true);
    quiz.questions.push({
      id: 'q1',
      type: 'single-choice',
      prompt: 'p',
      required: false,
      options: [{ id: 'o1', label: 'a' }],
      correctOptionId: 'o1',
    });

    expect(
      questionStatistics(quiz, [{ id: 'a1', quizId: 'quiz1', startedAt: '', responses: [] }]),
    ).toEqual([{ questionId: 'q1', correct: 0, incorrect: 1, total: 1 }]);
  });
});
