import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { SliderQuestion } from '../../../core/models/quiz.models';
import { SliderEditor } from './slider-editor';

describe('SliderEditor', () => {
  async function createComponent(question: SliderQuestion) {
    await TestBed.configureTestingModule({ imports: [SliderEditor] }).compileComponents();
    const fixture = TestBed.createComponent(SliderEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('updates min on a valid value', async () => {
    const question = createQuestion('slider') as SliderQuestion;
    const fixture = await createComponent(question);
    let emitted: SliderQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMinChange('10');

    expect(emitted?.min).toBe(10);
  });

  it('updates max on a valid value', async () => {
    const question = createQuestion('slider') as SliderQuestion;
    const fixture = await createComponent(question);
    let emitted: SliderQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMaxChange('200');

    expect(emitted?.max).toBe(200);
  });

  it('updates step on a valid positive value', async () => {
    const question = createQuestion('slider') as SliderQuestion;
    const fixture = await createComponent(question);
    let emitted: SliderQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onStepChange('5');

    expect(emitted?.step).toBe(5);
  });

  it('ignores a zero or negative step', async () => {
    const question = createQuestion('slider') as SliderQuestion;
    const fixture = await createComponent(question);
    let emitted: SliderQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onStepChange('0');

    expect(emitted).toBeUndefined();
  });
});
