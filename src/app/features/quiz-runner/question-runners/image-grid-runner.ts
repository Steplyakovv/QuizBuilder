import { Component, inject, input, output } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { ImageGridQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-image-grid-runner',
  template: `
    <div
      class="image-grid-runner"
      [style.grid-template-columns]="'repeat(' + question().columns + ', 1fr)'"
    >
      @for (option of question().options; track option.id; let i = $index) {
        <button
          type="button"
          class="image-grid-tile"
          [class.image-grid-tile--selected]="isSelected(option.id)"
          [attr.aria-pressed]="isSelected(option.id)"
          [attr.aria-label]="tileLabel(option.id, i)"
          (click)="toggle(option.id)"
        >
          <img [src]="option.imageUrl" alt="" />
        </button>
      }
    </div>
  `,
  styles: `
    .image-grid-runner {
      display: grid;
      gap: 2px;
      max-width: 24rem;
    }

    .image-grid-tile {
      aspect-ratio: 1;
      padding: 0;
      border: 2px solid transparent;
      border-radius: 2px;
      background: none;
      cursor: pointer;
      overflow: hidden;
    }

    .image-grid-tile img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .image-grid-tile--selected {
      border-color: var(--mat-sys-primary);
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: -4px;
    }
  `,
})
export class ImageGridRunner {
  private readonly transloco = inject(TranslocoService);

  readonly question = input.required<ImageGridQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  isSelected(optionId: string): boolean {
    return this.selectedOptionIds().includes(optionId);
  }

  tileLabel(optionId: string, index: number): string {
    const statusKey = this.isSelected(optionId)
      ? 'imageGridRunner.selected'
      : 'imageGridRunner.notSelected';
    const tileLabel = this.transloco.translate('imageGridRunner.tileLabel', { index: index + 1 });
    return `${tileLabel}, ${this.transloco.translate(statusKey)}`;
  }

  toggle(optionId: string): void {
    const current = this.selectedOptionIds();
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    this.selectionChange.emit(next);
  }
}
