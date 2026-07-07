import { Component, input, output } from '@angular/core';
import { DropdownQuestion, Option } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-dropdown-editor',
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
export class DropdownEditor {
  readonly question = input.required<DropdownQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<DropdownQuestion>();

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }

  onCorrectChange(ids: string[]): void {
    this.questionChange.emit({ ...this.question(), correctOptionId: ids[0] });
  }
}
