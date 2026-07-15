import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { PuzzleHolesQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { PuzzleHolesEditor } from './puzzle-holes-editor';

describe('PuzzleHolesEditor', () => {
  async function createComponent(question: PuzzleHolesQuestion) {
    await TestBed.configureTestingModule({
      imports: [PuzzleHolesEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(PuzzleHolesEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when the image url changes', async () => {
    const question = createQuestion('puzzle-holes') as PuzzleHolesQuestion;
    const fixture = await createComponent(question);
    let emitted: PuzzleHolesQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.updateImageUrl('data:image/png;base64,abc');

    expect(emitted?.imageUrl).toBe('data:image/png;base64,abc');
  });

  it('clamps hole count to piece count when piece count shrinks below it', async () => {
    const question: PuzzleHolesQuestion = {
      ...(createQuestion('puzzle-holes') as PuzzleHolesQuestion),
      pieceCount: 9,
      holeCount: 5,
    };
    const fixture = await createComponent(question);
    let emitted: PuzzleHolesQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onPieceCountChange('4');

    expect(emitted?.pieceCount).toBe(4);
    expect(emitted?.holeCount).toBe(4);
  });

  it('emits an updated hole count, flooring and clamping to [1, pieceCount]', async () => {
    const question: PuzzleHolesQuestion = {
      ...(createQuestion('puzzle-holes') as PuzzleHolesQuestion),
      pieceCount: 9,
      holeCount: 2,
    };
    const fixture = await createComponent(question);
    let emitted: PuzzleHolesQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onHoleCountChange('3.9');
    expect(emitted?.holeCount).toBe(3);

    fixture.componentInstance.onHoleCountChange('0');
    expect(emitted?.holeCount).toBe(1);

    fixture.componentInstance.onHoleCountChange('99');
    expect(emitted?.holeCount).toBe(9);

    fixture.componentInstance.onHoleCountChange('not-a-number');
    expect(emitted?.holeCount).toBe(1);
  });

  it('marks exactly holeCount cells as holes, deterministically', async () => {
    const question: PuzzleHolesQuestion = {
      ...(createQuestion('puzzle-holes') as PuzzleHolesQuestion),
      pieceCount: 9,
      holeCount: 3,
    };
    const fixture = await createComponent(question);

    const holeCells = Array.from({ length: 9 }, (_, i) => i).filter((i) =>
      fixture.componentInstance.isHole(i),
    );

    expect(holeCells).toHaveLength(3);
  });
});
