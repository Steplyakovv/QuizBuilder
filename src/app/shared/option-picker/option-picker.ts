import { Component, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { Option } from '../../core/models/quiz.models';

@Component({
  selector: 'app-option-picker',
  imports: [MatCheckboxModule, MatRadioModule],
  templateUrl: './option-picker.html',
  styleUrl: './option-picker.scss',
})
export class OptionPicker {
  readonly options = input.required<Option[]>();
  readonly selectionMode = input<'single' | 'multiple'>('single');
  readonly selected = input<string[]>([]);
  readonly showImages = input(false);
  readonly selectedChange = output<string[]>();

  isSelected(optionId: string): boolean {
    return this.selected().includes(optionId);
  }

  onSingleChange(optionId: string): void {
    this.selectedChange.emit([optionId]);
  }

  onMultipleChange(optionId: string, checked: boolean): void {
    const current = this.selected();
    const next = checked ? [...current, optionId] : current.filter((id) => id !== optionId);
    this.selectedChange.emit(next);
  }
}
