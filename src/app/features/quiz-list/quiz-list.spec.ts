import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { QUIZ_REPOSITORY } from '../../core/repositories/quiz-repository';
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

  it('ignores creating a quiz with a blank title', async () => {
    const fixture = await createComponent();

    fixture.componentInstance.newQuizTitle.set('   ');
    await fixture.componentInstance.createQuiz();
    await fixture.whenStable();

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
