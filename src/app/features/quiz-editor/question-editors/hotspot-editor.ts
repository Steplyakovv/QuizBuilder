import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  addRegion,
  moveRegion,
  removeRegion,
  resizeRegion,
  ResizeHandle,
  updateRegionSize,
} from '../../../core/models/hotspot-regions';
import { HotspotQuestion, HotspotRegion } from '../../../core/models/quiz.models';

interface DragState {
  regionId: string;
  handle?: ResizeHandle;
  startClientX: number;
  startClientY: number;
  startRegion: HotspotRegion;
  rectWidth: number;
  rectHeight: number;
}

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
              tabindex="0"
              role="button"
              [attr.aria-label]="regionLabel(region, i)"
              [class.hotspot-region--correct]="region.id === question().correctRegionId"
              [style.left.%]="region.x"
              [style.top.%]="region.y"
              [style.width.%]="region.width"
              [style.height.%]="region.height"
              (mousedown)="startMove($event, region)"
              (keydown)="onRegionKeydown($event, region)"
            >
              {{ i + 1 }}
              @for (handle of handles; track handle) {
                <span
                  [class]="'hotspot-handle hotspot-handle-' + handle"
                  (mousedown)="startResize($event, region, handle)"
                ></span>
              }
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
      align-self: flex-start;
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
      cursor: move;

      &:focus-visible {
        outline: 3px solid var(--mat-sys-primary);
        outline-offset: 2px;
      }
    }

    .hotspot-region--correct {
      border-color: #2e7d32;
      background: color-mix(in srgb, #2e7d32 25%, transparent);
      color: #1b5e20;
    }

    .hotspot-handle {
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--mat-sys-surface);
      border: 2px solid var(--mat-sys-primary);
      border-radius: 50%;
      box-sizing: border-box;
    }

    .hotspot-handle-n {
      top: -6px;
      left: 50%;
      margin-left: -5px;
      cursor: ns-resize;
    }

    .hotspot-handle-s {
      bottom: -6px;
      left: 50%;
      margin-left: -5px;
      cursor: ns-resize;
    }

    .hotspot-handle-e {
      right: -6px;
      top: 50%;
      margin-top: -5px;
      cursor: ew-resize;
    }

    .hotspot-handle-w {
      left: -6px;
      top: 50%;
      margin-top: -5px;
      cursor: ew-resize;
    }

    .hotspot-handle-ne {
      top: -6px;
      right: -6px;
      cursor: nesw-resize;
    }

    .hotspot-handle-nw {
      top: -6px;
      left: -6px;
      cursor: nwse-resize;
    }

    .hotspot-handle-se {
      bottom: -6px;
      right: -6px;
      cursor: nwse-resize;
    }

    .hotspot-handle-sw {
      bottom: -6px;
      left: -6px;
      cursor: nesw-resize;
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

  readonly handles: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  private drag: DragState | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.endDrag());
  }

  startMove(event: MouseEvent, region: HotspotRegion): void {
    this.beginDrag(event, region);
  }

  startResize(event: MouseEvent, region: HotspotRegion, handle: ResizeHandle): void {
    this.beginDrag(event, region, handle);
  }

  private beginDrag(event: MouseEvent, region: HotspotRegion, handle?: ResizeHandle): void {
    event.preventDefault();
    event.stopPropagation();
    const wrap = (event.currentTarget as HTMLElement).closest('.hotspot-image-wrap');
    if (!wrap) {
      return;
    }
    const rect = wrap.getBoundingClientRect();
    this.drag = {
      regionId: region.id,
      handle,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startRegion: region,
      rectWidth: rect.width,
      rectHeight: rect.height,
    };
    window.addEventListener('mousemove', this.onDragMove);
    window.addEventListener('mouseup', this.endDrag);
  }

  private readonly onDragMove = (event: MouseEvent): void => {
    const drag = this.drag;
    if (!drag) {
      return;
    }
    const dx = ((event.clientX - drag.startClientX) / drag.rectWidth) * 100;
    const dy = ((event.clientY - drag.startClientY) / drag.rectHeight) * 100;
    const updated = drag.handle
      ? resizeRegion(drag.startRegion, drag.handle, dx, dy)
      : moveRegion(drag.startRegion, dx, dy);
    this.questionChange.emit({
      ...this.question(),
      regions: this.question().regions.map((region) =>
        region.id === drag.regionId ? updated : region,
      ),
    });
  };

  private readonly endDrag = (): void => {
    this.drag = null;
    window.removeEventListener('mousemove', this.onDragMove);
    window.removeEventListener('mouseup', this.endDrag);
  };

  regionLabel(region: HotspotRegion, index: number): string {
    return (
      `Область ${index + 1}: ${Math.round(region.width)}% × ${Math.round(region.height)}%, ` +
      `слева ${Math.round(region.x)}%, сверху ${Math.round(region.y)}%. ` +
      `Стрелки — переместить, Shift + стрелки — изменить размер.`
    );
  }

  onRegionKeydown(event: KeyboardEvent, region: HotspotRegion): void {
    const step = 1;
    let updated: HotspotRegion | null = null;
    if (event.shiftKey) {
      switch (event.key) {
        case 'ArrowRight':
          updated = resizeRegion(region, 'e', step, 0);
          break;
        case 'ArrowLeft':
          updated = resizeRegion(region, 'e', -step, 0);
          break;
        case 'ArrowDown':
          updated = resizeRegion(region, 's', 0, step);
          break;
        case 'ArrowUp':
          updated = resizeRegion(region, 's', 0, -step);
          break;
      }
    } else {
      switch (event.key) {
        case 'ArrowRight':
          updated = moveRegion(region, step, 0);
          break;
        case 'ArrowLeft':
          updated = moveRegion(region, -step, 0);
          break;
        case 'ArrowDown':
          updated = moveRegion(region, 0, step);
          break;
        case 'ArrowUp':
          updated = moveRegion(region, 0, -step);
          break;
      }
    }
    if (!updated) {
      return;
    }
    event.preventDefault();
    const finalRegion = updated;
    const question = this.question();
    this.questionChange.emit({
      ...question,
      regions: question.regions.map((r) => (r.id === finalRegion.id ? finalRegion : r)),
    });
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

  addRegionAtCenter(): void {
    this.questionChange.emit({
      ...this.question(),
      regions: addRegion(this.question().regions, 50, 50),
    });
  }

  onImageClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).closest('.hotspot-region')) {
      return;
    }
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
