import { createQuiz } from './quiz.factory';

describe('createQuiz', () => {
  it('creates a quiz with a trimmed title, no questions and an ungraded default', () => {
    const quiz = createQuiz('  Опрос про кофе  ');

    expect(quiz.title).toBe('Опрос про кофе');
    expect(quiz.questions).toEqual([]);
    expect(quiz.settings).toEqual({ isGraded: false });
    expect(quiz.id).toBeTruthy();
    expect(quiz.createdAt).toBe(quiz.updatedAt);
  });

  it('generates a unique id for every quiz', () => {
    expect(createQuiz('A').id).not.toBe(createQuiz('B').id);
  });
});
