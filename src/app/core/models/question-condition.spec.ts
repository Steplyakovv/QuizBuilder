import { conditionOptions, isConditionSource, isQuestionVisible } from './question-condition';
import { Question, SingleChoiceQuestion, TrueFalseQuestion } from './quiz.models';

function singleChoice(id: string): SingleChoiceQuestion {
  return {
    id,
    type: 'single-choice',
    prompt: 'p',
    required: true,
    options: [
      { id: 'yes', label: 'Да' },
      { id: 'no', label: 'Нет' },
    ],
  };
}

function trueFalse(id: string): TrueFalseQuestion {
  return { id, type: 'true-false', prompt: 'p', required: true };
}

describe('isConditionSource', () => {
  it('accepts option-based and true-false question types', () => {
    expect(isConditionSource(singleChoice('q1'))).toBe(true);
    expect(isConditionSource(trueFalse('q1'))).toBe(true);
  });

  it('rejects question types without a fixed set of answer values', () => {
    expect(
      isConditionSource({ id: 'q1', type: 'text', prompt: 'p', required: true, multiline: false }),
    ).toBe(false);
  });
});

describe('conditionOptions', () => {
  it('returns Да/Нет for true-false questions', () => {
    expect(conditionOptions(trueFalse('q1'))).toEqual([
      { id: 'true', label: 'Да' },
      { id: 'false', label: 'Нет' },
    ]);
  });

  it('returns the question options for option-based questions', () => {
    expect(conditionOptions(singleChoice('q1'))).toEqual([
      { id: 'yes', label: 'Да' },
      { id: 'no', label: 'Нет' },
    ]);
  });
});

describe('isQuestionVisible', () => {
  it('is always visible when there is no condition', () => {
    const question = singleChoice('q2');
    expect(isQuestionVisible(question, [question], {})).toBe(true);
  });

  it('is hidden until the source question answer matches (option-based source)', () => {
    const source = singleChoice('q1');
    const question: Question = {
      ...singleChoice('q2'),
      condition: { questionId: 'q1', optionId: 'yes' },
    };
    const all = [source, question];

    expect(isQuestionVisible(question, all, {})).toBe(false);
    expect(
      isQuestionVisible(question, all, { q1: { questionId: 'q1', selectedOptionIds: ['no'] } }),
    ).toBe(false);
    expect(
      isQuestionVisible(question, all, { q1: { questionId: 'q1', selectedOptionIds: ['yes'] } }),
    ).toBe(true);
  });

  it('matches true-false source answers against the response text', () => {
    const source = trueFalse('q1');
    const question: Question = {
      ...singleChoice('q2'),
      condition: { questionId: 'q1', optionId: 'true' },
    };
    const all = [source, question];

    expect(isQuestionVisible(question, all, { q1: { questionId: 'q1', text: 'false' } })).toBe(
      false,
    );
    expect(isQuestionVisible(question, all, { q1: { questionId: 'q1', text: 'true' } })).toBe(true);
  });

  it('is visible if the referenced source question no longer exists', () => {
    const question: Question = {
      ...singleChoice('q2'),
      condition: { questionId: 'missing', optionId: 'yes' },
    };
    expect(isQuestionVisible(question, [question], {})).toBe(true);
  });
});
