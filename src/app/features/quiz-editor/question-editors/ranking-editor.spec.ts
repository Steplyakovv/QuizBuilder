import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { RankingQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { RankingEditor } from './ranking-editor';

describe('RankingEditor', () => {
  it('emits an updated question when options change', async () => {
    await TestBed.configureTestingModule({
      imports: [RankingEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(RankingEditor);
    fixture.componentRef.setInput('question', createQuestion('ranking') as RankingQuestion);
    await fixture.whenStable();
    let emitted: RankingQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onOptionsChange([{ id: 'o1', label: 'Маленький' }]);

    expect(emitted?.options).toEqual([{ id: 'o1', label: 'Маленький' }]);
  });

  it('shows the correct order as the joined option labels', async () => {
    await TestBed.configureTestingModule({
      imports: [RankingEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(RankingEditor);
    fixture.componentRef.setInput('question', {
      ...createQuestion('ranking'),
      options: [
        { id: 'o1', label: 'Маленький' },
        { id: 'o2', label: 'Большой' },
      ],
    } as RankingQuestion);
    await fixture.whenStable();

    expect(fixture.componentInstance.correctOrder()).toBe('Маленький → Большой');
  });
});
