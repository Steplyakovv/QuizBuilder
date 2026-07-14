import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { FillInTheBlankQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { FillInTheBlankEditor } from './fill-in-the-blank-editor';

describe('FillInTheBlankEditor', () => {
  async function createComponent(question: FillInTheBlankQuestion) {
    await TestBed.configureTestingModule({
      imports: [FillInTheBlankEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(FillInTheBlankEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when the template changes', async () => {
    const question = createQuestion('fill-in-the-blank') as FillInTheBlankQuestion;
    const fixture = await createComponent(question);
    let emitted: FillInTheBlankQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onTemplateChange('Суп едят с {{}}.');

    expect(emitted?.template).toBe('Суп едят с {{}}.');
  });

  it('counts blanks in the template', async () => {
    const question = {
      ...createQuestion('fill-in-the-blank'),
      template: 'Суп едят с {{}}, а кашу с {{}}.',
    } as FillInTheBlankQuestion;
    const fixture = await createComponent(question);

    expect(fixture.componentInstance.blankCount()).toBe(2);
    expect(fixture.componentInstance.blankIndexes()).toEqual([0, 1]);
  });

  it('updates a single correct answer without touching the others', async () => {
    const question = {
      ...createQuestion('fill-in-the-blank'),
      template: 'Суп едят с {{}}, а кашу с {{}}.',
      correctAnswers: ['хлебом', 'молоком'],
    } as FillInTheBlankQuestion;
    const fixture = await createComponent(question);
    let emitted: FillInTheBlankQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectAnswerChange(1, 'сметаной');

    expect(emitted?.correctAnswers).toEqual(['хлебом', 'сметаной']);
  });
});
