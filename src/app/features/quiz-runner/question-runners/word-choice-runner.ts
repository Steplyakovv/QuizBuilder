import { Component, computed, input, output } from '@angular/core';
import { shuffle } from '../../../core/utils/shuffle';
import { WordChoiceQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-word-choice-runner',
  template: `
    <div class="word-choice-runner">
      <div class="word-choice-answer">
        @for (id of selectedOptionIds(); track id) {
          <button type="button" class="word-chip word-chip--selected" (click)="remove(id)">
            {{ labelFor(id) }}
          </button>
        }
        @if (selectedOptionIds().length === 0) {
          <span class="word-choice-placeholder">Собирайте фразу, нажимая на слова ниже</span>
        }
      </div>
      <div class="word-choice-pool">
        @for (word of availableWords(); track word.id) {
          <button type="button" class="word-chip" (click)="add(word.id)">{{ word.label }}</button>
        }
      </div>
    </div>
  `,
  styles: `
    .word-choice-runner {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .word-choice-answer {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      min-height: 2.5rem;
      padding: 0.5rem;
      border: 1px dashed var(--mat-sys-outline);
      border-radius: 4px;
    }

    .word-choice-placeholder {
      color: var(--mat-sys-on-surface-variant);
      font-size: 0.875rem;
    }

    .word-choice-pool {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .word-chip {
      padding: 0.375rem 0.75rem;
      border-radius: 999px;
      border: 1px solid var(--mat-sys-outline);
      background: var(--mat-sys-surface);
      cursor: pointer;
      font: inherit;
    }

    .word-chip--selected {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
      border-color: transparent;
    }
  `,
})
export class WordChoiceRunner {
  readonly question = input.required<WordChoiceQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  private readonly shuffledWords = computed(() => shuffle(this.question().words));

  readonly availableWords = computed(() =>
    this.shuffledWords().filter((word) => !this.selectedOptionIds().includes(word.id)),
  );

  labelFor(id: string): string {
    return this.question().words.find((word) => word.id === id)?.label ?? '';
  }

  add(id: string): void {
    this.selectionChange.emit([...this.selectedOptionIds(), id]);
  }

  remove(id: string): void {
    this.selectionChange.emit(this.selectedOptionIds().filter((existing) => existing !== id));
  }
}
