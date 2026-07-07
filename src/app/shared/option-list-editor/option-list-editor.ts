import { Component, computed, input, output } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  addOption,
  removeOption,
  toggleId,
  updateOptionImageUrl,
  updateOptionLabel,
} from '../../core/models/question-options';
import { Option } from '../../core/models/quiz.models';

@Component({
  selector: 'app-option-list-editor',
  imports: [DragDropModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './option-list-editor.html',
  styleUrl: './option-list-editor.scss',
})
export class OptionListEditor {
  readonly options = input.required<Option[]>();
  readonly correctOptionIds = input<string[]>([]);
  readonly selectionMode = input<'single' | 'multiple'>('single');
  readonly showCorrectMarking = input(false);
  readonly showImageUrl = input(false);
  readonly reorderable = input(false);

  readonly optionsChange = output<Option[]>();
  readonly correctOptionIdsChange = output<string[]>();

  private readonly correctOptionIdSet = computed(() => new Set(this.correctOptionIds()));

  isCorrect(optionId: string): boolean {
    return this.correctOptionIdSet().has(optionId);
  }

  addOption(): void {
    this.optionsChange.emit(addOption(this.options()));
  }

  removeOption(optionId: string): void {
    this.optionsChange.emit(removeOption(this.options(), optionId));
    if (this.isCorrect(optionId)) {
      this.correctOptionIdsChange.emit(this.correctOptionIds().filter((id) => id !== optionId));
    }
  }

  updateLabel(optionId: string, label: string): void {
    this.optionsChange.emit(updateOptionLabel(this.options(), optionId, label));
  }

  updateImageUrl(optionId: string, imageUrl: string): void {
    this.optionsChange.emit(updateOptionImageUrl(this.options(), optionId, imageUrl));
  }

  onFileSelected(optionId: string, files: FileList | null): void {
    const file = files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => this.updateImageUrl(optionId, reader.result as string);
    reader.readAsDataURL(file);
  }

  drop(event: CdkDragDrop<Option[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const next = [...this.options()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.optionsChange.emit(next);
  }

  toggleCorrect(optionId: string): void {
    if (this.selectionMode() === 'single') {
      const current = this.correctOptionIds()[0];
      this.correctOptionIdsChange.emit(current === optionId ? [] : [optionId]);
    } else {
      this.correctOptionIdsChange.emit(toggleId(this.correctOptionIds(), optionId));
    }
  }
}
