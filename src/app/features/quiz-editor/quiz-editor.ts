import {
  Component,
  Signal,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoService, translateObjectSignal, translateSignal } from '@jsverse/transloco';
import { QUESTION_TYPES, QuestionType } from '../../core/models/question.factory';
import { Question, Quiz } from '../../core/models/quiz.models';
import {
  addQuestion,
  removeQuestion,
  reorderQuestions,
  replaceQuestion,
} from '../../core/models/quiz-questions';
import {
  addPage as addQuizPage,
  removePage as removeQuizPage,
  renamePage as renameQuizPage,
} from '../../core/models/quiz-pages';
import { QuizStore } from '../../core/state/quiz-store';
import { QuizRunner } from '../quiz-runner/quiz-runner';
import { ConstantSumEditor } from './question-editors/constant-sum-editor';
import { DropdownEditor } from './question-editors/dropdown-editor';
import { FillInTheBlankEditor } from './question-editors/fill-in-the-blank-editor';
import { HotspotEditor } from './question-editors/hotspot-editor';
import { ImageChoiceEditor } from './question-editors/image-choice-editor';
import { ImageGridEditor } from './question-editors/image-grid-editor';
import { PuzzleEditor } from './question-editors/puzzle-editor';
import { MatchingEditor } from './question-editors/matching-editor';
import { MatrixEditor } from './question-editors/matrix-editor';
import { MultipleChoiceEditor } from './question-editors/multiple-choice-editor';
import { NumberEditor } from './question-editors/number-editor';
import { RankingEditor } from './question-editors/ranking-editor';
import { RatingEditor } from './question-editors/rating-editor';
import { SingleChoiceEditor } from './question-editors/single-choice-editor';
import { SliderEditor } from './question-editors/slider-editor';
import { TextEditor } from './question-editors/text-editor';
import { TrueFalseEditor } from './question-editors/true-false-editor';
import { WordChoiceEditor } from './question-editors/word-choice-editor';

