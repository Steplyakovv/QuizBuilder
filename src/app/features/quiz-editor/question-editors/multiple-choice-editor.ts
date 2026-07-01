import { Component, input, output } from '@angular/core';
import { MultipleChoiceQuestion, Option } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-multiple-choice-editor',
  imports: [OptionListEditor],
  template: `
    <app-option-list-editor
      [options]="question().options"
      [correctOptionIds]="question().correctOptionIds ?? []"
      selectionMode="multiple"
      [showCorrectMarking]="graded()"
      (optionsChange)="onOptionsChange($event)"
      (correctOptionIdsChange)="onCorrectChange($event)"
    />
  `,
})
export class MultipleChoiceEditor {
  readonly question = input.required<MultipleChoiceQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<MultipleChoiceQuestion>();

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }

  onCorrectChange(correctOptionIds: string[]): void {
    this.questionChange.emit({ ...this.question(), correctOptionIds });
  }
}
