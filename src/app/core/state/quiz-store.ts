import { Injectable, computed, inject, signal } from '@angular/core';
import { createQuiz } from '../models/quiz.factory';
import { Quiz } from '../models/quiz.models';
import { isQuizTitleValid } from '../models/quiz.validation';
import { QUIZ_REPOSITORY } from '../repositories/quiz-repository';
import { createId } from '../utils/id';

@Injectable({ providedIn: 'root' })
export class QuizStore {
  private readonly repository = inject(QUIZ_REPOSITORY);

  private readonly quizzesState = signal<Quiz[]>([]);
  private readonly loadedState = signal(false);

  readonly quizzes = this.quizzesState.asReadonly();
  readonly loaded = this.loadedState.asReadonly();

  async load(): Promise<void> {
    const quizzes = await this.repository.getAll();
    this.quizzesState.set(quizzes);
    this.loadedState.set(true);
  }

  quizById(id: string) {
    return computed(() => this.quizzesState().find((quiz) => quiz.id === id));
  }

  async create(title: string): Promise<Quiz> {
    if (!isQuizTitleValid(title)) {
      throw new Error('Quiz title must not be empty');
    }
    const quiz = createQuiz(title);
    await this.repository.save(quiz);
    this.quizzesState.update((quizzes) => [...quizzes, quiz]);
    return quiz;
  }

  async update(quiz: Quiz): Promise<void> {
    if (!isQuizTitleValid(quiz.title)) {
      throw new Error('Quiz title must not be empty');
    }
    const updated: Quiz = { ...quiz, updatedAt: new Date().toISOString() };
    await this.repository.save(updated);
    this.quizzesState.update((quizzes) =>
      quizzes.map((existing) => (existing.id === updated.id ? updated : existing)),
    );
  }

  async duplicate(id: string): Promise<Quiz | undefined> {
    const source = this.quizzesState().find((quiz) => quiz.id === id);
    if (!source) {
      return undefined;
    }
    const now = new Date().toISOString();
    const copy: Quiz = {
      ...structuredClone(source),
      id: createId(),
      title: `${source.title} (копия)`,
      createdAt: now,
      updatedAt: now,
    };
    await this.repository.save(copy);
    this.quizzesState.update((quizzes) => [...quizzes, copy]);
    return copy;
  }

  async import(quiz: Quiz): Promise<void> {
    await this.repository.save(quiz);
    this.quizzesState.update((quizzes) => [...quizzes, quiz]);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
    this.quizzesState.update((quizzes) => quizzes.filter((quiz) => quiz.id !== id));
  }
}
