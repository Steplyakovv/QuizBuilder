import { Component, input, output } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { translateSignal } from '@jsverse/transloco';
import { TrueFalseQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-true-false-runner',
  imports: [MatRadioModule],
  template: `
    <mat-radio-group [value]="value()" (change)="valueChange.emit($event.value)">
      <mat-radio-button value="true">{{ yesLabel() }}</mat-radio-button>
      <mat-radio-button value="false">{{ noLabel() }}</mat-radio-button>
    </mat-radio-group>
  `,
})
export class TrueFalseRunner {
  readonly question = input.required<TrueFalseQuestion>();
  readonly value = input('');
  readonly valueChange = output<string>();

  protected readonly yesLabel = translateSignal('quizAttempt.yes');
  protected readonly noLabel = translateSignal('quizAttempt.no');
}
