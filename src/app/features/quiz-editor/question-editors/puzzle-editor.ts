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
  PUZZLE_PIECE_SIZE as PIECE_SIZE,
  PUZZLE_TAB_MARGIN as TAB_MARGIN,
} from '../../../core/models/puzzle-shape';
import { PuzzleQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-puzzle-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './puzzle-editor.html',
  styleUrl: './puzzle-editor.scss',
})
export class PuzzleEditor {
  readonly question = input.required<PuzzleQuestion>();
  readonly questionChange = output<PuzzleQuestion>();

  protected readonly imageUrlLabel = translateSignal('puzzleEditor.imageUrlLabel');
  protected readonly uploadFileLabel = translateSignal('puzzleEditor.uploadFile');
  protected readonly pieceCountLabel = translateSignal('puzzleEditor.pieceCountLabel');

  private readonly transloco = inject(TranslocoService);

  protected readonly gridSize = computed(() => puzzleGridSize(this.question().pieceCount));
  protected readonly gridCells = computed(() => {
    const { rows, columns } = this.gridSize();
    return Array.from({ length: rows * columns }, (_, i) => i);
  });

  protected readonly previewSize = computed(() => {
    const { rows, columns } = this.gridSize();
    return { width: columns * PIECE_SIZE, height: rows * PIECE_SIZE };
  });

  gridHintLabel(): string {
    const { rows, columns } = this.gridSize();
    return this.transloco.translate('puzzleEditor.gridHint', { rows, columns });
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
    this.questionChange.emit({ ...this.question(), pieceCount });
  }
}
