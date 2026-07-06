import { Injectable } from '@angular/core';
import { QuizAttempt } from '../models/quiz.models';
import { AttemptRepository } from './attempt-repository';

const STORAGE_KEY = 'quiz-builder.attempts';

@Injectable({ providedIn: 'root' })
export class LocalStorageAttemptRepository implements AttemptRepository {
  async save(attempt: QuizAttempt): Promise<void> {
    const attempts = this.readAll();
    attempts.push(attempt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  }

  async getByQuizId(quizId: string): Promise<QuizAttempt[]> {
    return this.readAll().filter((attempt) => attempt.quizId === quizId);
  }

  private readAll(): QuizAttempt[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
  }
}
