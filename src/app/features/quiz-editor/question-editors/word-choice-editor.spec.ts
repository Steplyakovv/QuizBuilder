import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { WordChoiceQuestion } from '../../../core/models/quiz.models';
import { WordChoiceEditor } from './word-choice-editor';

describe('WordChoiceEditor', () => {
  it('emits an updated question when words change', async () => {
    await TestBed.configureTestingModule({ imports: [WordChoiceEditor] }).compileComponents();
    const fixture = TestBed.createComponent(WordChoiceEditor);
    fixture.componentRef.setInput('question', createQuestion('word-choice') as WordChoiceQuestion);
    await fixture.whenStable();
    let emitted: WordChoiceQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onWordsChange([{ id: 'w1', label: 'Небо' }]);

    expect(emitted?.words).toEqual([{ id: 'w1', label: 'Небо' }]);
  });

  it('shows the correct phrase as the joined word order', async () => {
    await TestBed.configureTestingModule({ imports: [WordChoiceEditor] }).compileComponents();
    const fixture = TestBed.createComponent(WordChoiceEditor);
    fixture.componentRef.setInput('question', {
      ...createQuestion('word-choice'),
      words: [
        { id: 'w1', label: 'Небо' },
        { id: 'w2', label: 'голубое' },
      ],
    } as WordChoiceQuestion);
    await fixture.whenStable();

    expect(fixture.componentInstance.correctPhrase()).toBe('Небо голубое');
  });
});
