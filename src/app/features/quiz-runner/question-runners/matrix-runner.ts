import { Component, input, output } from '@angular/core';
import { MatrixQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-matrix-runner',
  template: `
    <div class="matrix-runner-wrapper">
      <table class="matrix-runner">
        <thead>
          <tr>
            <th></th>
            @for (column of question().columns; track column.id) {
              <th>{{ column.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of question().rows; track row.id) {
            <tr>
              <td class="matrix-runner-row-label">{{ row.label }}</td>
              @for (column of question().columns; track column.id) {
                <td>
                  <input
                    type="radio"
                    [name]="row.id"
                    [checked]="matches()[row.id] === column.id"
                    (change)="onSelect(row.id, column.id)"
                    [attr.aria-label]="row.label + ': ' + column.label"
                  />
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .matrix-runner-wrapper {
      overflow-x: auto;
    }

    .matrix-runner {
      border-collapse: collapse;
      width: 100%;
    }

    .matrix-runner th,
    .matrix-runner td {
      padding: 0.5rem;
      text-align: center;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .matrix-runner-row-label {
      text-align: left;
    }
  `,
})
export class MatrixRunner {
  readonly question = input.required<MatrixQuestion>();
  readonly matches = input<Record<string, string>>({});
  readonly matchesChange = output<Record<string, string>>();

  onSelect(rowId: string, columnId: string): void {
    this.matchesChange.emit({ ...this.matches(), [rowId]: columnId });
  }
}
