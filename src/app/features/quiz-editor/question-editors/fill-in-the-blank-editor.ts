import { Component, computed, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { countBlanks } from '../../../core/models/fill-in-the-blank';
import { FillInTheBlankQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-fill-in-the-blank-editor',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './fill-in-the-blank-editor.html',
})
export class FillInTheBlankEditor {
  readonly question = input.required<FillInTheBlankQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<FillInTheBlankQuestion>();

  readonly blankCount = computed(() => countBlanks(this.question().template));
  readonly blankIndexes = computed(() => Array.from({ length: this.blankCount() }, (_, i) => i));

  onTemplateChange(template: string): void {
    this.questionChange.emit({ ...this.question(), template });
  }

  correctAnswer(index: number): string {
    return this.question().correctAnswers?.[index] ?? '';
  }

  onCorrectAnswerChange(index: number, value: string): void {
    const next = [...(this.question().correctAnswers ?? [])];
    next[index] = value;
    this.questionChange.emit({ ...this.question(), correctAnswers: next });
  }
}
