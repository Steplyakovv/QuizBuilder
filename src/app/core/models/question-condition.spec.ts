import { isQuestionVisible } from './question-condition';
import { Question, SingleChoiceQuestion, TextQuestion } from './quiz.models';

function singleChoice(id: string, required = true): SingleChoiceQuestion {
  return {
    id,
    type: 'single-choice',
    prompt: 'p',
    required,
    options: [
      { id: 'yes', label: 'Да' },
      { id: 'no', label: 'Нет' },
    ],
  };
}

function text(id: string): TextQuestion {
  return { id, type: 'text', prompt: 'p', required: false, multiline: false };
}

describe('isQuestionVisible', () => {
  it('is always visible when there is no condition', () => {
    const question = singleChoice('q2');
    expect(isQuestionVisible(question, [question], {})).toBe(true);
  });

  it('is hidden until the source question has any answer', () => {
    const source = singleChoice('q1', false);
    const question: Question = { ...text('q2'), condition: { questionId: 'q1' } };
    const all = [source, question];

    expect(isQuestionVisible(question, all, {})).toBe(false);
    expect(
      isQuestionVisible(question, all, { q1: { questionId: 'q1', selectedOptionIds: ['no'] } }),
    ).toBe(true);
    expect(
      isQuestionVisible(question, all, { q1: { questionId: 'q1', selectedOptionIds: ['yes'] } }),
    ).toBe(true);
  });

  it('is visible if the referenced source question no longer exists', () => {
    const question: Question = { ...text('q2'), condition: { questionId: 'missing' } };
    expect(isQuestionVisible(question, [question], {})).toBe(true);
  });
});
