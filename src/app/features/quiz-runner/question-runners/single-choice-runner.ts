import { Component, input, output } from '@angular/core';
import { SingleChoiceQuestion } from '../../../core/models/quiz.models';
import { OptionPicker } from '../../../shared/option-picker/option-picker';

@Component({
  selector: 'app-single-choice-runner',
  imports: [OptionPicker],
  template: `
    <app-option-picker
      [options]="question().options"
      selectionMode="single"
      [selected]="selectedOptionIds()"
      (selectedChange)="selectionChange.emit($event)"
    />
  `,
})
export class SingleChoiceRunner {
  readonly question = input.required<SingleChoiceQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();
}
