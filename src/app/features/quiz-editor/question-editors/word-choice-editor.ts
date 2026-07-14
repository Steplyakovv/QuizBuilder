import { Component, computed, inject, input, output } from '@angular/core';
import { TranslocoService, translateSignal } from '@jsverse/transloco';
import { Option, WordChoiceQuestion } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-word-choice-editor',
  imports: [OptionListEditor],
  template: `
    <p class="reorder-hint">{{ reorderHintLabel() }}</p>
    @if (correctPhrase()) {
      <p class="correct-preview">{{ correctPhraseLabel() }}</p>
    }
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

    .correct-preview {
      margin: 0 0 0.75rem;
      font-size: 0.875rem;
    }
  `,
})
export class WordChoiceEditor {
  private readonly transloco = inject(TranslocoService);

  readonly question = input.required<WordChoiceQuestion>();
  readonly questionChange = output<WordChoiceQuestion>();

  protected readonly reorderHintLabel = translateSignal('wordChoiceEditor.reorderHint');

  readonly correctPhrase = computed(() =>
    this.question()
      .words.map((word) => word.label)
      .join(' '),
  );

  correctPhraseLabel(): string {
    return this.transloco.translate('wordChoiceEditor.correctPhrasePreview', {
      phrase: this.correctPhrase(),
    });
  }

  onWordsChange(words: Option[]): void {
    this.questionChange.emit({ ...this.question(), words });
  }
}
