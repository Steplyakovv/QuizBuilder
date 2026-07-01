import { Component, computed, inject, input, signal } from '@angular/core';
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
  readonly quiz = computed(() => this.store.quizzes().find((quiz) => quiz.id === this.id()));

  readonly questionTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];
  readonly questionTypeLabels = QUESTION_TYPE_LABELS;
  readonly newQuestionType = signal<QuestionType>(this.questionTypes[0]);

  constructor() {
    void this.store.load();
  }

  async updateTitle(quiz: Quiz, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed || trimmed === quiz.title) {
      return;
    }
    await this.store.update({ ...quiz, title: trimmed });
  }

  async updateDescription(quiz: Quiz, description: string): Promise<void> {
    const trimmed = description.trim();
    if (trimmed === (quiz.description ?? '')) {
      return;
    }
    await this.store.update({ ...quiz, description: trimmed || undefined });
  }

  async updateGraded(quiz: Quiz, isGraded: boolean): Promise<void> {
    await this.store.update({ ...quiz, settings: { ...quiz.settings, isGraded } });
  }

  async addQuestion(quiz: Quiz): Promise<void> {
    await this.store.update(addQuestion(quiz, this.newQuestionType()));
  }

  async removeQuestion(quiz: Quiz, questionId: string): Promise<void> {
    await this.store.update(removeQuestion(quiz, questionId));
  }

  async updateQuestionPrompt(quiz: Quiz, questionId: string, prompt: string): Promise<void> {
    const question = quiz.questions.find((existing) => existing.id === questionId);
    if (!question) {
      return;
    }
    await this.saveQuestion(quiz, { ...question, prompt });
  }

  async updateQuestionRequired(quiz: Quiz, questionId: string, required: boolean): Promise<void> {
    const question = quiz.questions.find((existing) => existing.id === questionId);
    if (!question) {
      return;
    }
    await this.saveQuestion(quiz, { ...question, required });
  }

  async saveQuestion(quiz: Quiz, updated: Question): Promise<void> {
    await this.store.update(replaceQuestion(quiz, updated));
  }

  async drop(quiz: Quiz, event: CdkDragDrop<unknown>): Promise<void> {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    await this.store.update(reorderQuestions(quiz, event.previousIndex, event.currentIndex));
  }
}
