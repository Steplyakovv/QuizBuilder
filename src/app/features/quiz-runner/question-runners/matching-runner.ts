import { Component, computed, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { shuffle } from '../../../core/utils/shuffle';
import { MatchingQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-matching-runner',
  imports: [MatFormFieldModule, MatSelectModule],
  template: `
    <div class="matching-runner">
      @for (pair of question().pairs; track pair.id) {
        <div class="matching-row">
          <span class="matching-left">{{ pair.left }}</span>
          <mat-form-field appearance="outline" class="matching-select">
            <mat-select [value]="matches()[pair.id]" (valueChange)="onMatchChange(pair.id, $event)">
              @for (option of shuffledRight(); track option.id) {
                <mat-option [value]="option.id">{{ option.right }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      }
    </div>
  `,
  styles: `
    .matching-runner {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .matching-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .matching-left {
      flex: 1;
    }

    .matching-select {
      flex: 1;
    }
  `,
})
export class MatchingRunner {
  readonly question = input.required<MatchingQuestion>();
  readonly matches = input<Record<string, string>>({});
  readonly matchesChange = output<Record<string, string>>();

  readonly shuffledRight = computed(() => shuffle(this.question().pairs));

  onMatchChange(leftId: string, rightId: string): void {
    this.matchesChange.emit({ ...this.matches(), [leftId]: rightId });
  }
}
