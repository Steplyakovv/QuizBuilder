import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api-url';
import { Quiz } from '../models/quiz.models';
import { QuizRepository } from './quiz-repository';

@Injectable({ providedIn: 'root' })
export class HttpQuizRepository implements QuizRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/quizzes`;

  async getAll(): Promise<Quiz[]> {
    return firstValueFrom(this.http.get<Quiz[]>(this.baseUrl, { withCredentials: true }));
  }

  async getById(id: string): Promise<Quiz | undefined> {
    try {
      return await firstValueFrom(
        this.http.get<Quiz>(`${this.baseUrl}/${id}`, { withCredentials: true }),
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return undefined;
      }
      throw error;
    }
  }

  async save(quiz: Quiz): Promise<void> {
    await firstValueFrom(
      this.http.put<void>(`${this.baseUrl}/${quiz.id}`, quiz, { withCredentials: true }),
    );
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${id}`, { withCredentials: true }),
    );
  }
}
