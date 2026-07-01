import { Component, input, output } from '@angular/core';
import { Option, SingleChoiceQuestion } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-single-choice-editor',
  imports: [OptionListEditor],
  template: `
    <app-option-list-editor
      [options]="question().options"
      [correctOptionIds]="question().correctOptionId ? [question().correctOptionId!] : []"
      selectionMode="single"
      [showCorrectMarking]="graded()"
      (optionsChange)="onOptionsChange($event)"
      (correctOptionIdsChange)="onCorrectChange($event)"
    />
  `,
})
export class SingleChoiceEditor {
  readonly question = input.required<SingleChoiceQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<SingleChoiceQuestion>();

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }

  onCorrectChange(ids: string[]): void {
    this.questionChange.emit({ ...this.question(), correctOptionId: ids[0] });
  }
}
