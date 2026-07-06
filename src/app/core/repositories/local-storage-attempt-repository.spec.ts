import { QuizAttempt } from '../models/quiz.models';
import { LocalStorageAttemptRepository } from './local-storage-attempt-repository';

function createAttempt(id: string): QuizAttempt {
  return {
    id,
    quizId: 'quiz1',
    startedAt: '2026-01-01T00:00:00.000Z',
    completedAt: '2026-01-01T00:01:00.000Z',
    responses: [{ questionId: 'q1', selectedOptionIds: ['o1'] }],
    score: 1,
  };
}

describe('LocalStorageAttemptRepository', () => {
  let repository: LocalStorageAttemptRepository;

  beforeEach(() => {
    localStorage.clear();
    repository = new LocalStorageAttemptRepository();
  });

  function readStored(): QuizAttempt[] {
    return JSON.parse(localStorage.getItem('quiz-builder.attempts') ?? '[]') as QuizAttempt[];
  }

  it('stores nothing until an attempt is saved', () => {
    expect(readStored()).toEqual([]);
  });

  it('appends a saved attempt to storage', async () => {
    const attempt = createAttempt('a1');
    await repository.save(attempt);

    expect(readStored()).toEqual([attempt]);
  });

  it('keeps previously saved attempts when saving another one', async () => {
    await repository.save(createAttempt('a1'));
    await repository.save(createAttempt('a2'));

    expect(readStored().map((attempt) => attempt.id)).toEqual(['a1', 'a2']);
  });
});
