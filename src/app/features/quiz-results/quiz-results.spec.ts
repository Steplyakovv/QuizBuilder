import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { createQuiz } from '../../core/models/quiz.factory';
import { addQuestion, replaceQuestion } from '../../core/models/quiz-questions';
import { SingleChoiceQuestion } from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QUIZ_REPOSITORY } from '../../core/repositories/quiz-repository';
import { FakeAttemptRepository } from '../../core/testing/fake-attempt-repository';
import { FakeQuizRepository } from '../../core/testing/fake-quiz-repository';
import { QuizResults } from './quiz-results';

describe('QuizResults', () => {
  let quizRepository: FakeQuizRepository;
  let attemptRepository: FakeAttemptRepository;

  async function createComponent(quizId: string) {
    await TestBed.configureTestingModule({
      imports: [QuizResults],
      providers: [
        provideRouter([]),
        { provide: QUIZ_REPOSITORY, useValue: quizRepository },
        { provide: ATTEMPT_REPOSITORY, useValue: attemptRepository },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(QuizResults);
    fixture.componentRef.setInput('id', quizId);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    quizRepository = new FakeQuizRepository();
    attemptRepository = new FakeAttemptRepository();
  });

  it('shows a not-found message for an unknown quiz id', async () => {
    const fixture = await createComponent('missing');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Опросник не найден');
  });

  it('shows an empty state when no one has taken the quiz yet', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);

    expect(fixture.componentInstance.attempts()).toEqual([]);
  });

  it('loads and scores attempts for the requested quiz', async () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const question = {
      ...quiz.questions[0],
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
      correctOptionId: 'o1',
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, question);
    quiz = { ...quiz, settings: { isGraded: true } };
    await quizRepository.save(quiz);

    await attemptRepository.save({
      id: 'a1',
      quizId: quiz.id,
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      responses: [{ questionId: question.id, selectedOptionIds: ['o1'] }],
      score: 1,
    });
    await attemptRepository.save({
      id: 'a2',
      quizId: 'other-quiz',
      startedAt: '2026-01-01T00:00:00.000Z',
      responses: [],
    });

    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.attempts().map((attempt) => attempt.id)).toEqual(['a1']);
    expect(fixture.componentInstance.scoreFor(fixture.componentInstance.attempts()[0])).toEqual({
      correct: 1,
      total: 1,
    });
  });

  it('computes per-question statistics across all attempts', async () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const question = {
      ...quiz.questions[0],
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
      correctOptionId: 'o1',
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, question);
    quiz = { ...quiz, settings: { isGraded: true } };
    await quizRepository.save(quiz);

    await attemptRepository.save({
      id: 'a1',
      quizId: quiz.id,
      startedAt: '',
      responses: [{ questionId: question.id, selectedOptionIds: ['o1'] }],
    });
    await attemptRepository.save({
      id: 'a2',
      quizId: quiz.id,
      startedAt: '',
      responses: [{ questionId: question.id, selectedOptionIds: ['o2'] }],
    });

    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.stats()).toEqual([
      { questionId: question.id, correct: 1, incorrect: 1, total: 2 },
    ]);
    expect(fixture.componentInstance.percentCorrect(fixture.componentInstance.stats()[0])).toBe(50);
  });

  it('formats an attempt answer using the respondent name and option labels', async () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const question = {
      ...quiz.questions[0],
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, question);
    await quizRepository.save(quiz);

    await attemptRepository.save({
      id: 'a1',
      quizId: quiz.id,
      respondentName: 'Иван',
      startedAt: '',
      responses: [{ questionId: question.id, selectedOptionIds: ['o2'] }],
    });

    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();
    const attempt = fixture.componentInstance.attempts()[0];

    expect(attempt.respondentName).toBe('Иван');
    expect(fixture.componentInstance.answerFor(attempt, question)).toBe('Эспрессо');
  });

  it('filters attempts by respondent name', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await quizRepository.save(quiz);
    await attemptRepository.save({
      id: 'a1',
      quizId: quiz.id,
      respondentName: 'Иван',
      startedAt: '2026-01-01T00:00:00.000Z',
      responses: [],
    });
    await attemptRepository.save({
      id: 'a2',
      quizId: quiz.id,
      respondentName: 'Мария',
      startedAt: '2026-01-01T00:00:00.000Z',
      responses: [],
    });
    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.filteredAttempts()).toHaveLength(2);

    fixture.componentInstance.respondentFilter.set('мари');
    await fixture.whenStable();

    expect(fixture.componentInstance.filteredAttempts().map((attempt) => attempt.id)).toEqual([
      'a2',
    ]);
  });

  it('sorts attempts by completion date, newest first by default, and toggles direction', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await quizRepository.save(quiz);
    await attemptRepository.save({
      id: 'earlier',
      quizId: quiz.id,
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:00:00.000Z',
      responses: [],
    });
    await attemptRepository.save({
      id: 'later',
      quizId: quiz.id,
      startedAt: '2026-01-02T00:00:00.000Z',
      completedAt: '2026-01-02T00:00:00.000Z',
      responses: [],
    });
    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.filteredAttempts().map((attempt) => attempt.id)).toEqual([
      'later',
      'earlier',
    ]);

    fixture.componentInstance.toggleSort('date');
    await fixture.whenStable();

    expect(fixture.componentInstance.filteredAttempts().map((attempt) => attempt.id)).toEqual([
      'earlier',
      'later',
    ]);
  });

  it('scores and displays an attempt against the quiz snapshot taken at attempt time, not the live quiz', async () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const originalQuestion = {
      ...quiz.questions[0],
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
      correctOptionId: 'o1',
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, originalQuestion);
    quiz = { ...quiz, settings: { isGraded: true } };
    await quizRepository.save(quiz);

    // The respondent saw "o2" as correct; the admin later flipped it to "o1".
    const snapshotQuestion = { ...originalQuestion, correctOptionId: 'o2' } as SingleChoiceQuestion;
    const snapshotQuiz = replaceQuestion(quiz, snapshotQuestion);

    await attemptRepository.save({
      id: 'a1',
      quizId: quiz.id,
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      responses: [{ questionId: originalQuestion.id, selectedOptionIds: ['o2'] }],
      quizSnapshot: snapshotQuiz,
    });

    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();
    const attempt = fixture.componentInstance.attempts()[0];

    expect(fixture.componentInstance.scoreFor(attempt)).toEqual({ correct: 1, total: 1 });
    expect(fixture.componentInstance.questionCorrectness(attempt, snapshotQuestion)).toBe(true);
  });

  it('toggles which attempt is expanded', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await quizRepository.save(quiz);
    await attemptRepository.save({ id: 'a1', quizId: quiz.id, startedAt: '', responses: [] });
    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.expandedAttemptId()).toBeNull();

    fixture.componentInstance.toggleExpand('a1');
    expect(fixture.componentInstance.expandedAttemptId()).toBe('a1');

    fixture.componentInstance.toggleExpand('a1');
    expect(fixture.componentInstance.expandedAttemptId()).toBeNull();
  });
});
