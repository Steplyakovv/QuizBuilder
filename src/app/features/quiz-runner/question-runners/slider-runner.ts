import { Component, input, output } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { SliderQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-slider-runner',
  imports: [MatSliderModule],
  template: `
    <div class="slider-runner">
      <mat-slider [min]="question().min" [max]="question().max" [step]="question().step" discrete>
        <input matSliderThumb [value]="numericValue()" (valueChange)="onValueChange($event)" />
      </mat-slider>
      <span class="slider-runner-value">{{ value() || question().min }}</span>
    </div>
  `,
})
export class SliderRunner {
  readonly question = input.required<SliderQuestion>();
  readonly value = input('');
  readonly valueChange = output<string>();

  numericValue(): number {
    const value = this.value();
    return value ? Number(value) : this.question().min;
  }

  onValueChange(value: number): void {
    this.valueChange.emit(String(value));
  }
}
