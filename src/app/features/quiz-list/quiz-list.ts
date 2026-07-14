import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslocoService, translateSignal } from '@jsverse/transloco';
import { isQuizPublished } from '../../core/models/quiz-access';
import { exportQuizToJson, parseImportedQuiz } from '../../core/models/quiz-io';
import { Quiz } from '../../core/models/quiz.models';
import { AuthStore } from '../../core/state/auth-store';
import { QuizStore } from '../../core/state/quiz-store';
import { localizedPaginatorIntl } from '../../core/utils/localized-paginator-intl';

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
  providers: [{ provide: MatPaginatorIntl, useFactory: localizedPaginatorIntl }],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.scss',
})
export class QuizList {
  private readonly store = inject(QuizStore);
  private readonly auth = inject(AuthStore);
  private readonly transloco = inject(TranslocoService);

  readonly quizzes = this.store.quizzes;
  readonly isAdmin = this.auth.isAdmin;

  protected readonly titleLabel = translateSignal('quizList.title');
  protected readonly loggedInAsAdminLabel = translateSignal('quizList.loggedInAsAdmin');
  protected readonly settingsTitleLabel = translateSignal('quizList.settingsTitle');
  protected readonly logoutLabel = translateSignal('quizList.logout');
  protected readonly loginAsAdminLabel = translateSignal('quizList.loginAsAdmin');
  protected readonly newQuizNameLabel = translateSignal('quizList.newQuizNameLabel');
  protected readonly newQuizPlaceholderLabel = translateSignal('quizList.newQuizPlaceholder');
  protected readonly createLabel = translateSignal('quizList.create');
  protected readonly importLabel = translateSignal('quizList.import');
  protected readonly emptyStateAdminLabel = translateSignal('quizList.emptyStateAdmin');
  protected readonly emptyStateLabel = translateSignal('quizList.emptyState');
  protected readonly openEditorTitleLabel = translateSignal('quizList.openEditorTitle');
  protected readonly draftBadgeLabel = translateSignal('quizList.draftBadge');
  protected readonly takeQuizLabel = translateSignal('quizList.takeQuiz');
  protected readonly resultsLabel = translateSignal('quizList.results');
  protected readonly exportJsonLabel = translateSignal('quizList.exportJson');
  protected readonly renameLabel = translateSignal('quizList.rename');
  protected readonly duplicateLabel = translateSignal('quizList.duplicate');
  protected readonly deleteLabel = translateSignal('quizList.delete');

  /** Non-admins only ever see published quizzes; admins see everything, including drafts. */
  readonly visibleQuizzes = computed(() => {
    const all = this.quizzes();
    return this.isAdmin() ? all : all.filter((quiz) => isQuizPublished(quiz));
  });

  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly pageSize = signal(10);
  private readonly requestedPageIndex = signal(0);
  readonly pageIndex = computed(() => {
    const pageCount = Math.max(1, Math.ceil(this.visibleQuizzes().length / this.pageSize()));
    return Math.min(this.requestedPageIndex(), pageCount - 1);
  });
  readonly pagedQuizzes = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.visibleQuizzes().slice(start, start + this.pageSize());
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

  questionsCountLabel(count: number): string {
    return this.transloco.translate('quizList.questionsCount', { count });
  }

  async createQuiz(): Promise<void> {
    const title = this.newQuizTitle().trim();
    if (!title) {
      this.newQuizError.set(this.transloco.translate('quizList.emptyTitleError'));
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
      const quiz = parseImportedQuiz(json, (key) => this.transloco.translate(key));
      await this.store.import(quiz);
    } catch (error) {
      this.importError.set(
        error instanceof Error
          ? error.message
          : this.transloco.translate('quizList.importGenericError'),
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

  isPublished(quiz: Quiz): boolean {
    return isQuizPublished(quiz);
  }

  async duplicateQuiz(id: string): Promise<void> {
    await this.store.duplicate(id);
  }

  async deleteQuiz(quiz: Quiz): Promise<void> {
    const message = this.transloco.translate('quizList.deleteConfirm', { title: quiz.title });
    if (!confirm(message)) {
      return;
    }
    await this.store.remove(quiz.id);
  }

  logout(): void {
    this.auth.logout();
  }
}
