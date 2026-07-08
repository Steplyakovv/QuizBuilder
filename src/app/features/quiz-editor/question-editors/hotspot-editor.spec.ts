import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { HotspotQuestion } from '../../../core/models/quiz.models';
import { HotspotEditor } from './hotspot-editor';

describe('HotspotEditor', () => {
  async function createComponent(question: HotspotQuestion, graded = false) {
    await TestBed.configureTestingModule({ imports: [HotspotEditor] }).compileComponents();
    const fixture = TestBed.createComponent(HotspotEditor);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('graded', graded);
    await fixture.whenStable();
    return fixture;
  }

  it('updates the image url', async () => {
    const question = createQuestion('hotspot') as HotspotQuestion;
    const fixture = await createComponent(question);
    let emitted: HotspotQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.updateImageUrl('https://example.com/a.png');

    expect(emitted?.imageUrl).toBe('https://example.com/a.png');
  });

  it('adds a region centered on the clicked point, clamped to the image bounds', async () => {
    const question = {
      ...createQuestion('hotspot'),
      imageUrl: 'https://example.com/a.png',
    } as HotspotQuestion;
    const fixture = await createComponent(question);
    let emitted: HotspotQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    const rect = { left: 0, top: 0, width: 200, height: 100 } as DOMRect;
    const target = { getBoundingClientRect: () => rect } as unknown as HTMLElement;
    fixture.componentInstance.onImageClick({
      clientX: 100,
      clientY: 50,
      currentTarget: target,
    } as unknown as MouseEvent);

    expect(emitted?.regions).toHaveLength(1);
    expect(emitted?.regions[0].x).toBe(40);
    expect(emitted?.regions[0].y).toBe(40);
  });

  it('removes a region and clears correctRegionId when it was the correct one', async () => {
    const question = {
      ...createQuestion('hotspot'),
      imageUrl: 'https://example.com/a.png',
      regions: [{ id: 'r1', x: 10, y: 10, width: 20, height: 20 }],
      correctRegionId: 'r1',
    } as HotspotQuestion;
    const fixture = await createComponent(question);
    let emitted: HotspotQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.removeRegion('r1');

    expect(emitted?.regions).toEqual([]);
    expect(emitted?.correctRegionId).toBeUndefined();
  });

  it('toggles the correct region on and off', async () => {
    const question = {
      ...createQuestion('hotspot'),
      regions: [{ id: 'r1', x: 10, y: 10, width: 20, height: 20 }],
    } as HotspotQuestion;
    const fixture = await createComponent(question, true);
    let emitted: HotspotQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.toggleCorrect('r1');
    expect(emitted?.correctRegionId).toBe('r1');

    fixture.componentRef.setInput('question', emitted);
    await fixture.whenStable();
    fixture.componentInstance.toggleCorrect('r1');
    expect(emitted?.correctRegionId).toBeUndefined();
  });
});
