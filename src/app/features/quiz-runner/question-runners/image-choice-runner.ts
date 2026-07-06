import { Component, input, output } from '@angular/core';
import { ImageChoiceQuestion } from '../../../core/models/quiz.models';
import { OptionPicker } from '../../../shared/option-picker/option-picker';

@Component({
  selector: 'app-image-choice-runner',
  imports: [OptionPicker],
  template: `
    <app-option-picker
      [options]="question().options"
      [selectionMode]="question().multiple ? 'multiple' : 'single'"
      [selected]="selectedOptionIds()"
      [showImages]="true"
      (selectedChange)="selectionChange.emit($event)"
    />
  `,
})
export class ImageChoiceRunner {
  readonly question = input.required<ImageChoiceQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();
}
