import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NumberQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-number-runner',
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="number-runner-field">
      <input
        matInput
        type="number"
        [value]="value()"
        [attr.min]="question().min"
        [attr.max]="question().max"
        (input)="valueChange.emit($any($event.target).value)"
      />
    </mat-form-field>
  `,
})
export class NumberRunner {
  readonly question = input.required<NumberQuestion>();
  readonly value = input('');
  readonly valueChange = output<string>();
}
