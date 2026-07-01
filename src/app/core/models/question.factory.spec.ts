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
