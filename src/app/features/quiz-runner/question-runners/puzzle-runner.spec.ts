import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { PuzzlePlacement, PuzzleQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { PuzzleRunner } from './puzzle-runner';

describe('PuzzleRunner', () => {
  const question: PuzzleQuestion = {
    id: 'q1',
    type: 'puzzle',
    prompt: 'Assemble it',
    required: true,
    imageUrl: 'data:image/png;base64,abc',
    pieceCount: 4,
  };

  async function createComponent(placements: PuzzlePlacement[] = []) {
    await TestBed.configureTestingModule({
      imports: [PuzzleRunner],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const transloco = TestBed.inject(TranslocoService);
    await firstValueFrom(transloco.load(transloco.getActiveLang()));
    const fixture = TestBed.createComponent(PuzzleRunner);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('placements', placements);
    await fixture.whenStable();
    return fixture;
  }

  const noopEvent = { stopPropagation: vi.fn() } as unknown as Event;

  it('places a tray piece into an empty cell', async () => {
    const fixture = await createComponent([]);
    let emitted: PuzzlePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(0);
    fixture.componentInstance.placeInCell(2);

    expect(emitted).toEqual([{ pieceIndex: 0, cellIndex: 2, rotationDegrees: 90 }]);
  });

  it('swaps two already-placed pieces', async () => {
    const initial: PuzzlePlacement[] = [
      { pieceIndex: 0, cellIndex: 0, rotationDegrees: 0 },
      { pieceIndex: 1, cellIndex: 1, rotationDegrees: 0 },
    ];
    const fixture = await createComponent(initial);
    let emitted: PuzzlePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(0);
    fixture.componentInstance.onTileClick(1);

    expect(emitted).toEqual(
      expect.arrayContaining([
        { pieceIndex: 0, cellIndex: 1, rotationDegrees: 0 },
        { pieceIndex: 1, cellIndex: 0, rotationDegrees: 0 },
      ]),
    );
    expect(emitted).toHaveLength(2);
  });

  it('bumps the occupant back to the tray when a tray piece is dropped on an occupied cell', async () => {
    const initial: PuzzlePlacement[] = [{ pieceIndex: 0, cellIndex: 0, rotationDegrees: 0 }];
    const fixture = await createComponent(initial);
    let emitted: PuzzlePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(1);
    fixture.componentInstance.placeInCell(0);

    expect(emitted).toEqual([{ pieceIndex: 1, cellIndex: 0, rotationDegrees: 180 }]);
  });

  it('returns a placed piece to the tray', async () => {
    const initial: PuzzlePlacement[] = [{ pieceIndex: 0, cellIndex: 0, rotationDegrees: 0 }];
    const fixture = await createComponent(initial);
    let emitted: PuzzlePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.onTileClick(0);
    fixture.componentInstance.returnToTray();

    expect(emitted).toEqual([]);
  });

  it('rotates a placed piece by 90 degrees and emits the update', async () => {
    const initial: PuzzlePlacement[] = [{ pieceIndex: 0, cellIndex: 0, rotationDegrees: 0 }];
    const fixture = await createComponent(initial);
    let emitted: PuzzlePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    fixture.componentInstance.rotate(0, noopEvent);

    expect(emitted).toEqual([{ pieceIndex: 0, cellIndex: 0, rotationDegrees: 90 }]);
  });

  it('rotates a tray piece locally without emitting a placements change', async () => {
    const fixture = await createComponent([]);
    let emitted: PuzzlePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    expect(fixture.componentInstance.rotationOf(0)).toBe(90);
    fixture.componentInstance.rotate(0, noopEvent);

    expect(fixture.componentInstance.rotationOf(0)).toBe(180);
    expect(emitted).toBeUndefined();
  });

  it('toggles the reference image label without touching placements', async () => {
    const fixture = await createComponent([]);
    let emitted: PuzzlePlacement[] | undefined;
    fixture.componentInstance.placementsChange.subscribe((v) => (emitted = v));

    expect(fixture.componentInstance.referenceLabel()).toBe('Показать картинку');

    fixture.componentInstance.toggleReference();
    expect(fixture.componentInstance.referenceLabel()).toBe('Скрыть картинку');

    fixture.componentInstance.toggleReference();
    expect(fixture.componentInstance.referenceLabel()).toBe('Показать картинку');
    expect(emitted).toBeUndefined();
  });
});
