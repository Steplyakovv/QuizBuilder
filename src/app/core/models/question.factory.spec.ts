import { createOption, createQuestion } from './question.factory';

describe('createQuestion', () => {
  it('creates a single-choice question with empty options', () => {
    const question = createQuestion('single-choice');
    expect(question).toMatchObject({ type: 'single-choice', prompt: '', required: true });
    expect(question.id).toBeTruthy();
    if (question.type === 'single-choice') {
      expect(question.options).toEqual([]);
    }
  });

  it('creates a text question with multiline disabled by default', () => {
    const question = createQuestion('text');
    expect(question).toMatchObject({ type: 'text', multiline: false });
  });

  it('creates an image-choice question with single-select by default', () => {
    const question = createQuestion('image-choice');
    expect(question).toMatchObject({ type: 'image-choice', multiple: false, options: [] });
  });

  it('creates a true-false question with no correct answer set', () => {
    const question = createQuestion('true-false');
    expect(question).toMatchObject({ type: 'true-false', prompt: '', required: true });
    if (question.type === 'true-false') {
      expect(question.correctAnswer).toBeUndefined();
    }
  });

  it('creates a dropdown question with empty options', () => {
    const question = createQuestion('dropdown');
    expect(question).toMatchObject({ type: 'dropdown', options: [] });
  });

  it('creates a number question with no range set', () => {
    const question = createQuestion('number');
    expect(question).toMatchObject({ type: 'number', prompt: '', required: true });
    if (question.type === 'number') {
      expect(question.min).toBeUndefined();
      expect(question.max).toBeUndefined();
    }
  });

  it('creates a date question', () => {
    const question = createQuestion('date');
    expect(question).toMatchObject({ type: 'date', prompt: '', required: true });
  });

  it('creates a rating question with a 1-5 scale by default', () => {
    const question = createQuestion('rating');
    expect(question).toMatchObject({ type: 'rating', min: 1, max: 5 });
  });

  it('creates a slider question with a 0-100 range and a step of 1', () => {
    const question = createQuestion('slider');
    expect(question).toMatchObject({ type: 'slider', min: 0, max: 100, step: 1 });
  });

  it('creates a constant-sum question with empty options and 100 points to distribute', () => {
    const question = createQuestion('constant-sum');
    expect(question).toMatchObject({ type: 'constant-sum', options: [], total: 100 });
  });

  it('generates a unique id for every question', () => {
    expect(createQuestion('text').id).not.toBe(createQuestion('text').id);
  });
});

describe('createOption', () => {
  it('creates an option with an empty label and a unique id', () => {
    const option = createOption();
    expect(option.label).toBe('');
    expect(option.id).toBeTruthy();
    expect(createOption().id).not.toBe(createOption().id);
  });
});
