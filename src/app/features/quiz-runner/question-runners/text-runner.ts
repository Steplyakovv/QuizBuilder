import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-text-runner',
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline" class="text-runner-field">
      @if (question().multiline) {
        <textarea
          matInput
          [value]="text()"
          [attr.maxlength]="question().maxLength"
          (input)="textChange.emit($any($event.target).value)"
        ></textarea>
      } @else {
        <input
          matInput
          [value]="text()"
          [attr.maxlength]="question().maxLength"
          (input)="textChange.emit($any($event.target).value)"
        />
      }
    </mat-form-field>
  `,
})
export class TextRunner {
  readonly question = input.required<TextQuestion>();
  readonly text = input('');
  readonly textChange = output<string>();
}
