import { Component, input, output } from '@angular/core';
import { MultipleChoiceQuestion } from '../../../core/models/quiz.models';
import { OptionPicker } from '../../../shared/option-picker/option-picker';

@Component({
  selector: 'app-multiple-choice-runner',
  imports: [OptionPicker],
  template: `
    <app-option-picker
      [options]="question().options"
      selectionMode="multiple"
      [selected]="selectedOptionIds()"
      (selectedChange)="selectionChange.emit($event)"
    />
  `,
})
export class MultipleChoiceRunner {
  readonly question = input.required<MultipleChoiceQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();
}
