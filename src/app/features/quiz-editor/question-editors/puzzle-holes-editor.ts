import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoService, translateSignal } from '@jsverse/transloco';
import { puzzleGridSize } from '../../../core/models/puzzle';
import {
  pieceEdges,
  piecePathD,
  selectedHoleIndices,
  PUZZLE_PIECE_SIZE as PIECE_SIZE,
  PUZZLE_TAB_MARGIN as TAB_MARGIN,
} from '../../../core/models/puzzle-shape';
import { PuzzleHolesQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-puzzle-holes-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './puzzle-holes-editor.html',
  styleUrl: './puzzle-holes-editor.scss',
})
export class PuzzleHolesEditor {
  readonly question = input.required<PuzzleHolesQuestion>();
  readonly questionChange = output<PuzzleHolesQuestion>();

  protected readonly imageUrlLabel = translateSignal('puzzleHolesEditor.imageUrlLabel');
  protected readonly uploadFileLabel = translateSignal('puzzleHolesEditor.uploadFile');
  protected readonly pieceCountLabel = translateSignal('puzzleHolesEditor.pieceCountLabel');
  protected readonly holeCountLabel = translateSignal('puzzleHolesEditor.holeCountLabel');

  private readonly transloco = inject(TranslocoService);

  protected readonly gridSize = computed(() => puzzleGridSize(this.question().pieceCount));
  protected readonly gridCells = computed(() => {
    const { rows, columns } = this.gridSize();
    return Array.from({ length: rows * columns }, (_, i) => i);
  });

  protected readonly holeIndices = computed(() =>
    selectedHoleIndices(this.question().pieceCount, this.question().holeCount),
  );

  protected readonly previewSize = computed(() => {
    const { rows, columns } = this.gridSize();
    return { width: columns * PIECE_SIZE, height: rows * PIECE_SIZE };
  });

  gridHintLabel(): string {
    const { rows, columns } = this.gridSize();
    return this.transloco.translate('puzzleHolesEditor.gridHint', { rows, columns });
  }

  isHole(pieceIndex: number): boolean {
    return this.holeIndices().includes(pieceIndex);
  }

  piecePathFor(pieceIndex: number): string {
    const { rows, columns } = this.gridSize();
    return piecePathD(pieceEdges(pieceIndex, rows, columns), PIECE_SIZE, TAB_MARGIN);
  }

  pieceTransform(pieceIndex: number): string {
    const { columns } = this.gridSize();
    const row = Math.floor(pieceIndex / columns);
    const col = pieceIndex % columns;
    return `translate(${col * PIECE_SIZE - TAB_MARGIN}, ${row * PIECE_SIZE - TAB_MARGIN})`;
  }

  updateImageUrl(imageUrl: string): void {
    this.questionChange.emit({ ...this.question(), imageUrl });
  }

  onFileSelected(files: FileList | null): void {
    const file = files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.updateImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  onPieceCountChange(value: string): void {
    const parsed = Number(value);
    const pieceCount = Number.isFinite(parsed) && parsed >= 2 ? Math.floor(parsed) : 2;
    const holeCount = Math.min(this.question().holeCount, pieceCount);
    this.questionChange.emit({ ...this.question(), pieceCount, holeCount });
  }

  onHoleCountChange(value: string): void {
    const parsed = Number(value);
    const pieceCount = this.question().pieceCount;
    const holeCount =
      Number.isFinite(parsed) && parsed >= 1 ? Math.min(Math.floor(parsed), pieceCount) : 1;
    this.questionChange.emit({ ...this.question(), holeCount });
  }
}
