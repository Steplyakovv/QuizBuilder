import { Component, computed, input, output } from '@angular/core';
import { splitTemplate } from '../../../core/models/fill-in-the-blank';
import { FillInTheBlankQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-fill-in-the-blank-runner',
  template: `
    <p class="fill-in-the-blank-runner">
      @for (segment of segments(); track $index; let isLast = $last) {
        <span>{{ segment }}</span>
        @if (!isLast) {
          <input
            class="blank-input"
            type="text"
            [value]="blankValue($index)"
            (input)="onBlankChange($index, $any($event.target).value)"
          />
        }
      }
    </p>
  `,
  styles: `
    .fill-in-the-blank-runner {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.25rem;
      margin: 0;
    }

    .blank-input {
      width: 8rem;
      padding: 0.25rem 0.5rem;
      border: none;
      border-bottom: 2px solid var(--mat-sys-outline);
      background: transparent;
      font: inherit;
      text-align: center;
    }

    .blank-input:focus {
      outline: none;
      border-bottom-color: var(--mat-sys-primary);
    }
  `,
})
export class FillInTheBlankRunner {
  readonly question = input.required<FillInTheBlankQuestion>();
  readonly blanks = input<string[]>([]);
  readonly blanksChange = output<string[]>();

  readonly segments = computed(() => splitTemplate(this.question().template));

  blankValue(index: number): string {
    return this.blanks()[index] ?? '';
  }

  onBlankChange(index: number, value: string): void {
    const next = [...this.blanks()];
    next[index] = value;
    this.blanksChange.emit(next);
  }
}
