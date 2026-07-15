import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoService, translateSignal } from '@jsverse/transloco';
import { puzzleGridSize } from '../../../core/models/puzzle';
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

  gridHintLabel(): string {
    const { rows, columns } = this.gridSize();
    return this.transloco.translate('puzzleEditor.gridHint', { rows, columns });
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
