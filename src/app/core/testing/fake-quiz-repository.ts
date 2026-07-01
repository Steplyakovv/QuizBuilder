import { Quiz } from '../models/quiz.models';
import { QuizRepository } from '../repositories/quiz-repository';

export class FakeQuizRepository implements QuizRepository {
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
