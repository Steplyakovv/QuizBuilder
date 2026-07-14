import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { RatingQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { RatingEditor } from './rating-editor';

describe('RatingEditor', () => {
  async function createComponent(question: RatingQuestion) {
    await TestBed.configureTestingModule({
      imports: [RatingEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(RatingEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('updates min on a valid value', async () => {
    const question = createQuestion('rating') as RatingQuestion;
    const fixture = await createComponent(question);
    let emitted: RatingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMinChange('0');

    expect(emitted?.min).toBe(0);
  });

  it('updates max on a valid value', async () => {
    const question = createQuestion('rating') as RatingQuestion;
    const fixture = await createComponent(question);
    let emitted: RatingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMaxChange('10');

    expect(emitted?.max).toBe(10);
  });

  it('ignores non-numeric input', async () => {
    const question = createQuestion('rating') as RatingQuestion;
    const fixture = await createComponent(question);
    let emitted: RatingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onMinChange('abc');

    expect(emitted).toBeUndefined();
  });
});