@Component({
  selector: 'app-quiz-editor',
  imports: [
    RouterLink,
    DragDropModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ConstantSumEditor,
    DropdownEditor,
    FillInTheBlankEditor,
    HotspotEditor,
    ImageChoiceEditor,
    ImageGridEditor,
    PuzzleEditor,
    MatchingEditor,
    MatrixEditor,
    MultipleChoiceEditor,
    NumberEditor,
    RankingEditor,
    RatingEditor,
    SingleChoiceEditor,
    SliderEditor,
    TextEditor,
    TrueFalseEditor,
    WordChoiceEditor,
    QuizRunner,
  ],
  templateUrl: './quiz-editor.html',
  styleUrl: './quiz-editor.scss',
  host: {
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class QuizEditor {
  private readonly store = inject(QuizStore);
  private readonly transloco = inject(TranslocoService);

  readonly id = input.required<string>();
  private readonly sourceQuiz = computed(() =>
    this.store.quizzes().find((quiz) => quiz.id === this.id()),
  );

  readonly draft = signal<Quiz | undefined>(undefined);
  readonly dirty = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly previewing = signal(false);

  readonly questionTypes = QUESTION_TYPES;
  readonly questionTypeLabels = translateObjectSignal('questionTypes') as Signal<
    Record<QuestionType, string>
  >;
  readonly newQuestionType = signal<QuestionType>(this.questionTypes[0]);
  readonly newPageTitle = signal('');

  protected readonly backToListLabel = translateSignal('common.backToList');
  protected readonly quizNotFoundLabel = translateSignal('common.quizNotFound');
  protected readonly dragToReorderLabel = translateSignal('common.dragToReorder');
  protected readonly optionalHintLabel = translateSignal('common.optionalHint');
  protected readonly unsavedIndicatorLabel = translateSignal('quizEditor.unsavedIndicator');
  protected readonly closePreviewLabel = translateSignal('quizEditor.closePreview');
  protected readonly previewLabel = translateSignal('quizEditor.preview');
  protected readonly saveLabel = translateSignal('quizEditor.save');
  protected readonly titleLabel = translateSignal('quizEditor.titleLabel');
  protected readonly descriptionLabel = translateSignal('quizEditor.descriptionLabel');
  protected readonly settingsHeadingLabel = translateSignal('quizEditor.settingsHeading');
  protected readonly gradedCheckboxLabel = translateSignal('quizEditor.gradedCheckbox');
  protected readonly shuffleCheckboxLabel = translateSignal('quizEditor.shuffleCheckbox');
  protected readonly publishedCheckboxLabel = translateSignal('quizEditor.publishedCheckbox');
  protected readonly timeLimitLabel = translateSignal('quizEditor.timeLimitLabel');
  protected readonly maxAttemptsLabel = translateSignal('quizEditor.maxAttemptsLabel');
  protected readonly accessPasswordLabel = translateSignal('quizEditor.accessPasswordLabel');
  protected readonly expiresAtLabel = translateSignal('quizEditor.expiresAtLabel');
  protected readonly webhookUrlLabel = translateSignal('quizEditor.webhookUrlLabel');
  protected readonly webhookHintLabel = translateSignal('quizEditor.webhookHint');
  protected readonly pagesHeadingLabel = translateSignal('quizEditor.pagesHeading');
  protected readonly noPagesHintLabel = translateSignal('quizEditor.noPagesHint');
  protected readonly pageTitleLabel = translateSignal('quizEditor.pageTitleLabel');
  protected readonly deletePageLabel = translateSignal('quizEditor.deletePage');
  protected readonly newPageLabel = translateSignal('quizEditor.newPageLabel');
  protected readonly addPageLabel = translateSignal('quizEditor.addPage');
  protected readonly questionsHeadingLabel = translateSignal('quizEditor.questionsHeading');
  protected readonly noQuestionsLabel = translateSignal('quizEditor.noQuestions');
  protected readonly questionOrderLabel = translateSignal('quizEditor.questionOrderLabel');
  protected readonly requiredCheckboxLabel = translateSignal('quizEditor.requiredCheckbox');
  protected readonly deleteQuestionLabel = translateSignal('quizEditor.deleteQuestion');
  protected readonly pageSelectLabel = translateSignal('quizEditor.pageSelectLabel');
  protected readonly noPageOptionLabel = translateSignal('quizEditor.noPageOption');
  protected readonly conditionSourceLabel = translateSignal('quizEditor.conditionSourceLabel');
  protected readonly alwaysShowOptionLabel = translateSignal('quizEditor.alwaysShowOption');
  protected readonly noPromptTextLabel = translateSignal('quizEditor.noPromptText');
  protected readonly questionTypeLabel = translateSignal('quizEditor.questionTypeLabel');
  protected readonly addQuestionLabel = translateSignal('quizEditor.addQuestion');

  constructor() {
    void this.store.load();
    effect(() => {
      const quiz = this.sourceQuiz();
      untracked(() => {
        if (quiz && this.draft()?.id !== quiz.id) {
          this.draft.set(quiz);
          this.dirty.set(false);
        }
      });
    });
  }

  private updateDraft(mutate: (quiz: Quiz) => Quiz): void {
    const current = this.draft();
    if (!current) {
      return;
    }
    this.draft.set(mutate(current));
    this.dirty.set(true);
    this.saveError.set(null);
  }

  updateTitle(title: string): void {
    const current = this.draft();
    const trimmed = title.trim();
    if (!current || !trimmed || trimmed === current.title) {
      return;
    }
    this.updateDraft((quiz) => ({ ...quiz, title: trimmed }));
  }

  updateDescription(description: string): void {
    const current = this.draft();
    const trimmed = description.trim();
    if (!current || trimmed === (current.description ?? '')) {
      return;
    }
    this.updateDraft((quiz) => ({ ...quiz, description: trimmed || undefined }));
  }

  updateGraded(isGraded: boolean): void {
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, isGraded } }));
  }

  updateShuffleQuestions(shuffleQuestions: boolean): void {
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, shuffleQuestions } }));
  }

  updateTimeLimit(rawValue: string): void {
    const value = rawValue.trim();
    const timeLimitMinutes = value ? Math.max(1, Math.round(Number(value))) : undefined;
    if (value && Number.isNaN(timeLimitMinutes)) {
      return;
    }
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, timeLimitMinutes } }));
  }

  updateMaxAttempts(rawValue: string): void {
    const value = rawValue.trim();
    const maxAttempts = value ? Math.max(1, Math.round(Number(value))) : undefined;
    if (value && Number.isNaN(maxAttempts)) {
      return;
    }
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, maxAttempts } }));
  }

  updatePublished(published: boolean): void {
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, published } }));
  }

  updateAccessPassword(rawValue: string): void {
    const accessPassword = rawValue.trim() || undefined;
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, accessPassword } }));
  }

  updateWebhookUrl(rawValue: string): void {
    const webhookUrl = rawValue.trim() || undefined;
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, webhookUrl } }));
  }

  /** Formats settings.expiresAt (ISO, UTC) as a `datetime-local` input value in local time. */
  expiresAtInputValue(quiz: Quiz): string {
    const iso = quiz.settings.expiresAt;
    if (!iso) {
      return '';
    }
    const date = new Date(iso);
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  updateExpiresAt(rawValue: string): void {
    const expiresAt = rawValue ? new Date(rawValue).toISOString() : undefined;
    this.updateDraft((quiz) => ({ ...quiz, settings: { ...quiz.settings, expiresAt } }));
  }

  addPage(): void {
    const title = this.newPageTitle().trim();
    if (!title) {
      return;
    }
    this.updateDraft((quiz) => addQuizPage(quiz, title));
    this.newPageTitle.set('');
  }

  renamePage(pageId: string, title: string): void {
    this.updateDraft((quiz) => renameQuizPage(quiz, pageId, title));
  }

  removePage(pageId: string): void {
    this.updateDraft((quiz) => removeQuizPage(quiz, pageId));
  }

  updateQuestionPage(questionId: string, pageId: string): void {
    const question = this.draft()?.questions.find((existing) => existing.id === questionId);
    if (!question) {
      return;
    }
    this.saveQuestion({ ...question, pageId: pageId || undefined });
  }

  /** Earlier questions this question could be shown after. */
  conditionSources(questionId: string): Question[] {
    const questions = this.draft()?.questions ?? [];
    const index = questions.findIndex((question) => question.id === questionId);
    return questions.slice(0, index);
  }

  updateConditionSource(questionId: string, sourceQuestionId: string): void {
    const question = this.draft()?.questions.find((existing) => existing.id === questionId);
    if (!question) {
      return;
    }
    this.saveQuestion({
      ...question,
      condition: sourceQuestionId ? { questionId: sourceQuestionId } : undefined,
    });
  }

  addQuestion(): void {
    this.updateDraft((quiz) => addQuestion(quiz, this.newQuestionType()));
  }

  removeQuestion(questionId: string): void {
    this.updateDraft((quiz) => removeQuestion(quiz, questionId));
  }

  updateQuestionPrompt(questionId: string, prompt: string): void {
    const question = this.draft()?.questions.find((existing) => existing.id === questionId);
    if (!question) {
      return;
    }
    this.saveQuestion({ ...question, prompt });
  }

  updateQuestionOrder(questionId: string, rawValue: string): void {
    const current = this.draft();
    if (!current || !rawValue.trim()) {
      return;
    }
    const requested = Math.round(Number(rawValue));
    if (Number.isNaN(requested)) {
      return;
    }
    const previousIndex = current.questions.findIndex((question) => question.id === questionId);
    const targetIndex = Math.min(Math.max(requested - 1, 0), current.questions.length - 1);
    if (previousIndex === -1 || previousIndex === targetIndex) {
      return;
    }
    this.updateDraft((quiz) => reorderQuestions(quiz, previousIndex, targetIndex));
  }

  updateQuestionRequired(questionId: string, required: boolean): void {
    const question = this.draft()?.questions.find((existing) => existing.id === questionId);
    if (!question) {
      return;
    }
    this.saveQuestion({ ...question, required });
  }

  saveQuestion(updated: Question): void {
    this.updateDraft((quiz) => replaceQuestion(quiz, updated));
  }

  drop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    this.updateDraft((quiz) => reorderQuestions(quiz, event.previousIndex, event.currentIndex));
  }

  async save(): Promise<void> {
    const current = this.draft();
    if (!current) {
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);
    try {
      await this.store.update(current);
      this.dirty.set(false);
    } catch (error) {
      this.saveError.set(
        this.transloco.translate(
          error instanceof DOMException && error.name === 'QuotaExceededError'
            ? 'quizEditor.quotaExceededError'
            : 'quizEditor.genericSaveError',
        ),
      );
    } finally {
      this.saving.set(false);
    }
  }

  togglePreview(): void {
    this.previewing.update((value) => !value);
  }

  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.dirty()) {
      return;
    }
    event.preventDefault();
    event.returnValue = true;
  }
}
