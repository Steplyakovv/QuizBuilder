import { Component, input, output } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { translateSignal } from '@jsverse/transloco';
import { TrueFalseQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-true-false-editor',
  imports: [MatRadioModule],
  template: `
    @if (graded()) {
      <p class="true-false-label">{{ correctAnswerLabel() }}</p>
      <mat-radio-group [value]="correctValue()" (change)="onCorrectChange($event.value)">
        <mat-radio-button value="true">{{ yesLabel() }}</mat-radio-button>
        <mat-radio-button value="false">{{ noLabel() }}</mat-radio-button>
      </mat-radio-group>
    }
  `,
})
export class TrueFalseEditor {
  readonly question = input.required<TrueFalseQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<TrueFalseQuestion>();

  protected readonly correctAnswerLabel = translateSignal('trueFalseEditor.correctAnswerLabel');
  protected readonly yesLabel = translateSignal('quizAttempt.yes');
  protected readonly noLabel = translateSignal('quizAttempt.no');

  correctValue(): string | undefined {
    const answer = this.question().correctAnswer;
    return answer === undefined ? undefined : String(answer);
  }

  onCorrectChange(value: string): void {
    this.questionChange.emit({ ...this.question(), correctAnswer: value === 'true' });
  }
}
