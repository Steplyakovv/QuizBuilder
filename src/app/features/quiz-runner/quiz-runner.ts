import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { createId } from '../../core/utils/id';
import { isQuestionAnswered } from '../../core/models/quiz-attempt';
import { AttemptScore, scoreAttempt } from '../../core/models/quiz-scoring';
import { QuestionResponse, QuizAttempt } from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QuizStore } from '../../core/state/quiz-store';
import { ImageChoiceRunner } from './question-runners/image-choice-runner';
import { MultipleChoiceRunner } from './question-runners/multiple-choice-runner';
import { SingleChoiceRunner } from './question-runners/single-choice-runner';
import { TextRunner } from './question-runners/text-runner';

@Component({
  selector: 'app-quiz-runner',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ImageChoiceRunner,
    MultipleChoiceRunner,
    SingleChoiceRunner,
    TextRunner,
  ],
  templateUrl: './quiz-runner.html',
  styleUrl: './quiz-runner.scss',
})
export class QuizRunner {
  private readonly store = inject(QuizStore);
  private readonly attemptRepository = inject(ATTEMPT_REPOSITORY);
  private readonly attemptId = createId();
  private readonly startedAt = new Date().toISOString();

  readonly id = input.required<string>();
  readonly quiz = computed(() => this.store.quizzes().find((quiz) => quiz.id === this.id()));

  readonly respondentName = signal('');
  private readonly responses = signal<Record<string, QuestionResponse>>({});
  readonly validationErrors = signal<Set<string>>(new Set());
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly result = signal<AttemptScore | undefined>(undefined);

  constructor() {
    void this.store.load();
  }

  selectedOptionIds(questionId: string): string[] {
    return this.responses()[questionId]?.selectedOptionIds ?? [];
  }

  textResponse(questionId: string): string {
    return this.responses()[questionId]?.text ?? '';
  }

  setSelection(questionId: string, selectedOptionIds: string[]): void {
    this.responses.update((responses) => ({
      ...responses,
      [questionId]: { questionId, selectedOptionIds },
    }));
    this.clearValidationError(questionId);
  }

  setText(questionId: string, text: string): void {
    this.responses.update((responses) => ({ ...responses, [questionId]: { questionId, text } }));
    this.clearValidationError(questionId);
  }

  private clearValidationError(questionId: string): void {
    if (!this.validationErrors().has(questionId)) {
      return;
    }
    const next = new Set(this.validationErrors());
    next.delete(questionId);
    this.validationErrors.set(next);
  }

  async submit(): Promise<void> {
    const quiz = this.quiz();
    if (!quiz) {
      return;
    }
    const responses = Object.values(this.responses());
    const responseByQuestionId = new Map(
      responses.map((response) => [response.questionId, response]),
    );
    const unanswered = quiz.questions.filter(
      (question) =>
        question.required && !isQuestionAnswered(question, responseByQuestionId.get(question.id)),
    );
    if (unanswered.length > 0) {
      this.validationErrors.set(new Set(unanswered.map((question) => question.id)));
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    try {
      const score = scoreAttempt(quiz, responses);
      const attempt: QuizAttempt = {
        id: this.attemptId,
        quizId: quiz.id,
        respondentName: this.respondentName().trim() || undefined,
        startedAt: this.startedAt,
        completedAt: new Date().toISOString(),
        responses,
        score: score?.correct,
      };
      await this.attemptRepository.save(attempt);
      this.result.set(score);
      this.submitted.set(true);
    } catch (error) {
      this.saveError.set(
        error instanceof DOMException && error.name === 'QuotaExceededError'
          ? 'Не удалось сохранить ответы: превышен лимит хранилища браузера.'
          : 'Не удалось сохранить ответы. Попробуйте ещё раз.',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
