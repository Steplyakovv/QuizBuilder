import { TestBed } from '@angular/core/testing';
import { createQuestion } from '../../../core/models/question.factory';
import { MatrixQuestion } from '../../../core/models/quiz.models';
import { provideTestTransloco } from '../../../core/testing/provide-test-transloco';
import { MatrixEditor } from './matrix-editor';

describe('MatrixEditor', () => {
  async function createComponent(question: MatrixQuestion) {
    await TestBed.configureTestingModule({
      imports: [MatrixEditor],
      providers: [provideTestTransloco()],
    }).compileComponents();
    const fixture = TestBed.createComponent(MatrixEditor);
    fixture.componentRef.setInput('question', question);
    await fixture.whenStable();
    return fixture;
  }

  it('emits an updated question when rows change', async () => {
    const fixture = await createComponent(createQuestion('matrix') as MatrixQuestion);
    let emitted: MatrixQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onRowsChange([{ id: 'r1', label: 'Утверждение' }]);

    expect(emitted?.rows).toEqual([{ id: 'r1', label: 'Утверждение' }]);
  });

  it('emits an updated question when columns change', async () => {
    const fixture = await createComponent(createQuestion('matrix') as MatrixQuestion);
    let emitted: MatrixQuestion | undefined;
    fixture.componentInstance.questionChange.subscribe((value) => (emitted = value));

    fixture.componentInstance.onColumnsChange([{ id: 'c1', label: 'Да' }]);

    expect(emitted?.columns).toEqual([{ id: 'c1', label: 'Да' }]);
  });
});
