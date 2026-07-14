import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { DropdownQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { DropdownEditor } from './dropdown-editor';

describe('DropdownEditor', () => {
  async function createComponent(question: DropdownQuestion) {
    await TestBed.configureTestingModule({
      imports: [DropdownEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(DropdownEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when options change', async () => {
    const question = createQuestion('dropdown') as DropdownQuestion;
    const fixture = await createComponent(question);
    let emitted: DropdownQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onOptionsChange([{ id: 'a', label: 'Да' }]);

    expect(emitted?.options).toEqual([{ id: 'a', label: 'Да' }]);
  });

  it('sets correctOptionId from the emitted correct ids', async () => {
    const question = createQuestion('dropdown') as DropdownQuestion;
    const fixture = await createComponent(question);
    let emitted: DropdownQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectChange(['a']);

    expect(emitted?.correctOptionId).toBe('a');
  });
});
