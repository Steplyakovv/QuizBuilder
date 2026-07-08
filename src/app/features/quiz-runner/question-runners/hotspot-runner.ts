import { Component, input, output } from '@angular/core';
import { HotspotQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-hotspot-runner',
  template: `
    <div class="hotspot-runner-image-wrap">
      <img [src]="question().imageUrl" alt="" class="hotspot-runner-image" />
      @for (region of question().regions; track region.id) {
        <button
          type="button"
          class="hotspot-runner-region"
          [class.hotspot-runner-region--selected]="isSelected(region.id)"
          [style.left.%]="region.x"
          [style.top.%]="region.y"
          [style.width.%]="region.width"
          [style.height.%]="region.height"
          [attr.aria-pressed]="isSelected(region.id)"
          aria-label="Область на изображении"
          (click)="select(region.id)"
        ></button>
      }
    </div>
  `,
  styles: `
    .hotspot-runner-image-wrap {
      position: relative;
      display: inline-block;
      max-width: 100%;
    }

    .hotspot-runner-image {
      display: block;
      max-width: 100%;
      max-height: 400px;
    }

    .hotspot-runner-region {
      position: absolute;
      box-sizing: border-box;
      border: 2px solid transparent;
      background: transparent;
      border-radius: 4px;
      padding: 0;
      cursor: pointer;
    }

    .hotspot-runner-region:hover {
      border-color: var(--mat-sys-outline);
      background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
    }

    .hotspot-runner-region--selected {
      border-color: var(--mat-sys-primary);
      background: color-mix(in srgb, var(--mat-sys-primary) 25%, transparent);
    }
  `,
})
export class HotspotRunner {
  readonly question = input.required<HotspotQuestion>();
  readonly selectedOptionIds = input<string[]>([]);
  readonly selectionChange = output<string[]>();

  isSelected(regionId: string): boolean {
    return this.selectedOptionIds()[0] === regionId;
  }

  select(regionId: string): void {
    this.selectionChange.emit([regionId]);
  }
}
