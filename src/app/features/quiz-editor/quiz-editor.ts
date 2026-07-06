import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { QUESTION_TYPE_LABELS, QuestionType } from '../../core/models/question.factory';
import { Question, Quiz } from '../../core/models/quiz.models';
import {
  addQuestion,
  removeQuestion,
  reorderQuestions,
  replaceQuestion,
} from '../../core/models/quiz-questions';
import { QuizStore } from '../../core/state/quiz-store';
import { ImageChoiceEditor } from './question-editors/image-choice-editor';
import { MultipleChoiceEditor } from './question-editors/multiple-choice-editor';
import { SingleChoiceEditor } from './question-editors/single-choice-editor';
import { TextEditor } from './question-editors/text-editor';

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
    ImageChoiceEditor,
    MultipleChoiceEditor,
    SingleChoiceEditor,
    TextEditor,
  ],
  templateUrl: './quiz-editor.html',
  styleUrl: './quiz-editor.scss',
})
export class QuizEditor {
  private readonly store = inject(QuizStore);

  readonly id = input.required<string>();
  private readonly sourceQuiz = computed(() =>
    this.store.quizzes().find((quiz) => quiz.id === this.id()),
  );

  readonly draft = signal<Quiz | undefined>(undefined);
  readonly dirty = signal(false);
  readonly saving = signal(false);

  readonly questionTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];
  readonly questionTypeLabels = QUESTION_TYPE_LABELS;
  readonly newQuestionType = signal<QuestionType>(this.questionTypes[0]);

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
    try {
      await this.store.update(current);
      this.dirty.set(false);
    } finally {
      this.saving.set(false);
    }
  }
}
