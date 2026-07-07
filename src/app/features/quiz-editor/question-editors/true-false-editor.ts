import { Component, input, output } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { TrueFalseQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-true-false-editor',
  imports: [MatRadioModule],
  template: `
    @if (graded()) {
      <p class="true-false-label">Правильный ответ:</p>
      <mat-radio-group [value]="correctValue()" (change)="onCorrectChange($event.value)">
        <mat-radio-button value="true">Да</mat-radio-button>
        <mat-radio-button value="false">Нет</mat-radio-button>
      </mat-radio-group>
    }
  `,
})
export class TrueFalseEditor {
  readonly question = input.required<TrueFalseQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<TrueFalseQuestion>();

  correctValue(): string | undefined {
    const answer = this.question().correctAnswer;
    return answer === undefined ? undefined : String(answer);
  }

  onCorrectChange(value: string): void {
    this.questionChange.emit({ ...this.question(), correctAnswer: value === 'true' });
  }
}
