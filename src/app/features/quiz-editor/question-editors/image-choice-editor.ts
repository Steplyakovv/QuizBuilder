import { Component, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ImageChoiceQuestion, Option } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-image-choice-editor',
  imports: [MatCheckboxModule, OptionListEditor],
  templateUrl: './image-choice-editor.html',
})
export class ImageChoiceEditor {
  readonly question = input.required<ImageChoiceQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<ImageChoiceQuestion>();

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }

  onCorrectChange(correctOptionIds: string[]): void {
    this.questionChange.emit({ ...this.question(), correctOptionIds });
  }

  onMultipleChange(multiple: boolean): void {
    const correctOptionIds = multiple
      ? this.question().correctOptionIds
      : this.question().correctOptionIds?.slice(0, 1);
    this.questionChange.emit({ ...this.question(), multiple, correctOptionIds });
  }
}
