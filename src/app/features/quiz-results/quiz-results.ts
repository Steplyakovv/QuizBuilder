import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AttemptScore, scoreAttempt } from '../../core/models/quiz-scoring';
import { QuizAttempt } from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QuizStore } from '../../core/state/quiz-store';

@Component({
  selector: 'app-quiz-results',
  imports: [RouterLink, DatePipe],
  templateUrl: './quiz-results.html',
  styleUrl: './quiz-results.scss',
})
export class QuizResults {
  private readonly store = inject(QuizStore);
  private readonly attemptRepository = inject(ATTEMPT_REPOSITORY);

  readonly id = input.required<string>();
  readonly quiz = computed(() => this.store.quizzes().find((quiz) => quiz.id === this.id()));

  readonly attempts = signal<QuizAttempt[]>([]);

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
}
