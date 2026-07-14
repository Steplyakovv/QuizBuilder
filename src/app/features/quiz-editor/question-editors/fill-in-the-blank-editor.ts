import { Component, computed, inject, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoService, translateSignal } from '@jsverse/transloco';
import { countBlanks } from '../../../core/models/fill-in-the-blank';
import { FillInTheBlankQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-fill-in-the-blank-editor',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './fill-in-the-blank-editor.html',
  styles: `
    .template-field {
      width: 100%;
    }

    .blank-answer-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
  `,
})
export class FillInTheBlankEditor {
  private readonly transloco = inject(TranslocoService);

  readonly question = input.required<FillInTheBlankQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<FillInTheBlankQuestion>();

  protected readonly templateLabel = translateSignal('fillInTheBlankEditor.templateLabel', {
    marker: '{{}}',
  });
  protected readonly correctAnswersLabel = translateSignal(
    'fillInTheBlankEditor.correctAnswersLabel',
  );

  readonly blankCount = computed(() => countBlanks(this.question().template));
  readonly blankIndexes = computed(() => Array.from({ length: this.blankCount() }, (_, i) => i));

  blankLabel(index: number): string {
    return this.transloco.translate('fillInTheBlankEditor.blankLabel', { index: index + 1 });
  }

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
