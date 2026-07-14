import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { createQuiz } from '../../core/models/quiz.factory';
import { addQuestion } from '../../core/models/quiz-questions';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QUIZ_REPOSITORY } from '../../core/repositories/quiz-repository';
import { FakeAttemptRepository } from '../../core/testing/fake-attempt-repository';
import { FakeQuizRepository } from '../../core/testing/fake-quiz-repository';
import { provideTestTransloco } from '../../core/testing/provide-test-transloco';
import { QuizEditor } from './quiz-editor';

describe('QuizEditor', () => {
  let repository: FakeQuizRepository;

  async function createComponent(quizId: string) {
    await TestBed.configureTestingModule({
      imports: [QuizEditor],
      providers: [
        provideRouter([]),
        provideTestTransloco(),
        { provide: QUIZ_REPOSITORY, useValue: repository },
        { provide: ATTEMPT_REPOSITORY, useValue: new FakeAttemptRepository() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(QuizEditor);
    fixture.componentRef.setInput('id', quizId);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    repository = new FakeQuizRepository();
  });

  it('shows a not-found message for an unknown quiz id', async () => {
    const fixture = await createComponent('missing');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Опросник не найден');
  });

  it('renders the quiz once it is loaded', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);

    const fixture = await createComponent(quiz.id);

    expect(fixture.componentInstance.draft()?.title).toBe('Опрос про кофе');
    expect(fixture.componentInstance.dirty()).toBe(false);
  });

  it('edits the draft without persisting until save is called', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.updateTitle('Опрос про чай');
    await fixture.whenStable();

    expect(fixture.componentInstance.draft()?.title).toBe('Опрос про чай');
    expect(fixture.componentInstance.dirty()).toBe(true);
    expect((await repository.getById(quiz.id))?.title).toBe('Опрос про кофе');

    await fixture.componentInstance.save();
    await fixture.whenStable();

    expect(fixture.componentInstance.dirty()).toBe(false);
    expect((await repository.getById(quiz.id))?.title).toBe('Опрос про чай');
  });

  it('adds and removes a question in the draft', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.newQuestionType.set('text');
    fixture.componentInstance.addQuestion();
    await fixture.whenStable();

    expect(fixture.componentInstance.draft()?.questions).toHaveLength(1);
    const questionId = fixture.componentInstance.draft()!.questions[0].id;

    fixture.componentInstance.removeQuestion(questionId);
    await fixture.whenStable();

    expect(fixture.componentInstance.draft()?.questions).toHaveLength(0);
    expect((await repository.getById(quiz.id))?.questions).toHaveLength(0);
  });

  it('updates a question prompt in the draft', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.addQuestion();
    await fixture.whenStable();
    const questionId = fixture.componentInstance.draft()!.questions[0].id;

    fixture.componentInstance.updateQuestionPrompt(questionId, 'Как вас зовут?');
    await fixture.whenStable();

    expect(fixture.componentInstance.draft()?.questions[0].prompt).toBe('Как вас зовут?');
  });

  it('surfaces a quota-exceeded error without clearing the dirty draft', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    repository.save = () => Promise.reject(new DOMException('full', 'QuotaExceededError'));
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.updateTitle('Опрос про чай');
    await fixture.componentInstance.save();
    await fixture.whenStable();

    expect(fixture.componentInstance.saveError()).toContain('лимит хранилища браузера');
    expect(fixture.componentInstance.dirty()).toBe(true);
  });

  it('surfaces a generic error for other save failures', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    repository.save = () => Promise.reject(new Error('offline'));
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.updateTitle('Опрос про чай');
    await fixture.componentInstance.save();
    await fixture.whenStable();

    expect(fixture.componentInstance.saveError()).toBe(
      'Не удалось сохранить опросник. Попробуйте ещё раз.',
    );
  });

  it('clears a previous save error once the draft is edited again', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const originalSave = repository.save.bind(repository);
    repository.save = () => Promise.reject(new Error('offline'));
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.updateTitle('Опрос про чай');
    await fixture.componentInstance.save();
    await fixture.whenStable();
    expect(fixture.componentInstance.saveError()).not.toBeNull();

    repository.save = originalSave;
    fixture.componentInstance.updateTitle('Опрос про латте');
    await fixture.whenStable();

    expect(fixture.componentInstance.saveError()).toBeNull();
  });

  it('blocks the browser tab from closing while there are unsaved changes', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    const cleanEvent = { preventDefault: vi.fn() } as unknown as BeforeUnloadEvent;
    fixture.componentInstance.onBeforeUnload(cleanEvent);
    expect(cleanEvent.preventDefault).not.toHaveBeenCalled();

    fixture.componentInstance.updateTitle('Опрос про чай');
    await fixture.whenStable();

    const dirtyEvent = { preventDefault: vi.fn() } as unknown as BeforeUnloadEvent;
    fixture.componentInstance.onBeforeUnload(dirtyEvent);
    expect(dirtyEvent.preventDefault).toHaveBeenCalled();
  });

  it('toggles an inline preview reflecting the current draft', async () => {
    let quiz = createQuiz('Опрос про кофе');
    quiz = addQuestion(quiz, 'text');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    expect(fixture.componentInstance.previewing()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-quiz-runner')).toBeNull();

    fixture.componentInstance.updateTitle('Опрос про латте');
    fixture.componentInstance.togglePreview();
    await fixture.whenStable();

    expect(fixture.componentInstance.previewing()).toBe(true);
    const runnerHost = fixture.nativeElement.querySelector('app-quiz-runner') as HTMLElement;
    expect(runnerHost).not.toBeNull();
    expect(runnerHost.textContent).toContain('Опрос про латте');

    fixture.componentInstance.togglePreview();
    await fixture.whenStable();

    expect(fixture.componentInstance.previewing()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-quiz-runner')).toBeNull();
  });

  it('reorders questions on drop', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.addQuestion();
    fixture.componentInstance.newQuestionType.set('single-choice');
    fixture.componentInstance.addQuestion();
    await fixture.whenStable();
    const ids = fixture.componentInstance.draft()!.questions.map((question) => question.id);

    fixture.componentInstance.drop({
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<unknown>);
    await fixture.whenStable();

    expect(fixture.componentInstance.draft()!.questions.map((question) => question.id)).toEqual([
      ids[1],
      ids[0],
    ]);
  });

  it('moves a question to a manually entered position', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.addQuestion();
    fixture.componentInstance.addQuestion();
    fixture.componentInstance.addQuestion();
    await fixture.whenStable();
    const ids = fixture.componentInstance.draft()!.questions.map((question) => question.id);

    fixture.componentInstance.updateQuestionOrder(ids[2], '1');
    await fixture.whenStable();

    expect(fixture.componentInstance.draft()!.questions.map((question) => question.id)).toEqual([
      ids[2],
      ids[0],
      ids[1],
    ]);
  });

  it('clamps a manually entered position to the valid range and ignores invalid input', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.addQuestion();
    fixture.componentInstance.addQuestion();
    await fixture.whenStable();
    const ids = fixture.componentInstance.draft()!.questions.map((question) => question.id);

    fixture.componentInstance.updateQuestionOrder(ids[0], '99');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.questions.map((question) => question.id)).toEqual([
      ids[1],
      ids[0],
    ]);

    fixture.componentInstance.updateQuestionOrder(ids[0], 'abc');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.questions.map((question) => question.id)).toEqual([
      ids[1],
      ids[0],
    ]);
  });

  it('adds, renames and removes a page, unassigning its questions', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.addQuestion();
    await fixture.whenStable();
    const questionId = fixture.componentInstance.draft()!.questions[0].id;

    fixture.componentInstance.newPageTitle.set('Вступление');
    fixture.componentInstance.addPage();
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.pages).toHaveLength(1);
    const pageId = fixture.componentInstance.draft()!.pages![0].id;

    fixture.componentInstance.updateQuestionPage(questionId, pageId);
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.questions[0].pageId).toBe(pageId);

    fixture.componentInstance.renamePage(pageId, 'Введение');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.pages![0].title).toBe('Введение');

    fixture.componentInstance.removePage(pageId);
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.pages).toHaveLength(0);
    expect(fixture.componentInstance.draft()!.questions[0].pageId).toBeUndefined();
  });

  it('toggles the published flag, access password and expiry date', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.updatePublished(false);
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.settings.published).toBe(false);

    fixture.componentInstance.updateAccessPassword('  secret  ');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.settings.accessPassword).toBe('secret');

    fixture.componentInstance.updateAccessPassword('  ');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.settings.accessPassword).toBeUndefined();

    fixture.componentInstance.updateExpiresAt('2026-08-01T10:30');
    await fixture.whenStable();
    const draft = fixture.componentInstance.draft()!;
    expect(draft.settings.expiresAt).toBe(new Date('2026-08-01T10:30').toISOString());
    expect(fixture.componentInstance.expiresAtInputValue(draft)).toBe('2026-08-01T10:30');

    fixture.componentInstance.updateExpiresAt('');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.settings.expiresAt).toBeUndefined();

    fixture.componentInstance.updateWebhookUrl('  https://example.com/hook  ');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.settings.webhookUrl).toBe('https://example.com/hook');

    fixture.componentInstance.updateWebhookUrl('  ');
    await fixture.whenStable();
    expect(fixture.componentInstance.draft()!.settings.webhookUrl).toBeUndefined();
  });
});
