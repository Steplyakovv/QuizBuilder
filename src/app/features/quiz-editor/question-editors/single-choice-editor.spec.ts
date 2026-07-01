import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { SingleChoiceQuestion } from '../../../core/models/quiz.models';
import { SingleChoiceEditor } from './single-choice-editor';

describe('SingleChoiceEditor', () => {
  async function createComponent(question: SingleChoiceQuestion) {
    await TestBed.configureTestingModule({ imports: [SingleChoiceEditor] }).compileComponents();
    const fixture = TestBed.createComponent(SingleChoiceEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when options change', async () => {
    const question = createQuestion('single-choice') as SingleChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: SingleChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onOptionsChange([{ id: 'a', label: 'Да' }]);

    expect(emitted?.options).toEqual([{ id: 'a', label: 'Да' }]);
  });

  it('sets correctOptionId from the emitted correct ids', async () => {
    const question = createQuestion('single-choice') as SingleChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: SingleChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectChange(['a']);

    expect(emitted?.correctOptionId).toBe('a');
  });

  it('clears correctOptionId when no id is emitted', async () => {
    const question = {
      ...createQuestion('single-choice'),
      correctOptionId: 'a',
    } as SingleChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: SingleChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectChange([]);

    expect(emitted?.correctOptionId).toBeUndefined();
  });
});
