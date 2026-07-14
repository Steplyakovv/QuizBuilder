import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { formatResponse } from '../../core/models/quiz-attempt';
import { exportAttemptsToCsv } from '../../core/models/quiz-attempts-io';
import { QuestionStat, questionStatistics } from '../../core/models/question-statistics';
import {
  AttemptScore,
  formatCorrectAnswer,
  hasCorrectAnswer,
  isCorrect,
  scoreAttempt,
} from '../../core/models/quiz-scoring';
import { Question, Quiz, QuizAttempt } from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QuizStore } from '../../core/state/quiz-store';
import { ruPaginatorIntl } from '../../core/utils/ru-paginator-intl';

type SortField = 'date' | 'score';

/** Excel only auto-detects UTF-8 CSVs when a byte-order mark leads the file. */
const csvBom = '﻿';

@Component({
  selector: 'app-quiz-results',
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
  ],
  providers: [{ provide: MatPaginatorIntl, useFactory: ruPaginatorIntl }],
  templateUrl: './quiz-results.html',
  styleUrl: './quiz-results.scss',
})
export class QuizResults {
  private readonly store = inject(QuizStore);
  private readonly attemptRepository = inject(ATTEMPT_REPOSITORY);

  readonly id = input.required<string>();
  readonly quiz = computed(() => this.store.quizzes().find((quiz) => quiz.id === this.id()));

  readonly attempts = signal<QuizAttempt[]>([]);
  readonly stats = computed(() => {
    const quiz = this.quiz();
    return quiz ? questionStatistics(quiz, this.attempts()) : [];
  });

  readonly respondentFilter = signal('');
  readonly sortField = signal<SortField>('date');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');

  readonly filteredAttempts = computed(() => {
    const filter = this.respondentFilter().trim().toLowerCase();
    const matching = filter
      ? this.attempts().filter((attempt) =>
          (attempt.respondentName ?? 'Аноним').toLowerCase().includes(filter),
        )
      : this.attempts();

    const field = this.sortField();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    return [...matching].sort((a, b) => {
      if (field === 'score') {
        const scoreA = this.scoreFor(a)?.correct ?? -1;
        const scoreB = this.scoreFor(b)?.correct ?? -1;
        return (scoreA - scoreB) * dir;
      }
      const dateA = new Date(a.completedAt ?? a.startedAt).getTime();
      const dateB = new Date(b.completedAt ?? b.startedAt).getTime();
      return (dateA - dateB) * dir;
    });
  });

  readonly pageSizeOptions = [5, 10, 25, 50];
  readonly pageSize = signal(10);
  private readonly requestedPageIndex = signal(0);
  readonly pageIndex = computed(() => {
    const pageCount = Math.max(1, Math.ceil(this.filteredAttempts().length / this.pageSize()));
    return Math.min(this.requestedPageIndex(), pageCount - 1);
  });
  readonly pagedAttempts = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredAttempts().slice(start, start + this.pageSize());
  });

  readonly expandedAttemptId = signal<string | null>(null);

  constructor() {
    void this.store.load();
    effect(() => {
      const quizId = this.id();
      void this.attemptRepository
        .getByQuizId(quizId)
        .then((attempts) => this.attempts.set(attempts));
    });
  }

  private effectiveQuiz(attempt: QuizAttempt): Quiz | undefined {
    return attempt.quizSnapshot ?? this.quiz();
  }

  scoreFor(attempt: QuizAttempt): AttemptScore | undefined {
    const quiz = this.effectiveQuiz(attempt);
    return quiz ? scoreAttempt(quiz, attempt.responses) : undefined;
  }

  questionsFor(attempt: QuizAttempt): Question[] {
    return this.effectiveQuiz(attempt)?.questions ?? [];
  }

  questionById(questionId: string): Question | undefined {
    return this.quiz()?.questions.find((question) => question.id === questionId);
  }

  percentCorrect(stat: QuestionStat): number {
    return stat.total === 0 ? 0 : (stat.correct / stat.total) * 100;
  }

  answerFor(attempt: QuizAttempt, question: Question): string {
    return formatResponse(
      question,
      attempt.responses.find((response) => response.questionId === question.id),
    );
  }

  questionCorrectness(attempt: QuizAttempt, question: Question): boolean | undefined {
    if (!this.effectiveQuiz(attempt)?.settings.isGraded || !hasCorrectAnswer(question)) {
      return undefined;
    }
    return isCorrect(
      question,
      attempt.responses.find((response) => response.questionId === question.id),
    );
  }

  correctAnswerFor(question: Question): string | undefined {
    return formatCorrectAnswer(question);
  }

  toggleExpand(attemptId: string): void {
    this.expandedAttemptId.update((current) => (current === attemptId ? null : attemptId));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.requestedPageIndex.set(event.pageIndex);
  }

  toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  ariaSortFor(field: SortField): 'ascending' | 'descending' | 'none' {
    if (this.sortField() !== field) {
      return 'none';
    }
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  exportCsv(): void {
    const quiz = this.quiz();
    if (!quiz) return;
    const csv = exportAttemptsToCsv(quiz, this.filteredAttempts());
    const blob = new Blob([csvBom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${quiz.title || 'quiz'}-results.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
