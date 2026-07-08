import { Component, computed, input, output, signal } from '@angular/core';
import { shuffle } from '../../../core/utils/shuffle';
import { MatchingQuestion } from '../../../core/models/quiz.models';

type MatchingSide = 'left' | 'right';

interface MatchingLine {
  leftId: string;
  leftY: number;
  rightY: number;
}

@Component({
  selector: 'app-matching-runner',
  template: `
    <div class="matching-runner">
      <div class="matching-column matching-column--left">
        @for (pair of question().pairs; track pair.id) {
          <button
            type="button"
            class="matching-node"
            [class.matching-node--pending]="isPending(pair.id, 'left')"
            [class.matching-node--matched]="isMatched(pair.id, 'left')"
            (click)="onNodeClick(pair.id, 'left')"
          >
            {{ pair.left }}
          </button>
        }
      </div>

      <div class="matching-links">
        <svg class="matching-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          @for (line of lines(); track line.leftId) {
            <line
              [attr.x1]="100"
              [attr.y1]="line.rightY"
              [attr.x2]="0"
              [attr.y2]="line.leftY"
              class="matching-line"
            />
          }
        </svg>
        @for (line of lines(); track line.leftId) {
          <span class="matching-arrowhead" [style.top.%]="line.leftY"></span>
        }
      </div>

      <div class="matching-column matching-column--right">
        @for (option of shuffledRight(); track option.id) {
          <button
            type="button"
            class="matching-node"
            [class.matching-node--pending]="isPending(option.id, 'right')"
            [class.matching-node--matched]="isMatched(option.id, 'right')"
            (click)="onNodeClick(option.id, 'right')"
          >
            {{ option.right }}
          </button>
        }
      </div>
    </div>
  `,
  styles: `
    .matching-runner {
      display: grid;
      grid-template-columns: 1fr 3rem 1fr;
    }

    .matching-links {
      position: relative;
    }

    .matching-lines {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .matching-line {
      stroke: var(--mat-sys-primary);
      stroke-width: 0.6;
      vector-effect: non-scaling-stroke;
    }

    .matching-arrowhead {
      position: absolute;
      left: 0;
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-right: 7px solid var(--mat-sys-primary);
      transform: translateY(-50%);
      pointer-events: none;
    }

    .matching-column {
      display: flex;
      flex-direction: column;
    }

    .matching-node {
      height: 2.75rem;
      padding: 0 1rem;
      border: 1px solid var(--mat-sys-outline);
      background: var(--mat-sys-surface);
      color: inherit;
      font: inherit;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    .matching-node:not(:first-child) {
      border-top: none;
    }

    .matching-column--left .matching-node {
      text-align: right;
    }

    .matching-column--left .matching-node:first-child {
      border-top-left-radius: 4px;
    }

    .matching-column--left .matching-node:last-child {
      border-bottom-left-radius: 4px;
    }

    .matching-column--right .matching-node:first-child {
      border-top-right-radius: 4px;
    }

    .matching-column--right .matching-node:last-child {
      border-bottom-right-radius: 4px;
    }

    .matching-node--matched {
      border-color: var(--mat-sys-primary);
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    .matching-node--pending {
      border-color: #2e7d32;
      background: #e8f5e9;
      color: #1b5e20;
    }
  `,
})
export class MatchingRunner {
  readonly question = input.required<MatchingQuestion>();
  readonly matches = input<Record<string, string>>({});
  readonly matchesChange = output<Record<string, string>>();

  readonly shuffledRight = computed(() => shuffle(this.question().pairs));
  readonly pending = signal<{ id: string; side: MatchingSide } | null>(null);

  readonly lines = computed<MatchingLine[]>(() => {
    const leftOrder = this.question().pairs;
    const rightOrder = this.shuffledRight();
    const total = leftOrder.length;
    if (total === 0) {
      return [];
    }
    const result: MatchingLine[] = [];
    for (const [leftId, rightId] of Object.entries(this.matches())) {
      const leftIndex = leftOrder.findIndex((pair) => pair.id === leftId);
      const rightIndex = rightOrder.findIndex((pair) => pair.id === rightId);
      if (leftIndex === -1 || rightIndex === -1) {
        continue;
      }
      result.push({
        leftId,
        leftY: ((leftIndex + 0.5) / total) * 100,
        rightY: ((rightIndex + 0.5) / total) * 100,
      });
    }
    return result;
  });

  isPending(id: string, side: MatchingSide): boolean {
    const current = this.pending();
    return !!current && current.id === id && current.side === side;
  }

  isMatched(id: string, side: MatchingSide): boolean {
    const matches = this.matches();
    return side === 'left' ? id in matches : Object.values(matches).includes(id);
  }

  onNodeClick(id: string, side: MatchingSide): void {
    const current = this.pending();
    if (current?.id === id && current.side === side) {
      this.pending.set(null);
      return;
    }
    if (current && current.side !== side) {
      const leftId = side === 'left' ? id : current.id;
      const rightId = side === 'right' ? id : current.id;
      const next = { ...this.matches() };
      delete next[leftId];
      for (const key of Object.keys(next)) {
        if (next[key] === rightId) {
          delete next[key];
        }
      }
      next[leftId] = rightId;
      this.matchesChange.emit(next);
      this.pending.set(null);
      return;
    }
    this.pending.set({ id, side });
  }
}
