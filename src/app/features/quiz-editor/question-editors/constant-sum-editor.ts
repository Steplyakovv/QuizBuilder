import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { translateSignal } from '@jsverse/transloco';
import { ConstantSumQuestion, Option } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-constant-sum-editor',
  imports: [MatFormFieldModule, MatInputModule, OptionListEditor],
  templateUrl: './constant-sum-editor.html',
})
export class ConstantSumEditor {
  readonly question = input.required<ConstantSumQuestion>();
  readonly questionChange = output<ConstantSumQuestion>();

  protected readonly totalLabel = translateSignal('constantSumEditor.totalLabel');

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }

  onTotalChange(value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    this.questionChange.emit({ ...this.question(), total: parsed });
  }
}
