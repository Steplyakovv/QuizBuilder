import { createQuiz } from '../models/quiz.factory';
import { LocalStorageQuizRepository } from './local-storage-quiz-repository';

describe('LocalStorageQuizRepository', () => {
  let repository: LocalStorageQuizRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageQuizRepository();
  });

  it('returns an empty list when nothing was saved yet', async () => {
    expect(await repository.getAll()).toEqual([]);
  });

  it('saves a quiz and returns it from getAll/getById', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);

    expect(await repository.getAll()).toEqual([quiz]);
    expect(await repository.getById(quiz.id)).toEqual(quiz);
  });

  it('overwrites an existing quiz with the same id instead of duplicating it', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);

    const renamed = { ...quiz, title: 'Опрос про чай' };
    await repository.save(renamed);

    const all = await repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Опрос про чай');
  });

  it('deletes a quiz by id', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);

    await repository.delete(quiz.id);

    expect(await repository.getAll()).toEqual([]);
    expect(await repository.getById(quiz.id)).toBeUndefined();
  });

  it('persists data across repository instances (same localStorage)', async () => {
    const quiz = createQuiz('Опрос про кофе');
    await repository.save(quiz);

    const anotherRepository = new LocalStorageQuizRepository();
    expect(await anotherRepository.getAll()).toEqual([quiz]);
  });
});
