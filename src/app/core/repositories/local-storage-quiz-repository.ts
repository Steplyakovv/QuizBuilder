import { Injectable } from '@angular/core';
import { Quiz } from '../models/quiz.models';
import { QuizRepository } from './quiz-repository';

const STORAGE_KEY = 'quiz-builder.quizzes';

@Injectable({ providedIn: 'root' })
export class LocalStorageQuizRepository implements QuizRepository {
  async getAll(): Promise<Quiz[]> {
    return this.readAll();
  }

  async getById(id: string): Promise<Quiz | undefined> {
    return this.readAll().find((quiz) => quiz.id === id);
  }

  async save(quiz: Quiz): Promise<void> {
    const quizzes = this.readAll();
    const index = quizzes.findIndex((existing) => existing.id === quiz.id);
    if (index === -1) {
      quizzes.push(quiz);
    } else {
      quizzes[index] = quiz;
    }
    this.writeAll(quizzes);
  }

  async delete(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((quiz) => quiz.id !== id));
  }

  private readAll(): Quiz[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Quiz[]) : [];
  }

  private writeAll(quizzes: Quiz[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  }
}
