import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { ImageChoiceQuestion } from '../../../core/models/quiz.models';
import { ImageChoiceEditor } from './image-choice-editor';

describe('ImageChoiceEditor', () => {
  async function createComponent(question: ImageChoiceQuestion) {
    await TestBed.configureTestingModule({ imports: [ImageChoiceEditor] }).compileComponents();
    const fixture = TestBed.createComponent(ImageChoiceEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when options change', async () => {
    const question = createQuestion('image-choice') as ImageChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: ImageChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onOptionsChange([{ id: 'a', label: 'Кот' }]);

    expect(emitted?.options).toEqual([{ id: 'a', label: 'Кот' }]);
  });

  it('trims correctOptionIds to one entry when switching off multiple', async () => {
    const question = {
      ...createQuestion('image-choice'),
      multiple: true,
      correctOptionIds: ['a', 'b'],
    } as ImageChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: ImageChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMultipleChange(false);

    expect(emitted?.multiple).toBe(false);
    expect(emitted?.correctOptionIds).toEqual(['a']);
  });

  it('keeps correctOptionIds untouched when switching on multiple', async () => {
    const question = {
      ...createQuestion('image-choice'),
      multiple: false,
      correctOptionIds: ['a'],
    } as ImageChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: ImageChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMultipleChange(true);

    expect(emitted?.correctOptionIds).toEqual(['a']);
  });
});
