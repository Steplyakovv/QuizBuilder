import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { exportQuizToJson } from '../../core/models/quiz-io';
import { createQuiz } from '../../core/models/quiz.factory';
import { QUIZ_REPOSITORY } from '../../core/repositories/quiz-repository';
import { AuthStore } from '../../core/state/auth-store';
import { FakeQuizRepository } from '../../core/testing/fake-quiz-repository';
import { QuizList } from './quiz-list';

describe('QuizList', () => {
  let repository: FakeQuizRepository;

  async function createComponent() {
    repository = new FakeQuizRepository();
    await TestBed.configureTestingModule({
      imports: [QuizList],
      providers: [provideRouter([]), { provide: QUIZ_REPOSITORY, useValue: repository }],
    }).compileComponents();

    const fixture = TestBed.createComponent(QuizList);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('hides quiz management controls from a non-admin', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Название нового опросника');
    expect(fixture.nativeElement.querySelector('[aria-label="Удалить"]')).toBeNull();
  });

  it('shows quiz management controls to an admin', async () => {
    const fixture = await createComponent();
    TestBed.inject(AuthStore).login('admin', 'admin');
    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[aria-label="Удалить"]')).not.toBeNull();
  });

  it('shows an empty state when there are no quizzes', async () => {
    const fixture = await createComponent();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Опросников пока нет');
  });

  it('creates a quiz from the inline form', async () => {
    const fixture = await createComponent();

    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();

    expect(fixture.componentInstance.quizzes()).toHaveLength(1);
    expect(fixture.componentInstance.quizzes()[0].title).toBe('Опрос про кофе');
    expect(fixture.componentInstance.newQuizTitle()).toBe('');
  });

  it('ignores creating a quiz with a blank title and shows a validation message', async () => {
    const fixture = await createComponent();

    fixture.componentInstance.newQuizTitle.set('   ');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();

    expect(fixture.componentInstance.quizzes()).toHaveLength(0);
    expect(fixture.componentInstance.newQuizError()).toBeTruthy();
  });

  it('exports a quiz as a downloadable JSON file', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();
    const quiz = fixture.componentInstance.quizzes()[0];

    const createObjectURL = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const element = originalCreateElement(tag);
      if (tag === 'a') {
        element.click = clickSpy;
      }
      return element;
    });

    fixture.componentInstance.exportQuiz(quiz);

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('imports a quiz from a selected JSON file', async () => {
    const fixture = await createComponent();
    TestBed.inject(AuthStore).login('admin', 'admin');
    const imported = createQuiz('Импортированный опрос');
    const file = new File([exportQuizToJson(imported)], 'quiz.json', {
      type: 'application/json',
    });
    const input = { files: [file], value: 'quiz.json' } as unknown as HTMLInputElement;

    await fixture.componentInstance.onImportFileSelected({ target: input } as unknown as Event);
    await fixture.whenStable();

    expect(fixture.componentInstance.quizzes()).toHaveLength(1);
    expect(fixture.componentInstance.quizzes()[0].title).toBe('Импортированный опрос');
    expect(input.value).toBe('');
  });

  it('surfaces an error when the imported file is not a valid quiz', async () => {
    const fixture = await createComponent();
    const file = new File(['not json'], 'quiz.json', { type: 'application/json' });
    const input = { files: [file], value: 'quiz.json' } as unknown as HTMLInputElement;

    await fixture.componentInstance.onImportFileSelected({ target: input } as unknown as Event);
    await fixture.whenStable();

    expect(fixture.componentInstance.importError()).toBeTruthy();
    expect(fixture.componentInstance.quizzes()).toHaveLength(0);
  });

  it('renames a quiz', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();
    const created = fixture.componentInstance.quizzes()[0];

    fixture.componentInstance.startRename(created);
    fixture.componentInstance.editingTitle.set('Опрос про чай');
    await fixture.componentInstance.confirmRename(created);
    await fixture.whenStable();

    expect(fixture.componentInstance.quizzes()[0].title).toBe('Опрос про чай');
  });

  it('duplicates a quiz', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();
    const created = fixture.componentInstance.quizzes()[0];

    await fixture.componentInstance.duplicateQuiz(created.id);
    await fixture.whenStable();

    expect(fixture.componentInstance.quizzes()).toHaveLength(2);
  });

  it('deletes a quiz after confirmation', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();
    const created = fixture.componentInstance.quizzes()[0];

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await fixture.componentInstance.deleteQuiz(created);
    await fixture.whenStable();

    expect(fixture.componentInstance.quizzes()).toHaveLength(0);
  });

  it('keeps a quiz when deletion is not confirmed', async () => {
    const fixture = await createComponent();
    fixture.componentInstance.newQuizTitle.set('Опрос про кофе');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();
    const created = fixture.componentInstance.quizzes()[0];

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await fixture.componentInstance.deleteQuiz(created);
    await fixture.whenStable();

    expect(fixture.componentInstance.quizzes()).toHaveLength(1);
  });
});
