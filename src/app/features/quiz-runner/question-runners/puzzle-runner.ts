import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoService } from '@jsverse/transloco';
import { puzzleGridSize } from '../../../core/models/puzzle';
import {
  pieceEdges,
  piecePathD,
  PUZZLE_PIECE_SIZE as PIECE_SIZE,
  PUZZLE_TAB_MARGIN as TAB_MARGIN,
} from '../../../core/models/puzzle-shape';
import { PuzzlePlacement, PuzzleQuestion } from '../../../core/models/quiz.models';
import { shuffle } from '../../../core/utils/shuffle';

const BOX_SIZE = PIECE_SIZE + 2 * TAB_MARGIN;

@Component({
  selector: 'app-puzzle-runner',
  imports: [MatIconModule],
  templateUrl: './puzzle-runner.html',
  styleUrl: './puzzle-runner.scss',
})
export class PuzzleRunner {
  private readonly transloco = inject(TranslocoService);

  readonly question = input.required<PuzzleQuestion>();
  readonly placements = input<PuzzlePlacement[]>([]);
  readonly placementsChange = output<PuzzlePlacement[]>();

  protected readonly boxSize = BOX_SIZE;

  protected readonly gridSize = computed(() => puzzleGridSize(this.question().pieceCount));
  protected readonly cellIndexes = computed(() =>
    Array.from({ length: this.question().pieceCount }, (_, i) => i),
  );

  // Stable across every interaction (depends only on question(), not placements()) so the
  // tray doesn't visually reshuffle every time a piece is placed - mirrors ranking-runner.ts.
  private readonly shuffledOrder = computed(() =>
    shuffle(Array.from({ length: this.question().pieceCount }, (_, i) => i)),
  );
  private readonly placedByPiece = computed(
    () => new Map(this.placements().map((p) => [p.pieceIndex, p])),
  );

  protected readonly grid = computed(() => {
    const cells = new Array<number | null>(this.question().pieceCount).fill(null);
    for (const p of this.placements()) {
      cells[p.cellIndex] = p.pieceIndex;
    }
    return cells;
  });

  protected readonly tray = computed(() =>
    this.shuffledOrder().filter((i) => !this.placedByPiece().has(i)),
  );

  protected readonly picked = signal<number | null>(null);
  // Tray pieces aren't part of the answer yet, so their rotation is local/ephemeral UI state -
  // lost on remount, which is fine since only placed-piece rotation counts toward correctness.
  private readonly trayRotationOverrides = signal<Record<number, number>>({});

  private deterministicTrayRotation(pieceIndex: number): number {
    return ((pieceIndex * 73 + 41) % 4) * 90;
  }

  rotationOf(pieceIndex: number): number {
    const placed = this.placedByPiece().get(pieceIndex);
    if (placed) {
      return placed.rotationDegrees;
    }
    return this.trayRotationOverrides()[pieceIndex] ?? this.deterministicTrayRotation(pieceIndex);
  }

  private clipPathFor(pieceIndex: number): string {
    const { rows, columns } = this.gridSize();
    const d = piecePathD(pieceEdges(pieceIndex, rows, columns), PIECE_SIZE, TAB_MARGIN);
    return `path('${d}')`;
  }

  pieceStyle(pieceIndex: number): Record<string, string> {
    const { rows, columns } = this.gridSize();
    const row = Math.floor(pieceIndex / columns);
    const col = pieceIndex % columns;
    return {
      'background-image': `url(${this.question().imageUrl})`,
      'background-size': `${PIECE_SIZE * columns}px ${PIECE_SIZE * rows}px`,
      'background-position': `${TAB_MARGIN - col * PIECE_SIZE}px ${TAB_MARGIN - row * PIECE_SIZE}px`,
      'clip-path': this.clipPathFor(pieceIndex),
      transform: `rotate(${this.rotationOf(pieceIndex)}deg)`,
    };
  }

  /** Absolute position of a placed piece's bleed box, so its tabs can overlap into neighbours. */
  gridWrapStyle(cellIndex: number): Record<string, string> {
    const { columns } = this.gridSize();
    const row = Math.floor(cellIndex / columns);
    const col = cellIndex % columns;
    return {
      left: `${col * PIECE_SIZE - TAB_MARGIN}px`,
      top: `${row * PIECE_SIZE - TAB_MARGIN}px`,
      'z-index': String(cellIndex + 1),
    };
  }

