import { isQuizTitleValid } from './quiz.validation';

describe('isQuizTitleValid', () => {
  it('accepts a non-empty title', () => {
    expect(isQuizTitleValid('Опрос про кофе')).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(isQuizTitleValid('')).toBe(false);
  });

  it('rejects a whitespace-only title', () => {
    expect(isQuizTitleValid('   ')).toBe(false);
  });
});
