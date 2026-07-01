import { TestBed } from '@angular/core/testing';
import { Option } from '../../core/models/quiz.models';
import { OptionListEditor } from './option-list-editor';

describe('OptionListEditor', () => {
  async function createComponent(options: Option[], correctOptionIds: string[] = []) {
    await TestBed.configureTestingModule({ imports: [OptionListEditor] }).compileComponents();
    const fixture = TestBed.createComponent(OptionListEditor);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('correctOptionIds', correctOptionIds);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an options array with a new option appended', async () => {
    const fixture = await createComponent([]);
    let emitted: Option[] | undefined;
    fixture.componentInstance.optionsChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.addOption();

    expect(emitted).toHaveLength(1);
    expect(emitted?.[0].label).toBe('');
  });

  it('emits an options array without the removed option', async () => {
    const option: Option = { id: 'a', label: 'Да' };
    const fixture = await createComponent([option]);
    let emitted: Option[] | undefined;
    fixture.componentInstance.optionsChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.removeOption('a');

    expect(emitted).toEqual([]);
  });

  it('drops a removed option from the correct ids too', async () => {
    const option: Option = { id: 'a', label: 'Да' };
    const fixture = await createComponent([option], ['a']);
    let emittedCorrect: string[] | undefined;
    fixture.componentInstance.correctOptionIdsChange.subscribe((value) => (emittedCorrect = value));

    fixture.componentInstance.removeOption('a');

    expect(emittedCorrect).toEqual([]);
  });

  describe('single selection mode', () => {
    it('replaces the previous correct option when a new one is toggled', async () => {
      const fixture = await createComponent(
        [
          { id: 'a', label: 'Да' },
          { id: 'b', label: 'Нет' },
        ],
        ['a'],
      );
      fixture.componentRef.setInput('selectionMode', 'single');
      let emitted: string[] | undefined;
      fixture.componentInstance.correctOptionIdsChange.subscribe((value) => (emitted = value));

      fixture.componentInstance.toggleCorrect('b');

      expect(emitted).toEqual(['b']);
    });

    it('clears the correct option when the same one is toggled again', async () => {
      const fixture = await createComponent([{ id: 'a', label: 'Да' }], ['a']);
      fixture.componentRef.setInput('selectionMode', 'single');
      let emitted: string[] | undefined;
      fixture.componentInstance.correctOptionIdsChange.subscribe((value) => (emitted = value));

      fixture.componentInstance.toggleCorrect('a');

      expect(emitted).toEqual([]);
    });
  });

  describe('multiple selection mode', () => {
    it('adds to the correct ids without removing existing ones', async () => {
      const fixture = await createComponent(
        [
          { id: 'a', label: 'Да' },
          { id: 'b', label: 'Тоже да' },
        ],
        ['a'],
      );
      fixture.componentRef.setInput('selectionMode', 'multiple');
      let emitted: string[] | undefined;
      fixture.componentInstance.correctOptionIdsChange.subscribe((value) => (emitted = value));

      fixture.componentInstance.toggleCorrect('b');

      expect(emitted).toEqual(['a', 'b']);
    });
  });
});
