import { Component, computed, input, output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RatingQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-rating-runner',
  imports: [MatButtonToggleModule],
  template: `
    <mat-button-toggle-group
      class="rating-runner-group"
      [value]="numericValue()"
      (change)="onChange($event.value)"
    >
      @for (rating of ratings(); track rating) {
        <mat-button-toggle [value]="rating">{{ rating }}</mat-button-toggle>
      }
    </mat-button-toggle-group>
  `,
})
export class RatingRunner {
  readonly question = input.required<RatingQuestion>();
  readonly value = input('');
  readonly valueChange = output<string>();

  readonly ratings = computed(() => {
    const { min, max } = this.question();
    const values: number[] = [];
    for (let value = min; value <= max; value++) {
      values.push(value);
    }
    return values;
  });

  numericValue(): number | null {
    const value = this.value();
    return value ? Number(value) : null;
  }

  onChange(value: number): void {
    this.valueChange.emit(String(value));
  }
}
