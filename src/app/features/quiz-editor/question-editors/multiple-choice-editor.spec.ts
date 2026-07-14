import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { MultipleChoiceQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { MultipleChoiceEditor } from './multiple-choice-editor';

describe('MultipleChoiceEditor', () => {
  async function createComponent(question: MultipleChoiceQuestion) {
    await TestBed.configureTestingModule({
      imports: [MultipleChoiceEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(MultipleChoiceEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when options change', async () => {
    const question = createQuestion('multiple-choice') as MultipleChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: MultipleChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onOptionsChange([{ id: 'a', label: 'Да' }]);

    expect(emitted?.options).toEqual([{ id: 'a', label: 'Да' }]);
  });

  it('sets correctOptionIds from the emitted correct ids', async () => {
    const question = createQuestion('multiple-choice') as MultipleChoiceQuestion;
    const fixture = await createComponent(question);
    let emitted: MultipleChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectChange(['a', 'b']);

    expect(emitted?.correctOptionIds).toEqual(['a', 'b']);
  });
});
