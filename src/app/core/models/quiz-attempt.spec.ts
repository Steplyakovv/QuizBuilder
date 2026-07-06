import { Question } from './quiz.models';
import { isQuestionAnswered } from './quiz-attempt';

function textQuestion(): Question {
  return { id: 'q1', type: 'text', prompt: 'Как вас зовут?', required: true, multiline: false };
}

function singleChoiceQuestion(): Question {
  return {
    id: 'q1',
    type: 'single-choice',
    prompt: 'Любимый напиток?',
    required: true,
    options: [
      { id: 'o1', label: 'Латте' },
      { id: 'o2', label: 'Эспрессо' },
    ],
  };
}

describe('isQuestionAnswered', () => {
  it('treats a text question as unanswered when there is no response', () => {
    expect(isQuestionAnswered(textQuestion(), undefined)).toBe(false);
  });

  it('treats a text question as unanswered when the text is blank', () => {
    expect(isQuestionAnswered(textQuestion(), { questionId: 'q1', text: '   ' })).toBe(false);
  });

  it('treats a text question as answered when the text is non-empty', () => {
    expect(isQuestionAnswered(textQuestion(), { questionId: 'q1', text: 'Иван' })).toBe(true);
  });

  it('treats a choice question as unanswered when no options are selected', () => {
    expect(
      isQuestionAnswered(singleChoiceQuestion(), { questionId: 'q1', selectedOptionIds: [] }),
    ).toBe(false);
  });

  it('treats a choice question as answered when an option is selected', () => {
    expect(
      isQuestionAnswered(singleChoiceQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['o1'],
      }),
    ).toBe(true);
  });
});
