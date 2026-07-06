import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { createQuiz } from '../../core/models/quiz.factory';
import { QUIZ_REPOSITORY } from '../../core/repositories/quiz-repository';
import { FakeQuizRepository } from '../../core/testing/fake-quiz-repository';
import { QuizEditor } from './quiz-editor';

describe('QuizEditor', () => {
  let repository: FakeQuizRepository;

  async function createComponent(quizId: string) {
    await TestBed.configureTestingModule({
      imports: [QuizEditor],
      providers: [provideRouter([]), { provide: QUIZ_REPOSITORY, useValue: repository }],
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
});
