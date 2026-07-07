import { Component, input, output } from '@angular/core';
import { Option, WordChoiceQuestion } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-word-choice-editor',
  imports: [OptionListEditor],
  template: `
    <p class="reorder-hint">Порядок слов ниже — правильный порядок фразы.</p>
    <app-option-list-editor
      [options]="question().words"
      [reorderable]="true"
      (optionsChange)="onWordsChange($event)"
    />
  `,
  styles: `
    .reorder-hint {
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class WordChoiceEditor {
  readonly question = input.required<WordChoiceQuestion>();
  readonly questionChange = output<WordChoiceQuestion>();

  onWordsChange(words: Option[]): void {
    this.questionChange.emit({ ...this.question(), words });
  }
}
