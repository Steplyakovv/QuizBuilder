import { createQuiz } from './quiz.factory';
import { addQuestion } from './quiz-questions';
import { testTranslate } from '../testing/test-translate';
import { exportQuizToJson, parseImportedQuiz } from './quiz-io';

describe('quiz-io', () => {
  it('exports a quiz to a readable JSON string that round-trips through JSON.parse', () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');

    const json = exportQuizToJson(quiz);

    expect(JSON.parse(json)).toEqual(quiz);
  });

  it('imports an exported quiz with a fresh id and timestamps', () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const json = exportQuizToJson(quiz);

    const imported = parseImportedQuiz(json, testTranslate);

    expect(imported.id).not.toBe(quiz.id);
    expect(imported.title).toBe(quiz.title);
    expect(imported.questions).toEqual(quiz.questions);
    expect(imported.settings).toEqual(quiz.settings);
  });

  it('throws a readable error for invalid JSON', () => {
    expect(() => parseImportedQuiz('not json', testTranslate)).toThrow(/JSON/);
  });

  it('throws a readable error when required fields are missing', () => {
    expect(() => parseImportedQuiz(JSON.stringify({ title: 'x' }), testTranslate)).toThrow(
      /опросник/,
    );
    expect(() =>
      parseImportedQuiz(JSON.stringify({ questions: [], settings: {} }), testTranslate),
    ).toThrow();
  });
});
