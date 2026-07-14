import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { translateSignal } from '@jsverse/transloco';
import { RatingQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-rating-editor',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './rating-editor.html',
})
export class RatingEditor {
  readonly question = input.required<RatingQuestion>();
  readonly questionChange = output<RatingQuestion>();

  protected readonly minLabel = translateSignal('common.minLabel');
  protected readonly maxLabel = translateSignal('common.maxLabel');

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
}
