import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { createId } from '../../core/utils/id';
import { isQuestionAnswered } from '../../core/models/quiz-attempt';
import { AttemptScore, scoreAttempt } from '../../core/models/quiz-scoring';
import { QuestionResponse, Quiz, QuizAttempt } from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QuizStore } from '../../core/state/quiz-store';
import { ConstantSumRunner } from './question-runners/constant-sum-runner';
import { DateRunner } from './question-runners/date-runner';
import { DropdownRunner } from './question-runners/dropdown-runner';
import { FileUploadRunner } from './question-runners/file-upload-runner';
import { FillInTheBlankRunner } from './question-runners/fill-in-the-blank-runner';
import { HotspotRunner } from './question-runners/hotspot-runner';
import { ImageChoiceRunner } from './question-runners/image-choice-runner';
import { MatchingRunner } from './question-runners/matching-runner';
import { MatrixRunner } from './question-runners/matrix-runner';
import { MultipleChoiceRunner } from './question-runners/multiple-choice-runner';
import { NumberRunner } from './question-runners/number-runner';
import { RankingRunner } from './question-runners/ranking-runner';
import { RatingRunner } from './question-runners/rating-runner';
import { SingleChoiceRunner } from './question-runners/single-choice-runner';
import { SliderRunner } from './question-runners/slider-runner';
import { TextRunner } from './question-runners/text-runner';
import { TrueFalseRunner } from './question-runners/true-false-runner';
import { WordChoiceRunner } from './question-runners/word-choice-runner';

@Component({
  selector: 'app-quiz-runner',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ConstantSumRunner,
    DateRunner,
    DropdownRunner,
    FileUploadRunner,
    FillInTheBlankRunner,
    HotspotRunner,
    ImageChoiceRunner,
    MatchingRunner,
    MatrixRunner,
    MultipleChoiceRunner,
    NumberRunner,
    RankingRunner,
    RatingRunner,
    SingleChoiceRunner,
    SliderRunner,
    TextRunner,
    TrueFalseRunner,
    WordChoiceRunner,
  ],
  templateUrl: './quiz-runner.html',
  styleUrl: './quiz-runner.scss',
})
export class QuizRunner {
  private readonly store = inject(QuizStore);
  private readonly attemptRepository = inject(ATTEMPT_REPOSITORY);
  private readonly attemptId = createId();
  private readonly startedAt = new Date().toISOString();

  readonly id = input<string>();
  readonly previewQuiz = input<Quiz>();
  readonly isPreview = computed(() => this.previewQuiz() !== undefined);
  readonly quiz = computed(() => {
    const preview = this.previewQuiz();
    if (preview) {
      return preview;
    }
    const id = this.id();
    return id ? this.store.quizzes().find((quiz) => quiz.id === id) : undefined;
  });

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

  distribution(questionId: string): Record<string, number> {
    return this.responses()[questionId]?.distribution ?? {};
  }

  blanksResponse(questionId: string): string[] {
    return this.responses()[questionId]?.blanks ?? [];
  }

  matchesResponse(questionId: string): Record<string, string> {
    return this.responses()[questionId]?.matches ?? {};
  }

  fileResponse(questionId: string): { name: string; dataUrl: string } | undefined {
    return this.responses()[questionId]?.file;
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

  setDistribution(questionId: string, distribution: Record<string, number>): void {
    this.responses.update((responses) => ({
      ...responses,
      [questionId]: { questionId, distribution },
    }));
    this.clearValidationError(questionId);
  }

  setBlanks(questionId: string, blanks: string[]): void {
    this.responses.update((responses) => ({ ...responses, [questionId]: { questionId, blanks } }));
    this.clearValidationError(questionId);
  }

  setMatches(questionId: string, matches: Record<string, string>): void {
    this.responses.update((responses) => ({
      ...responses,
      [questionId]: { questionId, matches },
    }));
    this.clearValidationError(questionId);
  }

  setFile(questionId: string, file: { name: string; dataUrl: string } | undefined): void {
    this.responses.update((responses) => ({ ...responses, [questionId]: { questionId, file } }));
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

    if (this.isPreview()) {
      this.result.set(scoreAttempt(quiz, responses));
      this.submitted.set(true);
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
