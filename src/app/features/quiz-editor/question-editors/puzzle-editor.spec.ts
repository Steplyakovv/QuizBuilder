import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { PuzzleQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { PuzzleEditor } from './puzzle-editor';

describe('PuzzleEditor', () => {
  async function createComponent(question: PuzzleQuestion) {
    await TestBed.configureTestingModule({
      imports: [PuzzleEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(PuzzleEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when the image url changes', async () => {
    const question = createQuestion('puzzle') as PuzzleQuestion;
    const fixture = await createComponent(question);
    let emitted: PuzzleQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.updateImageUrl('data:image/png;base64,abc');

    expect(emitted?.imageUrl).toBe('data:image/png;base64,abc');
  });

  it('emits an updated piece count, flooring and clamping to at least 2', async () => {
    const question = createQuestion('puzzle') as PuzzleQuestion;
    const fixture = await createComponent(question);
    let emitted: PuzzleQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onPieceCountChange('16.9');
    expect(emitted?.pieceCount).toBe(16);

    fixture.componentInstance.onPieceCountChange('1');
    expect(emitted?.pieceCount).toBe(2);

    fixture.componentInstance.onPieceCountChange('not-a-number');
    expect(emitted?.pieceCount).toBe(2);
  });
});
