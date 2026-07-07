import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-date-runner',
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="date-runner-field">
      <input
        matInput
        type="date"
        [value]="value()"
        (input)="valueChange.emit($any($event.target).value)"
      />
    </mat-form-field>
  `,
})
export class DateRunner {
  readonly question = input.required<DateQuestion>();
  readonly value = input('');
  readonly valueChange = output<string>();
}
