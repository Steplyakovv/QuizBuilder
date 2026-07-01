import { TestBed } from '@angular/core/testing';
import { Quiz } from '../models/quiz.models';
import { QuizRepository, QUIZ_REPOSITORY } from '../repositories/quiz-repository';
import { QuizStore } from './quiz-store';

class FakeQuizRepository implements QuizRepository {
  private quizzes: Quiz[] = [];

  async getAll(): Promise<Quiz[]> {
    return [...this.quizzes];
  }

  async getById(id: string): Promise<Quiz | undefined> {
    return this.quizzes.find((quiz) => quiz.id === id);
  }

  async save(quiz: Quiz): Promise<void> {
    const index = this.quizzes.findIndex((existing) => existing.id === quiz.id);
    if (index === -1) {
      this.quizzes.push(quiz);
    } else {
      this.quizzes[index] = quiz;
    }
  }

  async delete(id: string): Promise<void> {
    this.quizzes = this.quizzes.filter((quiz) => quiz.id !== id);
  }
}

describe('QuizStore', () => {
  let store: QuizStore;
  let repository: FakeQuizRepository;

  beforeEach(() => {
    repository = new FakeQuizRepository();
    TestBed.configureTestingModule({
      providers: [{ provide: QUIZ_REPOSITORY, useValue: repository }],
    });
    store = TestBed.inject(QuizStore);
  });

  it('starts empty and not loaded', () => {
    expect(store.quizzes()).toEqual([]);
    expect(store.loaded()).toBe(false);
  });

  it('loads quizzes from the repository', async () => {
    const quiz = { id: '1', title: 'Опрос' } as Quiz;
    await repository.save(quiz);

    await store.load();

    expect(store.quizzes()).toEqual([quiz]);
    expect(store.loaded()).toBe(true);
  });

  it('creates a quiz, persists it and adds it to state', async () => {
    const quiz = await store.create('Опрос про кофе');

    expect(store.quizzes()).toContainEqual(quiz);
    expect(await repository.getById(quiz.id)).toEqual(quiz);
  });

  it('rejects creating a quiz with an empty title', async () => {
    await expect(store.create('   ')).rejects.toThrow();
    expect(store.quizzes()).toEqual([]);
  });

  it('updates a quiz in place, keeping createdAt but refreshing updatedAt', async () => {
    const quiz = await store.create('Опрос про кофе');

    await store.update({ ...quiz, title: 'Опрос про чай' });

    const updated = store.quizById(quiz.id)();
    expect(updated?.title).toBe('Опрос про чай');
    expect(updated?.createdAt).toBe(quiz.createdAt);
    expect(updated?.updatedAt).toBeTruthy();
    expect(await repository.getAll()).toHaveLength(1);
  });

  it('duplicates a quiz with a new id and title suffix', async () => {
    const quiz = await store.create('Опрос про кофе');

    const copy = await store.duplicate(quiz.id);

    expect(copy).toBeDefined();
    expect(copy?.id).not.toBe(quiz.id);
    expect(copy?.title).toBe('Опрос про кофе (копия)');
    expect(store.quizzes()).toHaveLength(2);
  });

  it('returns undefined when duplicating a quiz that does not exist', async () => {
    expect(await store.duplicate('missing')).toBeUndefined();
  });

  it('removes a quiz from state and repository', async () => {
    const quiz = await store.create('Опрос про кофе');

    await store.remove(quiz.id);

    expect(store.quizzes()).toEqual([]);
    expect(await repository.getById(quiz.id)).toBeUndefined();
  });
});
