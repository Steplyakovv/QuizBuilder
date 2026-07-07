import { Question } from './quiz.models';
import { formatResponse, isQuestionAnswered } from './quiz-attempt';

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

function trueFalseQuestion(): Question {
  return { id: 'q1', type: 'true-false', prompt: 'Земля круглая?', required: true };
}

function numberQuestion(): Question {
  return { id: 'q1', type: 'number', prompt: 'Сколько вам лет?', required: true };
}

function ratingQuestion(): Question {
  return { id: 'q1', type: 'rating', prompt: 'Оцените сервис', required: true, min: 1, max: 5 };
}

function sliderQuestion(): Question {
  return {
    id: 'q1',
    type: 'slider',
    prompt: 'Насколько вероятно?',
    required: true,
    min: 0,
    max: 100,
    step: 1,
  };
}

function constantSumQuestion(): Question {
  return {
    id: 'q1',
    type: 'constant-sum',
    prompt: 'Распределите 100 баллов',
    required: true,
    options: [
      { id: 'o1', label: 'Цена' },
      { id: 'o2', label: 'Качество' },
    ],
    total: 100,
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

  it('treats a true-false question as unanswered when there is no response', () => {
    expect(isQuestionAnswered(trueFalseQuestion(), undefined)).toBe(false);
  });

  it('treats a true-false question as answered when a value is chosen', () => {
    expect(isQuestionAnswered(trueFalseQuestion(), { questionId: 'q1', text: 'false' })).toBe(true);
  });

  it('treats a number question as unanswered when blank', () => {
    expect(isQuestionAnswered(numberQuestion(), { questionId: 'q1', text: '' })).toBe(false);
  });

  it('treats a number question as answered when a value is entered', () => {
    expect(isQuestionAnswered(numberQuestion(), { questionId: 'q1', text: '42' })).toBe(true);
  });

  it('treats a rating question as unanswered when blank', () => {
    expect(isQuestionAnswered(ratingQuestion(), undefined)).toBe(false);
  });

  it('treats a rating question as answered when a value is chosen', () => {
    expect(isQuestionAnswered(ratingQuestion(), { questionId: 'q1', text: '4' })).toBe(true);
  });

  it('treats a slider question as unanswered when blank', () => {
    expect(isQuestionAnswered(sliderQuestion(), undefined)).toBe(false);
  });

  it('treats a slider question as answered when a value is set', () => {
    expect(isQuestionAnswered(sliderQuestion(), { questionId: 'q1', text: '50' })).toBe(true);
  });

  it('treats a constant-sum question as unanswered when there is no distribution', () => {
    expect(isQuestionAnswered(constantSumQuestion(), undefined)).toBe(false);
  });

  it('treats a constant-sum question as unanswered when the distribution does not add up to the total', () => {
    expect(
      isQuestionAnswered(constantSumQuestion(), {
        questionId: 'q1',
        distribution: { o1: 40, o2: 30 },
      }),
    ).toBe(false);
  });

  it('treats a constant-sum question as answered when the distribution adds up to the total', () => {
    expect(
      isQuestionAnswered(constantSumQuestion(), {
        questionId: 'q1',
        distribution: { o1: 40, o2: 60 },
      }),
    ).toBe(true);
  });
});

describe('formatResponse', () => {
  it('shows a dash for an unanswered text question', () => {
    expect(formatResponse(textQuestion(), undefined)).toBe('—');
  });

  it('shows the entered text', () => {
    expect(formatResponse(textQuestion(), { questionId: 'q1', text: 'Иван' })).toBe('Иван');
  });

  it('shows a dash for a choice question with no selection', () => {
    expect(
      formatResponse(singleChoiceQuestion(), { questionId: 'q1', selectedOptionIds: [] }),
    ).toBe('—');
  });

  it('shows the labels of the selected options', () => {
    expect(
      formatResponse(singleChoiceQuestion(), { questionId: 'q1', selectedOptionIds: ['o2'] }),
    ).toBe('Эспрессо');
  });

  it('joins multiple selected option labels', () => {
    expect(
      formatResponse(singleChoiceQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['o1', 'o2'],
      }),
    ).toBe('Латте, Эспрессо');
  });

  it('shows Да/Нет for a true-false response', () => {
    expect(formatResponse(trueFalseQuestion(), { questionId: 'q1', text: 'true' })).toBe('Да');
    expect(formatResponse(trueFalseQuestion(), { questionId: 'q1', text: 'false' })).toBe('Нет');
    expect(formatResponse(trueFalseQuestion(), undefined)).toBe('—');
  });

  it('shows the entered number as text', () => {
    expect(formatResponse(numberQuestion(), { questionId: 'q1', text: '42' })).toBe('42');
  });

  it('shows the chosen rating as text', () => {
    expect(formatResponse(ratingQuestion(), { questionId: 'q1', text: '4' })).toBe('4');
    expect(formatResponse(ratingQuestion(), undefined)).toBe('—');
  });

  it('shows the chosen slider value as text', () => {
    expect(formatResponse(sliderQuestion(), { questionId: 'q1', text: '50' })).toBe('50');
  });

  it('shows a dash for a constant-sum question with no distribution', () => {
    expect(formatResponse(constantSumQuestion(), undefined)).toBe('—');
  });

  it('shows the option labels with their assigned points for a constant-sum response', () => {
    expect(
      formatResponse(constantSumQuestion(), {
        questionId: 'q1',
        distribution: { o1: 40, o2: 60 },
      }),
    ).toBe('Цена: 40, Качество: 60');
  });
});