  /**
   * Positioned relative to .puzzle-grid directly (a sibling of every .puzzle-tile-wrap), not
   * nested inside its own piece's wrap - a wrap's z-index scopes its own stacking context, so a
   * button nested inside a lower-z-index wrap could be covered by a higher-z-index neighbour's
   * tab bleed with no way to out-z-index it locally. A shared very-high z-index sidesteps that.
   */
  rotateButtonStyle(cellIndex: number): Record<string, string> {
    const { columns } = this.gridSize();
    const row = Math.floor(cellIndex / columns);
    const col = cellIndex % columns;
    return {
      left: `${col * PIECE_SIZE + PIECE_SIZE - 18}px`,
      top: `${row * PIECE_SIZE - 6}px`,
      right: 'auto',
      'z-index': '1000',
    };
  }

  emptyCellStyle(cellIndex: number): Record<string, string> {
    const { columns } = this.gridSize();
    const row = Math.floor(cellIndex / columns);
    const col = cellIndex % columns;
    return { left: `${col * PIECE_SIZE}px`, top: `${row * PIECE_SIZE}px` };
  }

  gridContainerStyle(): Record<string, string> {
    const { rows, columns } = this.gridSize();
    return { width: `${columns * PIECE_SIZE}px`, height: `${rows * PIECE_SIZE}px` };
  }

  isPicked(pieceIndex: number): boolean {
    return this.picked() === pieceIndex;
  }

  pieceLabel(pieceIndex: number): string {
    const status = this.isPicked(pieceIndex)
      ? this.transloco.translate('puzzleRunner.pickedUp')
      : this.transloco.translate('puzzleRunner.notPicked');
    const label = this.transloco.translate('puzzleRunner.pieceLabel', { index: pieceIndex + 1 });
    return `${label}, ${status}`;
  }

  rotateLabel(): string {
    return this.transloco.translate('puzzleRunner.rotateLabel');
  }

  emptyCellLabel(cellIndex: number): string {
    return this.transloco.translate('puzzleRunner.emptyCell', { index: cellIndex + 1 });
  }

  trayLabel(): string {
    return this.transloco.translate('puzzleRunner.trayLabel');
  }

  returnToTrayLabel(): string {
    return this.transloco.translate('puzzleRunner.returnToTray');
  }

  onTileClick(pieceIndex: number): void {
    const current = this.picked();
    if (current === null || current === pieceIndex) {
      this.picked.set(current === pieceIndex ? null : pieceIndex);
      return;
    }
    const targetPlacement = this.placedByPiece().get(pieceIndex);
    if (targetPlacement) {
      this.placeInCell(targetPlacement.cellIndex);
    } else {
      this.picked.set(pieceIndex);
    }
  }

  placeInCell(cellIndex: number): void {
    const pieceIndex = this.picked();
    if (pieceIndex === null) {
      return;
    }
    const rotationDegrees = this.rotationOf(pieceIndex);
    const occupant = this.grid()[cellIndex];
    const previousPlacement = this.placedByPiece().get(pieceIndex);

    let next = this.placements().filter(
      (p) => p.pieceIndex !== pieceIndex && p.pieceIndex !== occupant,
    );
    next = [...next, { pieceIndex, cellIndex, rotationDegrees }];
    if (occupant !== null && occupant !== pieceIndex && previousPlacement) {
      next = [
        ...next,
        {
          pieceIndex: occupant,
          cellIndex: previousPlacement.cellIndex,
          rotationDegrees: this.rotationOf(occupant),
        },
      ];
    }
    this.picked.set(null);
    this.placementsChange.emit(next);
  }

  returnToTray(): void {
    const pieceIndex = this.picked();
    if (pieceIndex === null || !this.placedByPiece().has(pieceIndex)) {
      this.picked.set(null);
      return;
    }
    const next = this.placements().filter((p) => p.pieceIndex !== pieceIndex);
    this.picked.set(null);
    this.placementsChange.emit(next);
  }

  rotate(pieceIndex: number, event: Event): void {
    event.stopPropagation();
    const placed = this.placedByPiece().get(pieceIndex);
    if (placed) {
      const rotationDegrees = (placed.rotationDegrees + 90) % 360;
      const next = this.placements().map((p) =>
        p.pieceIndex === pieceIndex ? { ...p, rotationDegrees } : p,
      );
      this.placementsChange.emit(next);
    } else {
      const current = this.rotationOf(pieceIndex);
      this.trayRotationOverrides.update((overrides) => ({
        ...overrides,
        [pieceIndex]: (current + 90) % 360,
      }));
    }
  }

  onDragStart(pieceIndex: number): void {
    this.picked.set(pieceIndex);
  }

  onDropOnCell(cellIndex: number, event: DragEvent): void {
    event.preventDefault();
    this.placeInCell(cellIndex);
  }

  onDropOnTray(event: DragEvent): void {
    event.preventDefault();
    this.returnToTray();
  }
}
