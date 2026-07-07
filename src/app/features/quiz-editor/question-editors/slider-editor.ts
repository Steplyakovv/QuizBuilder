import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SliderQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-slider-editor',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './slider-editor.html',
})
export class SliderEditor {
  readonly question = input.required<SliderQuestion>();
  readonly questionChange = output<SliderQuestion>();

  onMinChange(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.questionChange.emit({ ...this.question(), min: parsed });
  }

  onMaxChange(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.questionChange.emit({ ...this.question(), max: parsed });
  }

  onStepChange(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    this.questionChange.emit({ ...this.question(), step: parsed });
  }
}
