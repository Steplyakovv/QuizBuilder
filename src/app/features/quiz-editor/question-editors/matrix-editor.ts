import { Component, input, output } from '@angular/core';
import { translateSignal } from '@jsverse/transloco';
import { MatrixQuestion, Option } from '../../../core/models/quiz.models';
import { OptionListEditor } from '../../../shared/option-list-editor/option-list-editor';

@Component({
  selector: 'app-matrix-editor',
  imports: [OptionListEditor],
  template: `
    <div class="matrix-editor">
      <div class="matrix-editor-column">
        <p class="matrix-editor-label">{{ rowsLabel() }}</p>
        <app-option-list-editor
          [options]="question().rows"
          (optionsChange)="onRowsChange($event)"
        />
      </div>
      <div class="matrix-editor-column">
        <p class="matrix-editor-label">{{ columnsLabel() }}</p>
        <app-option-list-editor
          [options]="question().columns"
          (optionsChange)="onColumnsChange($event)"
        />
      </div>
    </div>
  `,
  styles: `
    .matrix-editor {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .matrix-editor-column {
      flex: 1;
      min-width: 240px;
    }

    .matrix-editor-label {
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class MatrixEditor {
  readonly question = input.required<MatrixQuestion>();
  readonly questionChange = output<MatrixQuestion>();

  protected readonly rowsLabel = translateSignal('matrixEditor.rowsLabel');
  protected readonly columnsLabel = translateSignal('matrixEditor.columnsLabel');

  onRowsChange(rows: Option[]): void {
    this.questionChange.emit({ ...this.question(), rows });
  }

  onColumnsChange(columns: Option[]): void {
    this.questionChange.emit({ ...this.question(), columns });
  }
}
