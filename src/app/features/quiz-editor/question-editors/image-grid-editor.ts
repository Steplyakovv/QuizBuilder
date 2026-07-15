import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { translateSignal } from '@jsverse/transloco';
import { ImageGridQuestion, Option } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-image-grid-editor',
  imports: [MatFormFieldModule, MatInputModule, OptionListEditor],
  templateUrl: './image-grid-editor.html',
})
export class ImageGridEditor {
  readonly question = input.required<ImageGridQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<ImageGridQuestion>();

  protected readonly columnsLabel = translateSignal('imageGridEditor.columnsLabel');

  onColumnsChange(value: string): void {
    const parsed = Number(value);
    const columns = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
    this.questionChange.emit({ ...this.question(), columns });
  }

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }

  onCorrectChange(correctOptionIds: string[]): void {
    this.questionChange.emit({ ...this.question(), correctOptionIds });
  }
}
