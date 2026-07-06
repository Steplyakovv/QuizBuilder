import { QuizAttempt } from '../models/quiz.models';
import { AttemptRepository } from '../repositories/attempt-repository';

export class FakeAttemptRepository implements AttemptRepository {
  readonly attempts: QuizAttempt[] = [];

  async save(attempt: QuizAttempt): Promise<void> {
    this.attempts.push(attempt);
  }

  async getByQuizId(quizId: string): Promise<QuizAttempt[]> {
    return this.attempts.filter((attempt) => attempt.quizId === quizId);
  }
}
