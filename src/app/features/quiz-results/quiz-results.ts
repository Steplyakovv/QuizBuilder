import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { formatResponse } from '../../core/models/quiz-attempt';
import { QuestionStat, questionStatistics } from '../../core/models/question-statistics';
import { AttemptScore, scoreAttempt } from '../../core/models/quiz-scoring';
import { Question, QuizAttempt } from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QuizStore } from '../../core/state/quiz-store';

@Component({
  selector: 'app-quiz-results',
  imports: [RouterLink, DatePipe, MatButtonModule],
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

  scoreFor(attempt: QuizAttempt): AttemptScore | undefined {
    const quiz = this.quiz();
    return quiz ? scoreAttempt(quiz, attempt.responses) : undefined;
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

  toggleExpand(attemptId: string): void {
    this.expandedAttemptId.update((current) => (current === attemptId ? null : attemptId));
  }
}
