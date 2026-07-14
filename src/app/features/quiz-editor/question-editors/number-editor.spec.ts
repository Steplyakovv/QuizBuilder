import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { NumberQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { NumberEditor } from './number-editor';

describe('NumberEditor', () => {
  async function createComponent(question: NumberQuestion) {
    await TestBed.configureTestingModule({
      imports: [NumberEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(NumberEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('parses a valid min value', async () => {
    const question = createQuestion('number') as NumberQuestion;
    const fixture = await createComponent(question);
    let emitted: NumberQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMinChange('5');

    expect(emitted?.min).toBe(5);
  });

  it('parses a valid max value', async () => {
    const question = createQuestion('number') as NumberQuestion;
    const fixture = await createComponent(question);
    let emitted: NumberQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMaxChange('100');

    expect(emitted?.max).toBe(100);
  });

  it('clears the range for blank input', async () => {
    const question = { ...createQuestion('number'), min: 1, max: 10 } as NumberQuestion;
    const fixture = await createComponent(question);
    let emitted: NumberQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMinChange('');

    expect(emitted?.min).toBeUndefined();
  });
});
