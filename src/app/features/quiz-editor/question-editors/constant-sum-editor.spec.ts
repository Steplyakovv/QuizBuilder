import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { ConstantSumQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { ConstantSumEditor } from './constant-sum-editor';

describe('ConstantSumEditor', () => {
  async function createComponent(question: ConstantSumQuestion) {
    await TestBed.configureTestingModule({
      imports: [ConstantSumEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ConstantSumEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when options change', async () => {
    const question = createQuestion('constant-sum') as ConstantSumQuestion;
    const fixture = await createComponent(question);
    let emitted: ConstantSumQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onOptionsChange([{ id: 'a', label: 'Цена' }]);

    expect(emitted?.options).toEqual([{ id: 'a', label: 'Цена' }]);
  });

  it('updates total on a valid positive value', async () => {
    const question = createQuestion('constant-sum') as ConstantSumQuestion;
    const fixture = await createComponent(question);
    let emitted: ConstantSumQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onTotalChange('10');

    expect(emitted?.total).toBe(10);
  });

  it('ignores a zero or negative total', async () => {
    const question = createQuestion('constant-sum') as ConstantSumQuestion;
    const fixture = await createComponent(question);
    let emitted: ConstantSumQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onTotalChange('-5');

    expect(emitted).toBeUndefined();
  });
});
