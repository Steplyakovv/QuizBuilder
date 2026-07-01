import { InjectionToken } from '@angular/core';
import { Quiz } from '../models/quiz.models';

export interface QuizRepository {
  getAll(): Promise<Quiz[]>;
  getById(id: string): Promise<Quiz | undefined>;
  save(quiz: Quiz): Promise<void>;
  delete(id: string): Promise<void>;
}

export const QUIZ_REPOSITORY = new InjectionToken<QuizRepository>('QUIZ_REPOSITORY');
