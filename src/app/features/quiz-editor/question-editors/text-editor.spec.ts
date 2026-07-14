import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { TextQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { TextEditor } from './text-editor';

describe('TextEditor', () => {
  async function createComponent(question: TextQuestion) {
    await TestBed.configureTestingModule({
      imports: [TextEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(TextEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated multiline flag', async () => {
    const question = createQuestion('text') as TextQuestion;
    const fixture = await createComponent(question);
    let emitted: TextQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMultilineChange(true);

    expect(emitted?.multiline).toBe(true);
  });

  it('parses a valid max length', async () => {
    const question = createQuestion('text') as TextQuestion;
    const fixture = await createComponent(question);
    let emitted: TextQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMaxLengthChange('200');

    expect(emitted?.maxLength).toBe(200);
  });

  it('clears max length for blank or invalid input', async () => {
    const question = { ...createQuestion('text'), maxLength: 100 } as TextQuestion;
    const fixture = await createComponent(question);
    let emitted: TextQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMaxLengthChange('');

    expect(emitted?.maxLength).toBeUndefined();
  });
});
