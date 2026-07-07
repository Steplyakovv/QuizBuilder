import { Component, computed, effect, input, output, untracked } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { shuffle } from '../../../core/utils/shuffle';
import { RankingQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-ranking-runner',
  imports: [DragDropModule, MatIconModule],
  template: `
    <div cdkDropList class="ranking-runner" (cdkDropListDropped)="drop($event)">
      @for (id of order(); track id) {
        <div cdkDrag class="ranking-item">
          <span cdkDragHandle class="drag-handle" aria-label="Перетащить для изменения порядка">
            <mat-icon>drag_indicator</mat-icon>
          </span>
          {{ labelFor(id) }}
        </div>
      }
    </div>
  `,
  styles: `
    .ranking-runner {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 4px;
      background: var(--mat-sys-surface);
    }

    .drag-handle {
      cursor: grab;
      display: flex;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class RankingRunner {
  readonly question = input.required<RankingQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  private readonly shuffledIds = computed(() => shuffle(this.question().options).map((o) => o.id));

  readonly order = computed(() => {
    const selected = this.selectedOptionIds();
    return selected.length === this.question().options.length ? selected : this.shuffledIds();
  });

  constructor() {
    effect(() => {
      const shuffled = this.shuffledIds();
      const selected = untracked(() => this.selectedOptionIds());
      if (selected.length !== shuffled.length) {
        this.selectionChange.emit(shuffled);
      }
    });
  }

  labelFor(id: string): string {
    return this.question().options.find((option) => option.id === id)?.label ?? '';
  }

  drop(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const next = [...this.order()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.selectionChange.emit(next);
  }
}
