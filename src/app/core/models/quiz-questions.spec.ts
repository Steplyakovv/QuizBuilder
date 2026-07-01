import { createQuiz } from './quiz.factory';
import { addQuestion, removeQuestion, reorderQuestions, replaceQuestion } from './quiz-questions';

describe('addQuestion', () => {
  it('appends a question of the given type', () => {
    const quiz = addQuestion(createQuiz('Опрос'), 'text');
    expect(quiz.questions).toHaveLength(1);
    expect(quiz.questions[0].type).toBe('text');
  });
});

describe('removeQuestion', () => {
  it('removes the question with the given id', () => {
    let quiz = addQuestion(createQuiz('Опрос'), 'text');
    const questionId = quiz.questions[0].id;
    quiz = addQuestion(quiz, 'single-choice');

    quiz = removeQuestion(quiz, questionId);

    expect(quiz.questions).toHaveLength(1);
    expect(quiz.questions[0].type).toBe('single-choice');
  });
});

describe('replaceQuestion', () => {
  it('replaces the question with the matching id, leaving others untouched', () => {
    let quiz = addQuestion(createQuiz('Опрос'), 'text');
    quiz = addQuestion(quiz, 'text');
    const [first, second] = quiz.questions;

    quiz = replaceQuestion(quiz, { ...first, prompt: 'Как вас зовут?' });

    expect(quiz.questions[0].prompt).toBe('Как вас зовут?');
    expect(quiz.questions[1]).toEqual(second);
  });

  it('is a no-op when no question matches the id', () => {
    const quiz = addQuestion(createQuiz('Опрос'), 'text');
    const unrelated = { ...quiz.questions[0], id: 'missing', prompt: 'x' };

    expect(replaceQuestion(quiz, unrelated)).toEqual(quiz);
  });
});

describe('reorderQuestions', () => {
  it('moves a question from one index to another', () => {
    let quiz = addQuestion(createQuiz('Опрос'), 'text');
    quiz = addQuestion(quiz, 'single-choice');
    quiz = addQuestion(quiz, 'multiple-choice');
    const ids = quiz.questions.map((question) => question.id);

    quiz = reorderQuestions(quiz, 0, 2);

    expect(quiz.questions.map((question) => question.id)).toEqual([ids[1], ids[2], ids[0]]);
  });
});
