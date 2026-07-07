import { Component, input, output } from '@angular/core';
import { Option, RankingQuestion } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-ranking-editor',
  imports: [OptionListEditor],
  template: `
    <p class="reorder-hint">Порядок вариантов ниже — правильный порядок сортировки.</p>
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
  `,
})
export class RankingEditor {
  readonly question = input.required<RankingQuestion>();
  readonly questionChange = output<RankingQuestion>();

  onOptionsChange(options: Option[]): void {
    this.questionChange.emit({ ...this.question(), options });
  }
}
