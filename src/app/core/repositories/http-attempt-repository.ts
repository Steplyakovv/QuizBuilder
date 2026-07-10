import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api-url';
import { QuizAttempt } from '../models/quiz.models';
import { AttemptRepository } from './attempt-repository';

@Injectable({ providedIn: 'root' })
export class HttpAttemptRepository implements AttemptRepository {
  private readonly http = inject(HttpClient);

  async save(attempt: QuizAttempt): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(`${API_BASE_URL}/quizzes/${attempt.quizId}/attempts`, attempt, {
        withCredentials: true,
      }),
    );
  }

  async getByQuizId(quizId: string): Promise<QuizAttempt[]> {
    return firstValueFrom(
      this.http.get<QuizAttempt[]>(`${API_BASE_URL}/quizzes/${quizId}/attempts`, {
        withCredentials: true,
      }),
    );
  }
}
