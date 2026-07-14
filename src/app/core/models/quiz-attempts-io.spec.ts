import { addQuestion, replaceQuestion } from './quiz-questions';
import { createQuiz } from './quiz.factory';
import { SingleChoiceQuestion } from './quiz.models';
import { testTranslate } from '../testing/test-translate';
import { exportAttemptsToCsv } from './quiz-attempts-io';

describe('exportAttemptsToCsv', () => {
  it('includes a header row, respondent, dates, score and per-question answers', () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const question = {
      ...quiz.questions[0],
      prompt: 'Любимый напиток?',
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
      correctOptionId: 'o1',
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, question);
    quiz = { ...quiz, settings: { isGraded: true } };

    const csv = exportAttemptsToCsv(testTranslate, quiz, [
      {
        id: 'a1',
        quizId: quiz.id,
        respondentName: 'Иван',
        startedAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:01:00.000Z',
        responses: [{ questionId: question.id, selectedOptionIds: ['o1'] }],
        score: 1,
      },
    ]);

    const [header, row] = csv.split('\r\n');
    expect(header).toBe('Респондент;Начато;Завершено;Баллы;Любимый напиток?');
    expect(row).toContain('Иван');
    expect(row).toContain('1/1');
    expect(row).toContain('Латте');
  });

  it('escapes semicolons, quotes and newlines in field values, but leaves plain commas alone', () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'text');
    const question = { ...quiz.questions[0], prompt: 'Комментарий; если есть' };
    quiz = replaceQuestion(quiz, question);

    const csv = exportAttemptsToCsv(testTranslate, quiz, [
      {
        id: 'a1',
        quizId: quiz.id,
        respondentName: 'Кто-то "особенный"',
        startedAt: '2026-01-01T00:00:00.000Z',
        responses: [{ questionId: question.id, text: 'строка с, запятой; и точкой с запятой' }],
      },
    ]);

    expect(csv).toContain('"Комментарий; если есть"');
    expect(csv).toContain('"Кто-то ""особенный"""');
    expect(csv).toContain('"строка с, запятой; и точкой с запятой"');
  });

  it('scores each attempt against its own quiz snapshot, not the quiz passed in', () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const question = {
      ...quiz.questions[0],
      prompt: 'Любимый напиток?',
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
      correctOptionId: 'o1',
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, question);
    quiz = { ...quiz, settings: { isGraded: true } };

    const snapshotQuestion = { ...question, correctOptionId: 'o2' } as SingleChoiceQuestion;
    const snapshotQuiz = replaceQuestion(quiz, snapshotQuestion);

    const csv = exportAttemptsToCsv(testTranslate, quiz, [
      {
        id: 'a1',
        quizId: quiz.id,
        startedAt: '2026-01-01T00:00:00.000Z',
        responses: [{ questionId: question.id, selectedOptionIds: ['o2'] }],
        quizSnapshot: snapshotQuiz,
      },
    ]);

    const [, row] = csv.split('\r\n');
    expect(row).toContain('1/1');
  });
});
