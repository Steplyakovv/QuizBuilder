import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { TrueFalseQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { TrueFalseEditor } from './true-false-editor';

describe('TrueFalseEditor', () => {
  async function createComponent(question: TrueFalseQuestion, graded = false) {
    await TestBed.configureTestingModule({
      imports: [TrueFalseEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(TrueFalseEditor);
    fixture.componentRef.setInput('question', question);
    fixture.componentRef.setInput('graded', graded);
    await fixture.whenStable();
    return fixture;
  }

  it('emits correctAnswer true when "true" is chosen', async () => {
    const question = createQuestion('true-false') as TrueFalseQuestion;
    const fixture = await createComponent(question, true);
    let emitted: TrueFalseQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectChange('true');

    expect(emitted?.correctAnswer).toBe(true);
  });

  it('emits correctAnswer false when "false" is chosen', async () => {
    const question = createQuestion('true-false') as TrueFalseQuestion;
    const fixture = await createComponent(question, true);
    let emitted: TrueFalseQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectChange('false');

    expect(emitted?.correctAnswer).toBe(false);
  });

  it('reports an undefined correctValue when no answer is set', async () => {
    const question = createQuestion('true-false') as TrueFalseQuestion;
    const fixture = await createComponent(question);

    expect(fixture.componentInstance.correctValue()).toBeUndefined();
  });
});
