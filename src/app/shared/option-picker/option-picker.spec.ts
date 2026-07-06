import { TestBed } from '@angular/core/testing';
import { Option } from '../../core/models/quiz.models';
import { OptionPicker } from './option-picker';

describe('OptionPicker', () => {
  async function createComponent(
    options: Option[],
    selectionMode: 'single' | 'multiple' = 'single',
    selected: string[] = [],
  ) {
    await TestBed.configureTestingModule({ imports: [OptionPicker] }).compileComponents();
    const fixture = TestBed.createComponent(OptionPicker);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('selectionMode', selectionMode);
    fixture.componentRef.setInput('selected', selected);
    await fixture.whenStable();
    return fixture;
  }

  it('emits the picked option id in single mode', async () => {
    const options: Option[] = [
      { id: 'a', label: 'Латте' },
      { id: 'b', label: 'Эспрессо' },
    ];
    const fixture = await createComponent(options, 'single');
    let emitted: string[] | undefined;
    fixture.componentInstance.selectedChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onSingleChange('b');

    expect(emitted).toEqual(['b']);
  });

  it('adds an option to the selection in multiple mode', async () => {
    const options: Option[] = [
      { id: 'a', label: 'Латте' },
      { id: 'b', label: 'Эспрессо' },
    ];
    const fixture = await createComponent(options, 'multiple', ['a']);
    let emitted: string[] | undefined;
    fixture.componentInstance.selectedChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMultipleChange('b', true);

    expect(emitted).toEqual(['a', 'b']);
  });

  it('removes an option from the selection in multiple mode', async () => {
    const options: Option[] = [
      { id: 'a', label: 'Латте' },
      { id: 'b', label: 'Эспрессо' },
    ];
    const fixture = await createComponent(options, 'multiple', ['a', 'b']);
    let emitted: string[] | undefined;
    fixture.componentInstance.selectedChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMultipleChange('a', false);

    expect(emitted).toEqual(['b']);
  });
});
