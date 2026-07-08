import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { addRegion, removeRegion, updateRegionSize } from '../../../core/models/hotspot-regions';
import { HotspotQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-hotspot-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <div class="hotspot-editor">
      <div class="image-url-row">
        <mat-form-field appearance="outline" class="image-url-field">
          <mat-label>URL картинки</mat-label>
          <input
            matInput
            [value]="question().imageUrl"
            (blur)="updateImageUrl($any($event.target).value)"
          />
        </mat-form-field>
        <button mat-stroked-button type="button" (click)="fileInput.click()">
          <mat-icon>upload</mat-icon>
          Загрузить файл
        </button>
        <input
          #fileInput
          type="file"
          accept="image/*"
          hidden
          (change)="onFileSelected($any($event.target).files); $any($event.target).value = ''"
        />
      </div>

      @if (question().imageUrl) {
        <p class="hotspot-hint">Кликните по картинке, чтобы добавить область.</p>
        <div
          class="hotspot-image-wrap"
          tabindex="0"
          role="button"
          aria-label="Добавить область по клику или нажатию Enter (в центр изображения)"
          (click)="onImageClick($event)"
          (keydown.enter)="addRegionAtCenter()"
        >
          <img [src]="question().imageUrl" alt="" class="hotspot-image" />
          @for (region of question().regions; track region.id; let i = $index) {
            <div
              class="hotspot-region"
              [class.hotspot-region--correct]="region.id === question().correctRegionId"
              [style.left.%]="region.x"
              [style.top.%]="region.y"
              [style.width.%]="region.width"
              [style.height.%]="region.height"
            >
              {{ i + 1 }}
            </div>
          }
        </div>
      }

      @if (question().regions.length > 0) {
        <table class="hotspot-region-list">
          @for (region of question().regions; track region.id; let i = $index) {
            <tr>
              <td class="hotspot-region-index">Область №{{ i + 1 }}</td>
              <td>
                <mat-form-field appearance="outline" class="size-field">
                  <mat-label>Ширина, %</mat-label>
                  <input
                    matInput
                    type="number"
                    min="1"
                    max="100"
                    [value]="region.width"
                    (blur)="updateSize(region.id, 'width', $any($event.target).value)"
                  />
                </mat-form-field>
              </td>
              <td>
                <mat-form-field appearance="outline" class="size-field">
                  <mat-label>Высота, %</mat-label>
                  <input
                    matInput
                    type="number"
                    min="1"
                    max="100"
                    [value]="region.height"
                    (blur)="updateSize(region.id, 'height', $any($event.target).value)"
                  />
                </mat-form-field>
              </td>
              @if (graded()) {
                <td>
                  <button
                    mat-icon-button
                    type="button"
                    [attr.aria-pressed]="region.id === question().correctRegionId"
                    [attr.aria-label]="
                      region.id === question().correctRegionId
                        ? 'Правильная область'
                        : 'Отметить как правильную'
                    "
                    (click)="toggleCorrect(region.id)"
                  >
                    <mat-icon>{{
                      region.id === question().correctRegionId ? 'star' : 'star_border'
                    }}</mat-icon>
                  </button>
                </td>
              }
              <td>
                <button
                  mat-icon-button
                  type="button"
                  (click)="removeRegion(region.id)"
                  aria-label="Удалить область"
                >
                  <mat-icon>close</mat-icon>
                </button>
              </td>
            </tr>
          }
        </table>
      }
    </div>
  `,
  styles: `
    .hotspot-editor {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .image-url-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .image-url-field {
      flex: 1;
    }

    .hotspot-hint {
      margin: 0;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }

    .hotspot-image-wrap {
      position: relative;
      display: inline-block;
      max-width: 100%;
      cursor: crosshair;
    }

    .hotspot-image {
      display: block;
      max-width: 100%;
      max-height: 400px;
    }

    .hotspot-region {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 20%, transparent);
      color: var(--mat-sys-primary);
      font-weight: 600;
      box-sizing: border-box;
    }

    .hotspot-region--correct {
      border-color: #2e7d32;
      background: color-mix(in srgb, #2e7d32 25%, transparent);
      color: #1b5e20;
    }

    .hotspot-region-list {
      border-collapse: collapse;
    }

    .hotspot-region-index {
      padding-right: 0.75rem;
      white-space: nowrap;
    }

    .size-field {
      width: 6rem;
    }
  `,
})
export class HotspotEditor {
  readonly question = input.required<HotspotQuestion>();
  readonly graded = input(false);
  readonly questionChange = output<HotspotQuestion>();

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

  addRegionAtCenter(): void {
    this.questionChange.emit({
      ...this.question(),
      regions: addRegion(this.question().regions, 50, 50),
    });
  }

  onImageClick(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.questionChange.emit({
      ...this.question(),
      regions: addRegion(this.question().regions, x, y),
    });
  }

  updateSize(regionId: string, field: 'width' | 'height', value: string): void {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    this.questionChange.emit({
      ...this.question(),
      regions: updateRegionSize(this.question().regions, regionId, field, parsed),
    });
  }

  removeRegion(regionId: string): void {
    const question = this.question();
    this.questionChange.emit({
      ...question,
      regions: removeRegion(question.regions, regionId),
      correctRegionId: question.correctRegionId === regionId ? undefined : question.correctRegionId,
    });
  }

  toggleCorrect(regionId: string): void {
    const question = this.question();
    this.questionChange.emit({
      ...question,
      correctRegionId: question.correctRegionId === regionId ? undefined : regionId,
    });
  }
}
