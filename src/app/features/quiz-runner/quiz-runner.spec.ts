import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { getClientId } from '../../core/utils/client-id';
import { createQuiz } from '../../core/models/quiz.factory';
import { addQuestion, replaceQuestion } from '../../core/models/quiz-questions';
import { addPage } from '../../core/models/quiz-pages';
import { Quiz, SingleChoiceQuestion, TextQuestion } from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QUIZ_REPOSITORY } from '../../core/repositories/quiz-repository';
import { FakeAttemptRepository } from '../../core/testing/fake-attempt-repository';
import { FakeQuizRepository } from '../../core/testing/fake-quiz-repository';
import { provideTestTransloco } from '../../core/testing/provide-test-transloco';
import { QuizRunner } from './quiz-runner';

describe('QuizRunner', () => {
  let quizRepository: FakeQuizRepository;
  let attemptRepository: FakeAttemptRepository;

  async function createComponent(quizId: string) {
    await TestBed.configureTestingModule({
      imports: [QuizRunner],
      providers: [
        provideRouter([]),
        provideTestTransloco(),
        { provide: QUIZ_REPOSITORY, useValue: quizRepository },
        { provide: ATTEMPT_REPOSITORY, useValue: attemptRepository },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(QuizRunner);
    fixture.componentRef.setInput('id', quizId);
    await fixture.whenStable();
    return fixture;
  }

  function singleChoiceQuiz(): Quiz {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'single-choice');
    const question = {
      ...quiz.questions[0],
      prompt: 'Любимый напиток?',
      required: true,
      options: [
        { id: 'o1', label: 'Латте' },
        { id: 'o2', label: 'Эспрессо' },
      ],
      correctOptionId: 'o1',
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, question);
    quiz = { ...quiz, settings: { isGraded: true } };
    return quiz;
  }

  beforeEach(() => {
    localStorage.clear();
    quizRepository = new FakeQuizRepository();
    attemptRepository = new FakeAttemptRepository();
  });

  it('shows a not-found message for an unknown quiz id', async () => {
    const fixture = await createComponent('missing');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Опросник не найден');
  });

  it('blocks submission and reports unanswered required questions', async () => {
    const quiz = singleChoiceQuiz();
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);

    await fixture.componentInstance.submit();
    await fixture.whenStable();

    expect(fixture.componentInstance.validationErrors().has(quiz.questions[0].id)).toBe(true);
    expect(fixture.componentInstance.submitted()).toBe(false);
    expect(attemptRepository.attempts).toHaveLength(0);
  });

  it('clears the validation error for a question once it is answered', async () => {
    const quiz = singleChoiceQuiz();
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);
    const questionId = quiz.questions[0].id;

    await fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(fixture.componentInstance.validationErrors().has(questionId)).toBe(true);

    fixture.componentInstance.setSelection(questionId, ['o1']);
    await fixture.whenStable();

    expect(fixture.componentInstance.validationErrors().has(questionId)).toBe(false);
  });

  it('saves an attempt and scores it once all required questions are answered', async () => {
    const quiz = singleChoiceQuiz();
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);
    const questionId = quiz.questions[0].id;

    fixture.componentInstance.setSelection(questionId, ['o1']);
    await fixture.componentInstance.submit();
    await fixture.whenStable();

    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(fixture.componentInstance.result()).toEqual({ correct: 1, total: 1 });
    expect(attemptRepository.attempts).toHaveLength(1);
    expect(attemptRepository.attempts[0]).toMatchObject({
      quizId: quiz.id,
      responses: [{ questionId, selectedOptionIds: ['o1'] }],
      score: 1,
    });
  });

  it('saves the entered respondent name and omits it when left blank', async () => {
    const quiz = singleChoiceQuiz();
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);
    const questionId = quiz.questions[0].id;

    fixture.componentInstance.respondentName.set('  Иван  ');
    fixture.componentInstance.setSelection(questionId, ['o1']);
    await fixture.componentInstance.submit();
    await fixture.whenStable();

    expect(attemptRepository.attempts[0].respondentName).toBe('Иван');
  });

  it('does not require an optional question to be answered', async () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'text');
    const question = { ...quiz.questions[0], required: false } as TextQuestion;
    quiz = replaceQuestion(quiz, question);
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);

    await fixture.componentInstance.submit();
    await fixture.whenStable();

    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(attemptRepository.attempts).toHaveLength(1);
  });

  it('scores a preview quiz without persisting an attempt', async () => {
    const quiz = singleChoiceQuiz();
    await TestBed.configureTestingModule({
      imports: [QuizRunner],
      providers: [
        provideRouter([]),
        provideTestTransloco(),
        { provide: QUIZ_REPOSITORY, useValue: quizRepository },
        { provide: ATTEMPT_REPOSITORY, useValue: attemptRepository },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(QuizRunner);
    fixture.componentRef.setInput('previewQuiz', quiz);
    await fixture.whenStable();
    const questionId = quiz.questions[0].id;

    expect(fixture.componentInstance.isPreview()).toBe(true);

    fixture.componentInstance.setSelection(questionId, ['o1']);
    await fixture.componentInstance.submit();
    await fixture.whenStable();

    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(fixture.componentInstance.result()).toEqual({ correct: 1, total: 1 });
    expect(attemptRepository.attempts).toHaveLength(0);
  });

  it('surfaces a quota-exceeded error without marking the attempt as submitted', async () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'text');
    const question = { ...quiz.questions[0], required: false } as TextQuestion;
    quiz = replaceQuestion(quiz, question);
    await quizRepository.save(quiz);
    attemptRepository.save = () => Promise.reject(new DOMException('full', 'QuotaExceededError'));
    const fixture = await createComponent(quiz.id);

    await fixture.componentInstance.submit();
    await fixture.whenStable();

    expect(fixture.componentInstance.saveError()).toContain('лимит хранилища браузера');
    expect(fixture.componentInstance.submitted()).toBe(false);
  });

  it('shuffles question order without dropping or duplicating questions', async () => {
    let quiz = createQuiz('Опрос');
    quiz = addQuestion(quiz, 'text');
    quiz = addQuestion(quiz, 'text');
    quiz = addQuestion(quiz, 'text');
    quiz = {
      ...quiz,
      questions: quiz.questions.map((question) => ({ ...question, required: false })),
      settings: { isGraded: false, shuffleQuestions: true },
    };
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);

    const visibleIds = fixture.componentInstance.visibleQuestions().map((question) => question.id);
    expect(new Set(visibleIds)).toEqual(new Set(quiz.questions.map((question) => question.id)));
    expect(visibleIds).toHaveLength(3);
  });

  it('hides a question until the source question is answered, and skips it from required validation', async () => {
    let quiz = createQuiz('Опрос с ветвлением');
    quiz = addQuestion(quiz, 'single-choice');
    quiz = addQuestion(quiz, 'text');
    const gate = {
      ...quiz.questions[0],
      prompt: 'Расскажите про кофе?',
      required: false,
      options: [
        { id: 'yes', label: 'Да' },
        { id: 'no', label: 'Нет' },
      ],
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, gate);
    const gated = {
      ...quiz.questions[1],
      required: true,
      condition: { questionId: gate.id },
    } as TextQuestion;
    quiz = replaceQuestion(quiz, gated);
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);

    expect(fixture.componentInstance.visibleQuestions().map((q) => q.id)).toEqual([gate.id]);

    // gated is required but hidden, so submission succeeds without answering either question
    await fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(attemptRepository.attempts).toHaveLength(1);
  });

  it('reveals the gated question once the source question has any answer', async () => {
    let quiz = createQuiz('Опрос с ветвлением');
    quiz = addQuestion(quiz, 'single-choice');
    quiz = addQuestion(quiz, 'text');
    const gate = {
      ...quiz.questions[0],
      prompt: 'Расскажите про кофе?',
      required: false,
      options: [
        { id: 'yes', label: 'Да' },
        { id: 'no', label: 'Нет' },
      ],
    } as SingleChoiceQuestion;
    quiz = replaceQuestion(quiz, gate);
    const gated = { ...quiz.questions[1], condition: { questionId: gate.id } } as TextQuestion;
    quiz = replaceQuestion(quiz, gated);
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.setSelection(gate.id, ['no']);
    await fixture.whenStable();

    expect(fixture.componentInstance.visibleQuestions().map((q) => q.id)).toEqual([
      gate.id,
      gated.id,
    ]);
  });

  it('blocks a new attempt once the per-browser attempt limit is reached', async () => {
    const clientId = getClientId();
    let quiz = createQuiz('Опрос с лимитом попыток');
    quiz = addQuestion(quiz, 'text');
    quiz = {
      ...quiz,
      questions: quiz.questions.map((question) => ({ ...question, required: false })),
      settings: { isGraded: false, maxAttempts: 1 },
    };
    await quizRepository.save(quiz);
    await attemptRepository.save({
      id: 'previous',
      quizId: quiz.id,
      respondentClientId: clientId,
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: '2026-01-01T00:01:00.000Z',
      responses: [],
    });

    const fixture = await createComponent(quiz.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.attemptsBlocked()).toBe(true);

    await fixture.componentInstance.submit();
    await fixture.whenStable();
    expect(attemptRepository.attempts).toHaveLength(1);
  });

  it('shows a countdown once a time limit is configured', async () => {
    const quiz = singleChoiceQuiz();
    const timedQuiz = { ...quiz, settings: { ...quiz.settings, timeLimitMinutes: 1 } };
    await quizRepository.save(timedQuiz);
    const fixture = await createComponent(timedQuiz.id);

    expect(fixture.componentInstance.remainingSeconds()).toBeGreaterThan(0);
    expect(fixture.componentInstance.remainingTimeLabel()).toMatch(/^\d+:\d{2}$/);
  });

  it('force-submits without validating required questions, as the expiry timer does', async () => {
    const quiz = singleChoiceQuiz();
    await quizRepository.save(quiz);
    const fixture = await createComponent(quiz.id);

    await fixture.componentInstance.submit(true);
    await fixture.whenStable();

    expect(fixture.componentInstance.validationErrors().size).toBe(0);
    expect(fixture.componentInstance.submitted()).toBe(true);
    expect(attemptRepository.attempts).toHaveLength(1);
    expect(attemptRepository.attempts[0].responses).toEqual([]);
  });

  describe('pagination', () => {
    function pagedQuiz(): { quiz: Quiz; page1: string; page2: string; q1: string; q2: string } {
      let quiz = createQuiz('Опрос со страницами');
      quiz = addQuestion(quiz, 'text');
      quiz = addQuestion(quiz, 'text');
      quiz = addPage(quiz, 'Первая тема');
      quiz = addPage(quiz, 'Вторая тема');
      const [page1, page2] = quiz.pages!;
      const q1 = { ...quiz.questions[0], required: true, pageId: page1.id } as TextQuestion;
      const q2 = { ...quiz.questions[1], required: true, pageId: page2.id } as TextQuestion;
      quiz = replaceQuestion(quiz, q1);
      quiz = replaceQuestion(quiz, q2);
      return { quiz, page1: page1.id, page2: page2.id, q1: q1.id, q2: q2.id };
    }

    it('treats a quiz with no pages configured as a single page', async () => {
      const quiz = singleChoiceQuiz();
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      expect(fixture.componentInstance.isPaginated()).toBe(false);
      expect(fixture.componentInstance.pages()).toHaveLength(1);
      expect(fixture.componentInstance.currentPage()?.questions).toHaveLength(1);
    });

    it('shows each page in order with its title, one at a time', async () => {
      const { quiz, q1, q2 } = pagedQuiz();
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      expect(fixture.componentInstance.isPaginated()).toBe(true);
      expect(fixture.componentInstance.currentPage()?.title).toBe('Первая тема');
      expect(fixture.componentInstance.currentPage()?.questions.map((q) => q.id)).toEqual([q1]);
      expect(fixture.componentInstance.isFirstPage()).toBe(true);
      expect(fixture.componentInstance.isLastPage()).toBe(false);

      fixture.componentInstance.setText(q1, 'ответ');
      fixture.componentInstance.goToNextPage();
      await fixture.whenStable();

      expect(fixture.componentInstance.currentPage()?.title).toBe('Вторая тема');
      expect(fixture.componentInstance.currentPage()?.questions.map((q) => q.id)).toEqual([q2]);
      expect(fixture.componentInstance.isLastPage()).toBe(true);
    });

    it('blocks advancing to the next page until required questions on it are answered', async () => {
      const { quiz, q1 } = pagedQuiz();
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      fixture.componentInstance.goToNextPage();
      await fixture.whenStable();

      expect(fixture.componentInstance.currentPage()?.title).toBe('Первая тема');
      expect(fixture.componentInstance.validationErrors().has(q1)).toBe(true);

      fixture.componentInstance.setText(q1, 'ответ');
      fixture.componentInstance.goToNextPage();
      await fixture.whenStable();

      expect(fixture.componentInstance.currentPage()?.title).toBe('Вторая тема');
    });

    it('goes back to the previous page without validation', async () => {
      const { quiz, q1 } = pagedQuiz();
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      fixture.componentInstance.setText(q1, 'ответ');
      fixture.componentInstance.goToNextPage();
      await fixture.whenStable();
      expect(fixture.componentInstance.isFirstPage()).toBe(false);

      fixture.componentInstance.goToPreviousPage();
      await fixture.whenStable();

      expect(fixture.componentInstance.isFirstPage()).toBe(true);
    });

    it('jumps back to the page containing the first unanswered required question on submit', async () => {
      const { quiz, q1 } = pagedQuiz();
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      fixture.componentInstance.setText(q1, 'ответ');
      fixture.componentInstance.goToNextPage();
      await fixture.whenStable();
      expect(fixture.componentInstance.isLastPage()).toBe(true);

      // clear the first page's answer, then try to submit from the last page
      fixture.componentInstance.setText(q1, '');
      await fixture.componentInstance.submit();
      await fixture.whenStable();

      expect(fixture.componentInstance.submitted()).toBe(false);
      expect(fixture.componentInstance.currentPage()?.title).toBe('Первая тема');
      expect(fixture.componentInstance.validationErrors().has(q1)).toBe(true);
    });
  });

  describe('access control', () => {
    function unpublishedQuiz(): Quiz {
      let quiz = createQuiz('Черновик');
      quiz = addQuestion(quiz, 'text');
      quiz = {
        ...quiz,
        questions: quiz.questions.map((question) => ({ ...question, required: false })),
        settings: { isGraded: false, published: false },
      };
      return quiz;
    }

    it('blocks an unpublished quiz for a real attempt', async () => {
      const quiz = unpublishedQuiz();
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      expect(fixture.componentInstance.blockReason()).toBe('draft');

      await fixture.componentInstance.submit();
      await fixture.whenStable();
      expect(fixture.componentInstance.submitted()).toBe(false);
      expect(attemptRepository.attempts).toHaveLength(0);
    });

    it('lets a preview bypass the unpublished/expired/password gates', async () => {
      const quiz: Quiz = {
        ...unpublishedQuiz(),
        settings: {
          isGraded: false,
          published: false,
          expiresAt: '2020-01-01T00:00:00.000Z',
          accessPassword: 'secret',
        },
      };
      await TestBed.configureTestingModule({
        imports: [QuizRunner],
        providers: [
          provideRouter([]),
          provideTestTransloco(),
          { provide: QUIZ_REPOSITORY, useValue: quizRepository },
          { provide: ATTEMPT_REPOSITORY, useValue: attemptRepository },
        ],
      }).compileComponents();
      const fixture = TestBed.createComponent(QuizRunner);
      fixture.componentRef.setInput('previewQuiz', quiz);
      await fixture.whenStable();

      expect(fixture.componentInstance.blockReason()).toBeNull();
    });

    it('blocks a quiz once its deadline has passed', async () => {
      let quiz = unpublishedQuiz();
      quiz = {
        ...quiz,
        settings: { isGraded: false, expiresAt: '2020-01-01T00:00:00.000Z' },
      };
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      expect(fixture.componentInstance.blockReason()).toBe('expired');
    });

    it('requires the correct access password before the quiz is shown, and accepts it once entered', async () => {
      let quiz = unpublishedQuiz();
      quiz = { ...quiz, settings: { isGraded: false, accessPassword: 'secret' } };
      await quizRepository.save(quiz);
      const fixture = await createComponent(quiz.id);

      expect(fixture.componentInstance.blockReason()).toBe('locked');

      fixture.componentInstance.passwordInput.set('wrong');
      fixture.componentInstance.unlock();
      await fixture.whenStable();
      expect(fixture.componentInstance.blockReason()).toBe('locked');
      expect(fixture.componentInstance.passwordError()).toBeTruthy();

      fixture.componentInstance.passwordInput.set('secret');
      fixture.componentInstance.unlock();
      await fixture.whenStable();
      expect(fixture.componentInstance.blockReason()).toBeNull();
    });
  });
});
