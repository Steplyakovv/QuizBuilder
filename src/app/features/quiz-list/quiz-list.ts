import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Quiz } from '../../core/models/quiz.models';
import { QuizStore } from '../../core/state/quiz-store';

@Component({
  selector: 'app-quiz-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.scss',
})
export class QuizList {
  private readonly store = inject(QuizStore);

  readonly quizzes = this.store.quizzes;

  readonly newQuizTitle = signal('');
  readonly editingQuizId = signal<string | null>(null);
  readonly editingTitle = signal('');

  constructor() {
    void this.store.load();
  }

  async createQuiz(): Promise<void> {
    const title = this.newQuizTitle().trim();
    if (!title) {
      return;
    }
    await this.store.create(title);
    this.newQuizTitle.set('');
  }

  startRename(quiz: Quiz): void {
    this.editingQuizId.set(quiz.id);
    this.editingTitle.set(quiz.title);
  }

  cancelRename(): void {
    this.editingQuizId.set(null);
  }

  async confirmRename(quiz: Quiz): Promise<void> {
    if (this.editingQuizId() !== quiz.id) {
      return;
    }
    const title = this.editingTitle().trim();
    this.editingQuizId.set(null);
    if (!title || title === quiz.title) {
      return;
    }
    await this.store.update({ ...quiz, title });
  }

  async duplicateQuiz(id: string): Promise<void> {
    await this.store.duplicate(id);
  }

  async deleteQuiz(quiz: Quiz): Promise<void> {
    if (!confirm(`Удалить опросник «${quiz.title}»?`)) {
      return;
    }
    await this.store.remove(quiz.id);
  }
}
