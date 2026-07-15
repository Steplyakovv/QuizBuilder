import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { ImageGridQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { ImageGridEditor } from './image-grid-editor';

describe('ImageGridEditor', () => {
  async function createComponent(question: ImageGridQuestion) {
    await TestBed.configureTestingModule({
      imports: [ImageGridEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ImageGridEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when options change', async () => {
    const question = createQuestion('image-grid') as ImageGridQuestion;
    const fixture = await createComponent(question);
    let emitted: ImageGridQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onOptionsChange([{ id: 'a', label: 'Кот' }]);

    expect(emitted?.options).toEqual([{ id: 'a', label: 'Кот' }]);
  });

  it('emits an updated question when correct options change', async () => {
    const question = createQuestion('image-grid') as ImageGridQuestion;
    const fixture = await createComponent(question);
    let emitted: ImageGridQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onCorrectChange(['a', 'b']);

    expect(emitted?.correctOptionIds).toEqual(['a', 'b']);
  });

  it('emits an updated column count, flooring and clamping to at least 1', async () => {
    const question = createQuestion('image-grid') as ImageGridQuestion;
    const fixture = await createComponent(question);
    let emitted: ImageGridQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onColumnsChange('4.7');
    expect(emitted?.columns).toBe(4);

    fixture.componentInstance.onColumnsChange('0');
    expect(emitted?.columns).toBe(1);

    fixture.componentInstance.onColumnsChange('not-a-number');
    expect(emitted?.columns).toBe(1);
  });
});
