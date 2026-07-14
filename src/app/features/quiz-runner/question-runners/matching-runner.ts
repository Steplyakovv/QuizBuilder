import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { shuffle } from '../../../core/utils/shuffle';
import { MatchingQuestion } from '../../../core/models/quiz.models';

type MatchingSide = 'left' | 'right';

interface MatchingLine {
  leftId: string;
  leftY: number;
  rightY: number;
  /** Rotation (degrees) so the arrowhead points along the line instead of staying horizontal. */
  angle: number;
}

const ROW_HEIGHT = 44;
const ROW_GAP = 8;
/** Matches the fixed 3rem width of `.matching-links` in the styles below. */
const BRIDGE_WIDTH = 48;

function rowCenterPercent(index: number, total: number): number {
  const totalHeight = total * ROW_HEIGHT + (total - 1) * ROW_GAP;
  if (totalHeight <= 0) {
    return 50;
  }
  const center = index * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2;
  return (center / totalHeight) * 100;
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
            [attr.aria-pressed]="isPending(pair.id, 'left') || isMatched(pair.id, 'left')"
            [attr.aria-label]="pair.left + '. ' + matchStatusLabel(pair.id, 'left')"
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
              [attr.x1]="0"
              [attr.y1]="line.leftY"
              [attr.x2]="100"
              [attr.y2]="line.rightY"
              class="matching-line"
            />
          }
        </svg>
        @for (line of lines(); track line.leftId) {
          <span
            class="matching-arrowhead"
            [style.top.%]="line.rightY"
            [style.transform]="'translateY(-50%) rotate(' + line.angle + 'deg)'"
          ></span>
        }
      </div>

      <div class="matching-column matching-column--right">
        @for (option of shuffledRight(); track option.id) {
          <button
            type="button"
            class="matching-node"
            [class.matching-node--pending]="isPending(option.id, 'right')"
            [class.matching-node--matched]="isMatched(option.id, 'right')"
            [attr.aria-pressed]="isPending(option.id, 'right') || isMatched(option.id, 'right')"
            [attr.aria-label]="option.right + '. ' + matchStatusLabel(option.id, 'right')"
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
      right: 0;
      width: 0;
      height: 0;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 7px solid var(--mat-sys-primary);
      transform-origin: right center;
      pointer-events: none;
    }

    .matching-column {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .matching-node {
      height: 44px;
      padding: 0 1rem;
      border: 1px solid var(--mat-sys-outline);
      border-radius: 4px;
      background: var(--mat-sys-surface);
      color: inherit;
      font: inherit;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }

    .matching-column--left .matching-node {
      text-align: right;
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
  private readonly transloco = inject(TranslocoService);

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
      const verticalSpan = (rightIndex - leftIndex) * (ROW_HEIGHT + ROW_GAP);
      result.push({
        leftId,
        leftY: rowCenterPercent(leftIndex, total),
        rightY: rowCenterPercent(rightIndex, total),
        angle: (Math.atan2(verticalSpan, BRIDGE_WIDTH) * 180) / Math.PI,
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

  matchStatusLabel(id: string, side: MatchingSide): string {
    if (this.isPending(id, side)) {
      return this.transloco.translate('matchingRunner.pendingStatus');
    }
    if (side === 'left') {
      const rightId = this.matches()[id];
      const rightLabel = rightId
        ? this.shuffledRight().find((option) => option.id === rightId)?.right
        : undefined;
      return rightLabel
        ? this.transloco.translate('matchingRunner.matchedWith', { label: rightLabel })
        : this.transloco.translate('matchingRunner.notMatched');
    }
    const leftId = Object.entries(this.matches()).find(([, value]) => value === id)?.[0];
    const leftLabel = leftId
      ? this.question().pairs.find((pair) => pair.id === leftId)?.left
      : undefined;
    return leftLabel
      ? this.transloco.translate('matchingRunner.matchedWith', { label: leftLabel })
      : this.transloco.translate('matchingRunner.notMatched');
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
