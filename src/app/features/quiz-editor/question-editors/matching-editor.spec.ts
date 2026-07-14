import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { MatchingQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { MatchingEditor } from './matching-editor';

describe('MatchingEditor', () => {
  async function createComponent(question: MatchingQuestion) {
    await TestBed.configureTestingModule({
      imports: [MatchingEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(MatchingEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('appends an empty pair', async () => {
    const question = createQuestion('matching') as MatchingQuestion;
    const fixture = await createComponent(question);
    let emitted: MatchingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.addPair();

    expect(emitted?.pairs).toHaveLength(1);
    expect(emitted?.pairs[0]).toMatchObject({ left: '', right: '' });
  });

  it('removes a pair by id', async () => {
    const question = {
      ...createQuestion('matching'),
      pairs: [{ id: 'p1', left: 'Франция', right: 'Париж' }],
    } as MatchingQuestion;
    const fixture = await createComponent(question);
    let emitted: MatchingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.removePair('p1');

    expect(emitted?.pairs).toEqual([]);
  });

  it('updates the left label of a pair', async () => {
    const question = {
      ...createQuestion('matching'),
      pairs: [{ id: 'p1', left: '', right: '' }],
    } as MatchingQuestion;
    const fixture = await createComponent(question);
    let emitted: MatchingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.updateLeft('p1', 'Франция');

    expect(emitted?.pairs[0]).toEqual({ id: 'p1', left: 'Франция', right: '' });
  });

  it('updates the right label of a pair', async () => {
    const question = {
      ...createQuestion('matching'),
      pairs: [{ id: 'p1', left: '', right: '' }],
    } as MatchingQuestion;
    const fixture = await createComponent(question);
    let emitted: MatchingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.updateRight('p1', 'Париж');

    expect(emitted?.pairs[0]).toEqual({ id: 'p1', left: '', right: 'Париж' });
  });
});
