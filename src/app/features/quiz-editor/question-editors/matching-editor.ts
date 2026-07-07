import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  addPair,
  removePair,
  updatePairLeft,
  updatePairRight,
} from '../../../core/models/matching-pairs';
import { MatchingQuestion } from '../../../core/models/quiz.models';

@Component({
  selector: 'app-matching-editor',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './matching-editor.html',
  styles: `
    .matching-editor {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .matching-pair-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
    }

    .matching-pair-field {
      flex: 1;
    }
  `,
})
export class MatchingEditor {
  readonly question = input.required<MatchingQuestion>();
  readonly questionChange = output<MatchingQuestion>();

  addPair(): void {
    this.questionChange.emit({ ...this.question(), pairs: addPair(this.question().pairs) });
  }

  removePair(pairId: string): void {
    this.questionChange.emit({
      ...this.question(),
      pairs: removePair(this.question().pairs, pairId),
    });
  }

  updateLeft(pairId: string, left: string): void {
    this.questionChange.emit({
      ...this.question(),
      pairs: updatePairLeft(this.question().pairs, pairId, left),
    });
  }

  updateRight(pairId: string, right: string): void {
    this.questionChange.emit({
      ...this.question(),
      pairs: updatePairRight(this.question().pairs, pairId, right),
    });
  }
}
