import { Component, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { translateSignal } from '@jsverse/transloco';
import { TextQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-text-editor',
  imports: [MatCheckboxModule, MatFormFieldModule, MatInputModule],
  templateUrl: './text-editor.html',
})
export class TextEditor {
  readonly question = input.required<TextQuestion>();
  readonly questionChange = output<TextQuestion>();

  protected readonly multilineCheckboxLabel = translateSignal('textEditor.multilineCheckbox');
  protected readonly maxLengthLabel = translateSignal('textEditor.maxLengthLabel');

  onMultilineChange(multiline: boolean): void {
    this.questionChange.emit({ ...this.question(), multiline });
  }

  onMaxLengthChange(value: string): void {
    const parsed = value.trim() ? Number(value) : undefined;
    const maxLength = parsed && parsed > 0 ? parsed : undefined;
    this.questionChange.emit({ ...this.question(), maxLength });
  }
}
