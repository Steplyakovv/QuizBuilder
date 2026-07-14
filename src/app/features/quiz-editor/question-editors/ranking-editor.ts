import { Component, computed, inject, input, output } from '@angular/core';
import { TranslocoService, translateSignal } from '@jsverse/transloco';
import { Option, RankingQuestion } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-ranking-editor',
  imports: [OptionListEditor],
  template: `
    <p class="reorder-hint">{{ reorderHintLabel() }}</p>
    @if (correctOrder()) {
      <p class="correct-preview">{{ correctOrderLabel() }}</p>
    }
    <app-option-list-editor
      [options]="question().options"
      [reorderable]="true"
      (optionsChange)="onOptionsChange($event)"
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
export class RankingEditor {
  private readonly transloco = inject(TranslocoService);

  readonly question = input.required<RankingQuestion>();
  readonly questionChange = output<RankingQuestion>();

  protected readonly reorderHintLabel = translateSignal('rankingEditor.reorderHint');

  readonly correctOrder = computed(() =>
    this.question()
      .options.map((option) => option.label)
      .join(' → '),
  );

  correctOrderLabel(): string {
    return this.transloco.translate('rankingEditor.correctOrderPreview', {
      order: this.correctOrder(),
    });
  }

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }
}
