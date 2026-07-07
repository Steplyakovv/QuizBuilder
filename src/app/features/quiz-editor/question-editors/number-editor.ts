import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NumberQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-number-editor',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './number-editor.html',
})
export class NumberEditor {
  readonly question = input.required<NumberQuestion>();
  readonly questionChange = output<NumberQuestion>();

  onMinChange(value: string): void {
    const parsed = value.trim() ? Number(value) : undefined;
    const min = parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;
    this.questionChange.emit({ ...this.question(), min });
  }

  onMaxChange(value: string): void {
    const parsed = value.trim() ? Number(value) : undefined;
    const max = parsed !== undefined && Number.isFinite(parsed) ? parsed : undefined;
    this.questionChange.emit({ ...this.question(), max });
  }
}
