import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { translateSignal } from '@jsverse/transloco';
import { FileUploadQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-file-upload-runner',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="file-upload-runner">
      <button mat-stroked-button type="button" (click)="fileInput.click()">
        <mat-icon>attach_file</mat-icon>
        {{ file() ? replaceFileLabel() : selectFileLabel() }}
      </button>
      <input
        #fileInput
        type="file"
        hidden
        (change)="onFileSelected($any($event.target).files); $any($event.target).value = ''"
      />
      @if (file(); as file) {
        <span class="file-upload-name">{{ file.name }}</span>
      }
    </div>
  `,
  styles: `
    .file-upload-runner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .file-upload-name {
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class FileUploadRunner {
  readonly question = input.required<FileUploadQuestion>();
  readonly file = input<{ name: string; dataUrl: string } | undefined>(undefined);
  readonly fileChange = output<{ name: string; dataUrl: string } | undefined>();

  protected readonly replaceFileLabel = translateSignal('fileUploadRunner.replaceFile');
  protected readonly selectFileLabel = translateSignal('fileUploadRunner.selectFile');

  onFileSelected(files: FileList | null): void {
    const file = files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      this.fileChange.emit({ name: file.name, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  }
}
