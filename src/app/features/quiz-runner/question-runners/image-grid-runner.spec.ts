import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { ImageGridQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { ImageGridRunner } from './image-grid-runner';

describe('ImageGridRunner', () => {
  async function createComponent(question: ImageGridQuestion, selectedOptionIds: string[] = []) {
    await TestBed.configureTestingModule({
      imports: [ImageGridRunner],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ImageGridRunner);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('selectedOptionIds', selectedOptionIds);
    await fixture.whenStable();
    return fixture;
  }

  function questionWithTiles(): ImageGridQuestion {
    return {
      ...(createQuestion('image-grid') as ImageGridQuestion),
      options: [
        { id: 'a', label: 'Светофор', imageUrl: 'a.png' },
        { id: 'b', label: 'Дерево', imageUrl: 'b.png' },
      ],
    };
  }

  it('adds a tile to the selection when toggled on', async () => {
    const fixture = await createComponent(questionWithTiles(), ['a']);
    let emitted: string[] | undefined;
    fixture.componentInstance.selectionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.toggle('b');

    expect(emitted).toEqual(['a', 'b']);
  });

  it('removes a tile from the selection when toggled off', async () => {
    const fixture = await createComponent(questionWithTiles(), ['a', 'b']);
    let emitted: string[] | undefined;
    fixture.componentInstance.selectionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.toggle('a');

    expect(emitted).toEqual(['b']);
  });

  it('reports selection status via isSelected', async () => {
    const fixture = await createComponent(questionWithTiles(), ['a']);

    expect(fixture.componentInstance.isSelected('a')).toBe(true);
    expect(fixture.componentInstance.isSelected('b')).toBe(false);
  });
});
