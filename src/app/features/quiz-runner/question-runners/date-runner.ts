import { Component, input, output } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateQuestion } from '../../../core/models/quiz.models';

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-date-runner',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule],
  template: `
    <mat-form-field appearance="outline" class="date-runner-field">
      <input
        matInput
        [matDatepicker]="picker"
        [value]="dateValue()"
        (dateChange)="onDateChange($event.value)"
      />
      <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </mat-form-field>
  `,
})
export class DateRunner {
  readonly question = input.required<DateQuestion>();
  readonly value = input('');
  readonly valueChange = output<string>();

  dateValue(): Date | null {
    return parseIsoDate(this.value());
  }

  onDateChange(date: Date | null): void {
    this.valueChange.emit(date ? formatIsoDate(date) : '');
  }
}
