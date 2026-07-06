import { InjectionToken } from '@angular/core';
import { QuizAttempt } from '../models/quiz.models';

export interface AttemptRepository {
  save(attempt: QuizAttempt): Promise<void>;
  getByQuizId(quizId: string): Promise<QuizAttempt[]>;
}

export const ATTEMPT_REPOSITORY = new InjectionToken<AttemptRepository>('ATTEMPT_REPOSITORY');
