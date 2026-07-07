import { Component, computed, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConstantSumQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-constant-sum-runner',
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <div class="constant-sum-runner">
      @for (option of question().options; track option.id) {
        <mat-form-field appearance="outline" class="constant-sum-runner-field">
          <mat-label>{{ option.label }}</mat-label>
          <input
            matInput
            type="number"
            [value]="distribution()[option.id] ?? ''"
            (input)="onValueChange(option.id, $any($event.target).value)"
          />
        </mat-form-field>
      }
      <p class="constant-sum-runner-remaining" [class.invalid]="remaining() !== 0">
        Осталось распределить: {{ remaining() }} из {{ question().total }}
      </p>
    </div>
  `,
})
export class ConstantSumRunner {
  readonly question = input.required<ConstantSumQuestion>();
  readonly distribution = input<Record<string, number>>({});
  readonly distributionChange = output<Record<string, number>>();

  private readonly sum = computed(() =>
    Object.values(this.distribution()).reduce((total, value) => total + value, 0),
  );
  readonly remaining = computed(() => this.question().total - this.sum());

  onValueChange(optionId: string, value: string): void {
    const parsed = value.trim() ? Number(value) : 0;
    const next = { ...this.distribution(), [optionId]: Number.isFinite(parsed) ? parsed : 0 };
    this.distributionChange.emit(next);
  }
}
