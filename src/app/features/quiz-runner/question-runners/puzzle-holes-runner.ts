import { Component, computed, inject, input, output, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { puzzleGridSize } from '../../../core/models/puzzle';
import {
  pieceEdges,
  piecePathD,
  selectedHoleIndices,
  PUZZLE_PIECE_SIZE as PIECE_SIZE,
  PUZZLE_TAB_MARGIN as TAB_MARGIN,
} from '../../../core/models/puzzle-shape';
import { PuzzleHolePlacement, PuzzleHolesQuestion } from '../../../core/models/quiz.models';
import { shuffle } from '../../../core/utils/shuffle';

const BOX_SIZE = PIECE_SIZE + 2 * TAB_MARGIN;

@Component({
  selector: 'app-puzzle-holes-runner',
  templateUrl: './puzzle-holes-runner.html',
  styleUrl: './puzzle-holes-runner.scss',
})
export class PuzzleHolesRunner {
  private readonly transloco = inject(TranslocoService);

  readonly question = input.required<PuzzleHolesQuestion>();
  readonly placements = input<PuzzleHolePlacement[]>([]);
  readonly placementsChange = output<PuzzleHolePlacement[]>();

  protected readonly boxSize = BOX_SIZE;

  protected readonly gridSize = computed(() => puzzleGridSize(this.question().pieceCount));
  // Not protected: tests need to read the hole set without duplicating selectedHoleIndices.
  readonly holeIndices = computed(() =>
    selectedHoleIndices(this.question().pieceCount, this.question().holeCount),
  );

  // Stable across every interaction (depends only on question(), not placements()) so the
  // tray doesn't visually reshuffle every time a piece is placed - mirrors puzzle-runner.ts.
  private readonly shuffledOrder = computed(() => shuffle(this.holeIndices()));
  private readonly placedByPiece = computed(
    () => new Map(this.placements().map((p) => [p.pieceIndex, p])),
  );

  protected readonly occupantByHole = computed(() => {
    const map = new Map<number, number>();
    for (const p of this.placements()) {
      map.set(p.cellIndex, p.pieceIndex);
    }
    return map;
  });

  protected readonly tray = computed(() =>
    this.shuffledOrder().filter((i) => !this.placedByPiece().has(i)),
  );

  occupantOf(cellIndex: number): number | null {
    return this.occupantByHole().get(cellIndex) ?? null;
  }

  protected readonly picked = signal<number | null>(null);

  private clipPathFor(pieceIndex: number): string {
    const { rows, columns } = this.gridSize();
    const d = piecePathD(pieceEdges(pieceIndex, rows, columns), PIECE_SIZE, TAB_MARGIN);
    return `path('${d}')`;
  }

  baseImageStyle(): Record<string, string> {
    return {
      'background-image': `url(${this.question().imageUrl})`,
      'background-size': '100% 100%',
    };
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
    };
  }

  placeholderStyle(cellIndex: number): Record<string, string> {
    return { 'clip-path': this.clipPathFor(cellIndex) };
  }

  /** Absolute position of a hole's bleed box, so its tabs can overlap the intact picture. */
  holeWrapStyle(cellIndex: number): Record<string, string> {
    const { columns } = this.gridSize();
    const row = Math.floor(cellIndex / columns);
    const col = cellIndex % columns;
    return {
      left: `${col * PIECE_SIZE - TAB_MARGIN}px`,
      top: `${row * PIECE_SIZE - TAB_MARGIN}px`,
      'z-index': String(cellIndex + 1),
    };
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
      ? this.transloco.translate('puzzleHolesRunner.pickedUp')
      : this.transloco.translate('puzzleHolesRunner.notPicked');
    const label = this.transloco.translate('puzzleHolesRunner.pieceLabel', {
      index: pieceIndex + 1,
    });
    return `${label}, ${status}`;
  }

  holeLabel(cellIndex: number): string {
    return this.transloco.translate('puzzleHolesRunner.holeLabel', { index: cellIndex + 1 });
  }

  trayLabel(): string {
    return this.transloco.translate('puzzleHolesRunner.trayLabel');
  }

  returnToTrayLabel(): string {
    return this.transloco.translate('puzzleHolesRunner.returnToTray');
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
    const occupant = this.occupantByHole().get(cellIndex) ?? null;
    const previousPlacement = this.placedByPiece().get(pieceIndex);

    let next = this.placements().filter(
      (p) => p.pieceIndex !== pieceIndex && p.pieceIndex !== occupant,
    );
    next = [...next, { pieceIndex, cellIndex }];
    if (occupant !== null && occupant !== pieceIndex && previousPlacement) {
      next = [...next, { pieceIndex: occupant, cellIndex: previousPlacement.cellIndex }];
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
