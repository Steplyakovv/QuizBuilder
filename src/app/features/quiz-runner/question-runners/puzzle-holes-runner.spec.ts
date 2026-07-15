import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { selectedHoleIndices } from '../../../core/models/puzzle-shape';
import { PuzzleHolePlacement, PuzzleHolesQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { PuzzleHolesRunner } from './puzzle-holes-runner';

describe('PuzzleHolesRunner', () => {
  const question: PuzzleHolesQuestion = {
    id: 'q1',
    type: 'puzzle-holes',
    prompt: 'Fill the gaps',
    required: true,
    imageUrl: 'data:image/png;base64,abc',
    pieceCount: 9,
    holeCount: 3,
  };
  const [holeA, holeB] = selectedHoleIndices(question.pieceCount, question.holeCount);

  async function createComponent(placements: PuzzleHolePlacement[] = []) {
    await TestBed.configureTestingModule({
      imports: [PuzzleHolesRunner],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const transloco = TestBed.inject(TranslocoService);
    await firstValueFrom(transloco.load(transloco.getActiveLang()));
    const fixture = TestBed.createComponent(PuzzleHolesRunner);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('placements', placements);
    await fixture.whenStable();
    return fixture;
  }

  it('exposes exactly holeCount hole indices, all within the grid', async () => {
    const fixture = await createComponent([]);

    const holes = fixture.componentInstance.holeIndices();

    expect(holes).toHaveLength(3);
    expect(new Set(holes).size).toBe(3);
    for (const hole of holes) {
      expect(hole).toBeGreaterThanOrEqual(0);
      expect(hole).toBeLessThan(9);
    }
  });

  it('places a tray piece into an empty hole', async () => {
    const fixture = await createComponent([]);
    let emitted: PuzzleHolePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(holeA);
    fixture.componentInstance.placeInCell(holeA);

    expect(emitted).toEqual([{ pieceIndex: holeA, cellIndex: holeA }]);
  });

  it('swaps two already-placed pieces between holes', async () => {
    const initial: PuzzleHolePlacement[] = [
      { pieceIndex: holeA, cellIndex: holeA },
      { pieceIndex: holeB, cellIndex: holeB },
    ];
    const fixture = await createComponent(initial);
    let emitted: PuzzleHolePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(holeA);
    fixture.componentInstance.onTileClick(holeB);

    expect(emitted).toEqual(
      expect.arrayContaining([
        { pieceIndex: holeA, cellIndex: holeB },
        { pieceIndex: holeB, cellIndex: holeA },
      ]),
    );
    expect(emitted).toHaveLength(2);
  });

  it('bumps the occupant back to the tray when a tray piece is dropped on an occupied hole', async () => {
    const initial: PuzzleHolePlacement[] = [{ pieceIndex: holeA, cellIndex: holeA }];
    const fixture = await createComponent(initial);
    let emitted: PuzzleHolePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(holeB);
    fixture.componentInstance.placeInCell(holeA);

    expect(emitted).toEqual([{ pieceIndex: holeB, cellIndex: holeA }]);
  });

  it('returns a placed piece to the tray', async () => {
    const initial: PuzzleHolePlacement[] = [{ pieceIndex: holeA, cellIndex: holeA }];
    const fixture = await createComponent(initial);
    let emitted: PuzzleHolePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(holeA);
    fixture.componentInstance.returnToTray();

    expect(emitted).toEqual([]);
  });
});
