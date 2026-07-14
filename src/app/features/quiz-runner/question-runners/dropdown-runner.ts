import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { translateSignal } from '@jsverse/transloco';
import { DropdownQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-dropdown-runner',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline" class="dropdown-runner-field">
      <mat-label>{{ selectOptionLabel() }}</mat-label>
      <mat-select
        [value]="selectedOptionIds()[0]"
        (valueChange)="selectionChange.emit($event ? [$event] : [])"
      >
        @for (option of question().options; track option.id) {
          <mat-option [value]="option.id">{{ option.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
})
export class DropdownRunner {
  readonly question = input.required<DropdownQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  protected readonly selectOptionLabel = translateSignal('dropdownRunner.selectOption');
}
