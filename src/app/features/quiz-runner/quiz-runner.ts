import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoService, translateSignal } from '@jsverse/transloco';
import { createId } from '../../core/utils/id';
import { getClientId } from '../../core/utils/client-id';
import { shuffle } from '../../core/utils/shuffle';
import { isQuestionVisible } from '../../core/models/question-condition';
import { isQuestionAnswered } from '../../core/models/quiz-attempt';
import {
  isAccessPasswordCorrect,
  isQuizExpired,
  isQuizPublished,
  quizRequiresPassword,
} from '../../core/models/quiz-access';
import { paginateQuestions } from '../../core/models/quiz-pages';
import { AttemptScore, buildAttemptReport, scoreAttempt } from '../../core/models/quiz-scoring';
import {
  PuzzleHolePlacement,
  PuzzlePlacement,
  Question,
  QuestionResponse,
  Quiz,
  QuizAttempt,
} from '../../core/models/quiz.models';
import { ATTEMPT_REPOSITORY } from '../../core/repositories/attempt-repository';
import { QuizStore } from '../../core/state/quiz-store';
import { ConstantSumRunner } from './question-runners/constant-sum-runner';
import { DateRunner } from './question-runners/date-runner';
import { DropdownRunner } from './question-runners/dropdown-runner';
import { FileUploadRunner } from './question-runners/file-upload-runner';
import { FillInTheBlankRunner } from './question-runners/fill-in-the-blank-runner';
import { HotspotRunner } from './question-runners/hotspot-runner';
import { ImageChoiceRunner } from './question-runners/image-choice-runner';
import { ImageGridRunner } from './question-runners/image-grid-runner';
import { PuzzleRunner } from './question-runners/puzzle-runner';
import { PuzzleHolesRunner } from './question-runners/puzzle-holes-runner';
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
    ImageGridRunner,
    PuzzleRunner,
    PuzzleHolesRunner,
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
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly injector = inject(Injector);
  private readonly transloco = inject(TranslocoService);
  private readonly resultRegion = viewChild<ElementRef<HTMLElement>>('resultRegion');
  private readonly attemptId = createId();
  private readonly startedAt = new Date().toISOString();
  private readonly startedAtMs = Date.now();
  private readonly clientId = getClientId();
  private timerHandle: ReturnType<typeof setInterval> | undefined;

  protected readonly backToListLabel = translateSignal('common.backToList');
  protected readonly quizNotFoundLabel = translateSignal('common.quizNotFound');
  protected readonly previewBannerLabel = translateSignal('quizRunner.previewBanner');
  protected readonly previewSubmittedResultLabel = translateSignal(
    'quizRunner.previewSubmittedResult',
  );
  protected readonly submittedThankYouLabel = translateSignal('quizRunner.submittedThankYou');
  protected readonly draftBlockedLabel = translateSignal('quizRunner.draftBlocked');
  protected readonly expiredBlockedLabel = translateSignal('quizRunner.expiredBlocked');
  protected readonly accessPasswordLabel = translateSignal('quizRunner.accessPasswordLabel');
  protected readonly continueButtonLabel = translateSignal('quizRunner.continueButton');
  protected readonly respondentNameLabel = translateSignal('quizRunner.respondentNameLabel');
  protected readonly requiredFieldErrorLabel = translateSignal('quizRunner.requiredFieldError');
  protected readonly backLabel = translateSignal('quizRunner.back');
  protected readonly nextLabel = translateSignal('quizRunner.next');
  protected readonly submitAnswersLabel = translateSignal('quizRunner.submitAnswers');

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

  private readonly displayQuestions = computed(() => {
    const quiz = this.quiz();
    if (!quiz) {
      return [];
    }
    return quiz.settings.shuffleQuestions ? shuffle(quiz.questions) : quiz.questions;
  });

  readonly visibleQuestions = computed(() => {
    const quiz = this.quiz();
    if (!quiz) {
      return [];
    }
    const responses = this.responses();
    return this.displayQuestions().filter((question) =>
      isQuestionVisible(question, quiz.questions, responses),
    );
  });

  readonly pages = computed(() => {
    const quiz = this.quiz();
    if (!quiz) {
      return [];
    }
    return paginateQuestions(quiz, this.visibleQuestions());
  });

  readonly currentPageIndex = signal(0);
  readonly clampedPageIndex = computed(() =>
    Math.min(this.currentPageIndex(), Math.max(this.pages().length - 1, 0)),
  );
  readonly currentPage = computed(() => this.pages()[this.clampedPageIndex()]);
  readonly isFirstPage = computed(() => this.clampedPageIndex() === 0);
  readonly isLastPage = computed(() => this.clampedPageIndex() === this.pages().length - 1);
  readonly isPaginated = computed(() => this.pages().length > 1);

  readonly respondentName = signal('');
  private readonly responses = signal<Record<string, QuestionResponse>>({});
  readonly validationErrors = signal<Set<string>>(new Set());

  readonly passwordInput = signal('');
  readonly passwordError = signal<string | null>(null);
  private readonly passwordUnlocked = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly result = signal<AttemptScore | undefined>(undefined);

  readonly remainingSeconds = signal<number | undefined>(undefined);
  readonly remainingTimeLabel = computed(() => {
    const seconds = this.remainingSeconds();
    if (seconds === undefined) {
      return undefined;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  });

  readonly attemptsUsed = signal(0);
  attemptsBlockedMessage(maxAttempts: number): string {
    return this.transloco.translate('quizRunner.attemptsBlocked', { max: maxAttempts });
  }

  remainingTimeMessage(): string {
    return this.transloco.translate('quizRunner.remainingTime', {
      time: this.remainingTimeLabel(),
    });
  }

  pageProgressMessage(): string {
    return this.transloco.translate('quizRunner.pageProgress', {
      current: this.clampedPageIndex() + 1,
      total: this.pages().length,
    });
  }

  scoreResultMessage(score: AttemptScore): string {
    return this.transloco.translate('quizRunner.scoreResult', {
      correct: score.correct,
      total: score.total,
    });
  }

  readonly attemptsBlocked = computed(() => {
    const max = this.quiz()?.settings.maxAttempts;
    return max !== undefined && this.attemptsUsed() >= max;
  });

  readonly isDraft = computed(() => {
    const quiz = this.quiz();
    return !!quiz && !isQuizPublished(quiz);
  });
  readonly isExpired = computed(() => {
    const quiz = this.quiz();
    return !!quiz && isQuizExpired(quiz);
  });
  readonly requiresPassword = computed(() => {
    const quiz = this.quiz();
    return !!quiz && quizRequiresPassword(quiz);
  });
  readonly isLocked = computed(() => this.requiresPassword() && !this.passwordUnlocked());

  /** Whether the respondent is allowed past the draft/expiry/password gates. Always true in preview. */
  private readonly accessGranted = computed(
    () => this.isPreview() || (!this.isDraft() && !this.isExpired() && !this.isLocked()),
  );

  readonly blockReason = computed<'draft' | 'expired' | 'locked' | 'attempts' | null>(() => {
    if (this.isPreview()) {
      return null;
    }
    if (this.isDraft()) {
      return 'draft';
    }
    if (this.isExpired()) {
      return 'expired';
    }
    if (this.isLocked()) {
      return 'locked';
    }
    if (this.attemptsBlocked()) {
      return 'attempts';
    }
    return null;
  });

  constructor() {
    void this.store.load();

    effect(() => {
      const quiz = this.quiz();
      const isPreview = this.isPreview();
      const accessGranted = this.accessGranted();
      untracked(() => {
        if (!quiz || isPreview || !accessGranted) {
          return;
        }
        void this.loadAttemptsUsed(quiz.id);
        this.startTimer(quiz.settings.timeLimitMinutes);
      });
    });

    inject(DestroyRef).onDestroy(() => this.stopTimer());
  }

  unlock(): void {
    const quiz = this.quiz();
    if (!quiz) {
      return;
    }
    if (isAccessPasswordCorrect(quiz, this.passwordInput())) {
      this.passwordUnlocked.set(true);
      this.passwordError.set(null);
    } else {
      this.passwordError.set(this.transloco.translate('quizRunner.invalidAccessCode'));
    }
  }

  private async loadAttemptsUsed(quizId: string): Promise<void> {
    const attempts = await this.attemptRepository.getByQuizId(quizId);
    this.attemptsUsed.set(
      attempts.filter((attempt) => attempt.respondentClientId === this.clientId).length,
    );
  }

  private startTimer(timeLimitMinutes: number | undefined): void {
    this.stopTimer();
    if (!timeLimitMinutes) {
      this.remainingSeconds.set(undefined);
      return;
    }
    const deadline = this.startedAtMs + timeLimitMinutes * 60_000;
    const tick = () => {
      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      this.remainingSeconds.set(remaining);
      if (remaining <= 0) {
        this.stopTimer();
        if (!this.submitted()) {
          void this.submit(true);
        }
      }
    };
    tick();
    this.timerHandle = setInterval(tick, 1000);
  }

  private stopTimer(): void {
    if (this.timerHandle !== undefined) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }

  /**
   * Announces the outcome and moves focus to the confirmation region, so a screen-reader
   * user gets feedback that the submission succeeded instead of silence. Deferred via
   * afterNextRender because the region only enters the DOM once `submitted` flips the @if.
   */
  private announceAndFocusResult(message: string): void {
    afterNextRender(
      () => {
        void this.liveAnnouncer.announce(message, 'polite');
        this.resultRegion()?.nativeElement.focus();
      },
      { injector: this.injector },
    );
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

  puzzlePlacements(questionId: string): PuzzlePlacement[] {
    return this.responses()[questionId]?.puzzlePlacements ?? [];
  }

  puzzleHolePlacements(questionId: string): PuzzleHolePlacement[] {
    return this.responses()[questionId]?.puzzleHolePlacements ?? [];
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

  setPuzzlePlacements(questionId: string, puzzlePlacements: PuzzlePlacement[]): void {
    this.responses.update((responses) => ({
      ...responses,
      [questionId]: { questionId, puzzlePlacements },
    }));
    this.clearValidationError(questionId);
  }

  setPuzzleHolePlacements(questionId: string, puzzleHolePlacements: PuzzleHolePlacement[]): void {
    this.responses.update((responses) => ({
      ...responses,
      [questionId]: { questionId, puzzleHolePlacements },
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

  private findUnanswered(questions: Question[]): Question[] {
    const responseByQuestionId = new Map(
      Object.values(this.responses()).map((response) => [response.questionId, response]),
    );
    return questions.filter(
      (question) =>
        question.required && !isQuestionAnswered(question, responseByQuestionId.get(question.id)),
    );
  }

  private jumpToQuestionPage(questionId: string): void {
    const index = this.pages().findIndex((page) =>
      page.questions.some((question) => question.id === questionId),
    );
    if (index !== -1) {
      this.currentPageIndex.set(index);
    }
  }

  goToNextPage(): void {
    const unanswered = this.findUnanswered(this.currentPage()?.questions ?? []);
    if (unanswered.length > 0) {
      this.validationErrors.set(new Set(unanswered.map((question) => question.id)));
      return;
    }
    this.validationErrors.set(new Set());
    this.currentPageIndex.update((index) => Math.min(index + 1, this.pages().length - 1));
  }

  goToPreviousPage(): void {
    this.currentPageIndex.update((index) => Math.max(index - 1, 0));
  }

  async submit(force = false): Promise<void> {
    const quiz = this.quiz();
    if (!quiz) {
      return;
    }
    if (!this.isPreview() && this.blockReason() !== null) {
      return;
    }
    this.stopTimer();
    const responses = Object.values(this.responses());
    if (!force) {
      const unanswered = this.findUnanswered(this.visibleQuestions());
      if (unanswered.length > 0) {
        this.validationErrors.set(new Set(unanswered.map((question) => question.id)));
        this.jumpToQuestionPage(unanswered[0].id);
        return;
      }
    }

    if (this.isPreview()) {
      this.result.set(scoreAttempt(quiz, responses));
      this.submitted.set(true);
      this.announceAndFocusResult(this.transloco.translate('quizRunner.previewSubmittedResult'));
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
        respondentClientId: this.clientId,
        startedAt: this.startedAt,
        completedAt: new Date().toISOString(),
        responses,
        score: score?.correct,
        quizSnapshot: quiz,
        questionReport: buildAttemptReport(
          (key, params) => this.transloco.translate(key, params),
          quiz,
          responses,
        ),
      };
      await this.attemptRepository.save(attempt);
      this.result.set(score);
      this.submitted.set(true);
      this.announceAndFocusResult(this.transloco.translate('quizRunner.submittedThankYou'));
    } catch (error) {
      this.saveError.set(
        this.transloco.translate(
          error instanceof DOMException && error.name === 'QuotaExceededError'
            ? 'quizRunner.quotaExceededError'
            : 'quizRunner.genericSaveError',
        ),
      );
    } finally {
      this.saving.set(false);
    }
  }
}
