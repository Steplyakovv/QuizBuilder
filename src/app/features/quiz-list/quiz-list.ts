import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { exportQuizToJson, parseImportedQuiz } from '../../core/models/quiz-io';
import { Quiz } from '../../core/models/quiz.models';
import { AuthStore } from '../../core/state/auth-store';
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
    MatPaginatorModule,
  ],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.scss',
})
export class QuizList {
  private readonly store = inject(QuizStore);
  private readonly auth = inject(AuthStore);

  readonly quizzes = this.store.quizzes;
  readonly isAdmin = this.auth.isAdmin;

  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly pageSize = signal(10);
  private readonly requestedPageIndex = signal(0);
  readonly pageIndex = computed(() => {
    const pageCount = Math.max(1, Math.ceil(this.quizzes().length / this.pageSize()));
    return Math.min(this.requestedPageIndex(), pageCount - 1);
  });
  readonly pagedQuizzes = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.quizzes().slice(start, start + this.pageSize());
  });

  readonly newQuizTitle = signal('');
  readonly newQuizError = signal<string | null>(null);
  readonly editingQuizId = signal<string | null>(null);
  readonly editingTitle = signal('');
  readonly importError = signal<string | null>(null);

  constructor() {
    void this.store.load();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.requestedPageIndex.set(event.pageIndex);
  }

  async createQuiz(): Promise<void> {
    const title = this.newQuizTitle().trim();
    if (!title) {
      this.newQuizError.set('Введите название опросника.');
      return;
    }
    this.newQuizError.set(null);
    await this.store.create(title);
    this.newQuizTitle.set('');
  }

  exportQuiz(quiz: Quiz): void {
    const json = exportQuizToJson(quiz);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${quiz.title || 'quiz'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.importError.set(null);
    try {
      const json = await file.text();
      const quiz = parseImportedQuiz(json);
      await this.store.import(quiz);
    } catch (error) {
      this.importError.set(
        error instanceof Error ? error.message : 'Не удалось импортировать опросник.',
      );
    }
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

  logout(): void {
    this.auth.logout();
  }
}
