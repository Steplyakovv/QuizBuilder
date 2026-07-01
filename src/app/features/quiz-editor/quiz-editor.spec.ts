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

    expect(fixture.componentInstance.quiz()?.title).toBe('Опрос про кофе');
  });

  it('updates the quiz title', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    await fixture.componentInstance.updateTitle(quiz, 'Опрос про чай');
    await fixture.whenStable();

    expect(fixture.componentInstance.quiz()?.title).toBe('Опрос про чай');
  });

  it('adds and removes a question', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    fixture.componentInstance.newQuestionType.set('text');
    await fixture.componentInstance.addQuestion(fixture.componentInstance.quiz()!);
    await fixture.whenStable();

    expect(fixture.componentInstance.quiz()?.questions).toHaveLength(1);
    const questionId = fixture.componentInstance.quiz()!.questions[0].id;

    await fixture.componentInstance.removeQuestion(fixture.componentInstance.quiz()!, questionId);
    await fixture.whenStable();

    expect(fixture.componentInstance.quiz()?.questions).toHaveLength(0);
  });

  it('updates a question prompt', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    await fixture.componentInstance.addQuestion(fixture.componentInstance.quiz()!);
    await fixture.whenStable();
    const questionId = fixture.componentInstance.quiz()!.questions[0].id;

    await fixture.componentInstance.updateQuestionPrompt(
      fixture.componentInstance.quiz()!,
      questionId,
      'Как вас зовут?',
    );
    await fixture.whenStable();

    expect(fixture.componentInstance.quiz()?.questions[0].prompt).toBe('Как вас зовут?');
  });

  it('reorders questions on drop', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);
    const fixture = await createComponent(quiz.id);

    await fixture.componentInstance.addQuestion(fixture.componentInstance.quiz()!);
    fixture.componentInstance.newQuestionType.set('single-choice');
    await fixture.componentInstance.addQuestion(fixture.componentInstance.quiz()!);
    await fixture.whenStable();
    const ids = fixture.componentInstance.quiz()!.questions.map((question) => question.id);

    await fixture.componentInstance.drop(fixture.componentInstance.quiz()!, {
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<unknown>);
    await fixture.whenStable();

    expect(fixture.componentInstance.quiz()!.questions.map((question) => question.id)).toEqual([
      ids[1],
      ids[0],
    ]);
  });
});
