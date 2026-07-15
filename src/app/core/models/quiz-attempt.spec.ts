import { Question } from './quiz.models';
import { testTranslate } from '../testing/test-translate';
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

function wordChoiceQuestion(): Question {
  return {
    id: 'q1',
    type: 'word-choice',
    prompt: 'Составьте фразу',
    required: true,
    words: [
      { id: 'w1', label: 'Небо' },
      { id: 'w2', label: 'голубое' },
    ],
  };
}

function fillInTheBlankQuestion(): Question {
  return {
    id: 'q1',
    type: 'fill-in-the-blank',
    prompt: 'Заполните пропуски',
    required: true,
    template: 'Суп едят с {{}}, а кашу с {{}}.',
    correctAnswers: ['хлебом', 'молоком'],
  };
}

function rankingQuestion(): Question {
  return {
    id: 'q1',
    type: 'ranking',
    prompt: 'Отсортируйте по размеру',
    required: true,
    options: [
      { id: 'o1', label: 'Маленький' },
      { id: 'o2', label: 'Большой' },
    ],
  };
}

function matchingQuestion(): Question {
  return {
    id: 'q1',
    type: 'matching',
    prompt: 'Сопоставьте столицы',
    required: true,
    pairs: [
      { id: 'p1', left: 'Франция', right: 'Париж' },
      { id: 'p2', left: 'Италия', right: 'Рим' },
    ],
  };
}

function matrixQuestion(): Question {
  return {
    id: 'q1',
    type: 'matrix',
    prompt: 'Оцените утверждения',
    required: true,
    rows: [{ id: 'r1', label: 'Мне нравится этот опрос' }],
    columns: [
      { id: 'c1', label: 'Да' },
      { id: 'c2', label: 'Нет' },
    ],
  };
}

function hotspotQuestion(): Question {
  return {
    id: 'q1',
    type: 'hotspot',
    prompt: 'Кликните по столице',
    required: true,
    imageUrl: 'https://example.com/map.png',
    regions: [
      { id: 'r1', x: 10, y: 10, width: 20, height: 20 },
      { id: 'r2', x: 50, y: 50, width: 20, height: 20 },
    ],
    correctRegionId: 'r2',
  };
}

function puzzleQuestion(): Question {
  return {
    id: 'q1',
    type: 'puzzle',
    prompt: 'Соберите картинку',
    required: true,
    imageUrl: 'https://example.com/pic.png',
    pieceCount: 4,
  };
}

function fileUploadQuestion(): Question {
  return { id: 'q1', type: 'file-upload', prompt: 'Прикрепите файл', required: true };
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

  it('treats a word-choice question as unanswered until every word is placed', () => {
    expect(
      isQuestionAnswered(wordChoiceQuestion(), { questionId: 'q1', selectedOptionIds: ['w1'] }),
    ).toBe(false);
    expect(
      isQuestionAnswered(wordChoiceQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['w2', 'w1'],
      }),
    ).toBe(true);
  });

  it('treats a ranking question as answered once every option has a position', () => {
    expect(isQuestionAnswered(rankingQuestion(), undefined)).toBe(false);
    expect(
      isQuestionAnswered(rankingQuestion(), { questionId: 'q1', selectedOptionIds: ['o2', 'o1'] }),
    ).toBe(true);
  });

  it('treats a fill-in-the-blank question as unanswered until every blank is filled', () => {
    expect(isQuestionAnswered(fillInTheBlankQuestion(), undefined)).toBe(false);
    expect(
      isQuestionAnswered(fillInTheBlankQuestion(), { questionId: 'q1', blanks: ['хлебом', ''] }),
    ).toBe(false);
    expect(
      isQuestionAnswered(fillInTheBlankQuestion(), {
        questionId: 'q1',
        blanks: ['хлебом', 'молоком'],
      }),
    ).toBe(true);
  });

  it('treats a matching question as answered once every pair has a match', () => {
    expect(isQuestionAnswered(matchingQuestion(), undefined)).toBe(false);
    expect(
      isQuestionAnswered(matchingQuestion(), { questionId: 'q1', matches: { p1: 'p2' } }),
    ).toBe(false);
    expect(
      isQuestionAnswered(matchingQuestion(), {
        questionId: 'q1',
        matches: { p1: 'p2', p2: 'p1' },
      }),
    ).toBe(true);
  });

  it('treats a matrix question as answered once every row has a selection', () => {
    expect(isQuestionAnswered(matrixQuestion(), undefined)).toBe(false);
    expect(isQuestionAnswered(matrixQuestion(), { questionId: 'q1', matches: { r1: 'c1' } })).toBe(
      true,
    );
  });

  it('treats a hotspot question as answered once a region is selected', () => {
    expect(isQuestionAnswered(hotspotQuestion(), undefined)).toBe(false);
    expect(
      isQuestionAnswered(hotspotQuestion(), { questionId: 'q1', selectedOptionIds: ['r1'] }),
    ).toBe(true);
  });

  it('treats a puzzle question as answered only once every piece has been placed', () => {
    expect(isQuestionAnswered(puzzleQuestion(), undefined)).toBe(false);
    expect(
      isQuestionAnswered(puzzleQuestion(), {
        questionId: 'q1',
        puzzlePlacements: [{ pieceIndex: 0, cellIndex: 0, rotationDegrees: 0 }],
      }),
    ).toBe(false);
    expect(
      isQuestionAnswered(puzzleQuestion(), {
        questionId: 'q1',
        puzzlePlacements: [
          { pieceIndex: 0, cellIndex: 0, rotationDegrees: 0 },
          { pieceIndex: 1, cellIndex: 1, rotationDegrees: 90 },
          { pieceIndex: 2, cellIndex: 2, rotationDegrees: 0 },
          { pieceIndex: 3, cellIndex: 3, rotationDegrees: 0 },
        ],
      }),
    ).toBe(true);
  });

  it('treats a file-upload question as answered once a file is attached', () => {
    expect(isQuestionAnswered(fileUploadQuestion(), undefined)).toBe(false);
    expect(
      isQuestionAnswered(fileUploadQuestion(), {
        questionId: 'q1',
        file: { name: 'a.png', dataUrl: 'data:image/png;base64,' },
      }),
    ).toBe(true);
  });
});

describe('formatResponse', () => {
  it('shows a dash for an unanswered text question', () => {
    expect(formatResponse(testTranslate, textQuestion(), undefined)).toBe('—');
  });

  it('shows the entered text', () => {
    expect(formatResponse(testTranslate, textQuestion(), { questionId: 'q1', text: 'Иван' })).toBe(
      'Иван',
    );
  });

  it('shows a dash for a choice question with no selection', () => {
    expect(
      formatResponse(testTranslate, singleChoiceQuestion(), {
        questionId: 'q1',
        selectedOptionIds: [],
      }),
    ).toBe('—');
  });

  it('shows the labels of the selected options', () => {
    expect(
      formatResponse(testTranslate, singleChoiceQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['o2'],
      }),
    ).toBe('Эспрессо');
  });

  it('joins multiple selected option labels', () => {
    expect(
      formatResponse(testTranslate, singleChoiceQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['o1', 'o2'],
      }),
    ).toBe('Латте, Эспрессо');
  });

  it('shows Да/Нет for a true-false response', () => {
    expect(
      formatResponse(testTranslate, trueFalseQuestion(), { questionId: 'q1', text: 'true' }),
    ).toBe('Да');
    expect(
      formatResponse(testTranslate, trueFalseQuestion(), { questionId: 'q1', text: 'false' }),
    ).toBe('Нет');
    expect(formatResponse(testTranslate, trueFalseQuestion(), undefined)).toBe('—');
  });

  it('shows the entered number as text', () => {
    expect(formatResponse(testTranslate, numberQuestion(), { questionId: 'q1', text: '42' })).toBe(
      '42',
    );
  });

  it('shows the chosen rating as text', () => {
    expect(formatResponse(testTranslate, ratingQuestion(), { questionId: 'q1', text: '4' })).toBe(
      '4',
    );
    expect(formatResponse(testTranslate, ratingQuestion(), undefined)).toBe('—');
  });

  it('shows the chosen slider value as text', () => {
    expect(formatResponse(testTranslate, sliderQuestion(), { questionId: 'q1', text: '50' })).toBe(
      '50',
    );
  });

  it('shows a dash for a constant-sum question with no distribution', () => {
    expect(formatResponse(testTranslate, constantSumQuestion(), undefined)).toBe('—');
  });

  it('shows the option labels with their assigned points for a constant-sum response', () => {
    expect(
      formatResponse(testTranslate, constantSumQuestion(), {
        questionId: 'q1',
        distribution: { o1: 40, o2: 60 },
      }),
    ).toBe('Цена: 40, Качество: 60');
  });

  it('joins the chosen words for a word-choice response in the chosen order', () => {
    expect(
      formatResponse(testTranslate, wordChoiceQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['w2', 'w1'],
      }),
    ).toBe('голубое Небо');
    expect(formatResponse(testTranslate, wordChoiceQuestion(), undefined)).toBe('—');
  });

  it('joins the ranked option labels in the chosen order', () => {
    expect(
      formatResponse(testTranslate, rankingQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['o2', 'o1'],
      }),
    ).toBe('Большой → Маленький');
  });

  it('fills the template with the entered blanks', () => {
    expect(
      formatResponse(testTranslate, fillInTheBlankQuestion(), {
        questionId: 'q1',
        blanks: ['хлебом', 'молоком'],
      }),
    ).toBe('Суп едят с хлебом, а кашу с молоком.');
  });

  it('shows a dash for a fill-in-the-blank response with an empty blank', () => {
    expect(
      formatResponse(testTranslate, fillInTheBlankQuestion(), {
        questionId: 'q1',
        blanks: ['хлебом', ''],
      }),
    ).toBe('—');
  });

  it('shows the matched right-hand labels for a matching response', () => {
    expect(
      formatResponse(testTranslate, matchingQuestion(), {
        questionId: 'q1',
        matches: { p1: 'p2', p2: 'p1' },
      }),
    ).toBe('Франция → Рим, Италия → Париж');
  });

  it('shows the selected column labels for a matrix response', () => {
    expect(
      formatResponse(testTranslate, matrixQuestion(), { questionId: 'q1', matches: { r1: 'c1' } }),
    ).toBe('Мне нравится этот опрос: Да');
  });

  it('shows the selected region number for a hotspot response', () => {
    expect(formatResponse(testTranslate, hotspotQuestion(), undefined)).toBe('—');
    expect(
      formatResponse(testTranslate, hotspotQuestion(), {
        questionId: 'q1',
        selectedOptionIds: ['r2'],
      }),
    ).toBe('Область №2');
  });

  it('shows how many puzzle pieces are correctly placed', () => {
    expect(formatResponse(testTranslate, puzzleQuestion(), undefined)).toBe('—');
    expect(
      formatResponse(testTranslate, puzzleQuestion(), { questionId: 'q1', puzzlePlacements: [] }),
    ).toBe('—');
    expect(
      formatResponse(testTranslate, puzzleQuestion(), {
        questionId: 'q1',
        puzzlePlacements: [
          { pieceIndex: 0, cellIndex: 0, rotationDegrees: 0 },
          { pieceIndex: 1, cellIndex: 1, rotationDegrees: 90 },
        ],
      }),
    ).toBe('1 из 4 кусочков на своих местах');
  });

  it('shows the attached file name for a file-upload response', () => {
    expect(formatResponse(testTranslate, fileUploadQuestion(), undefined)).toBe('—');
    expect(
      formatResponse(testTranslate, fileUploadQuestion(), {
        questionId: 'q1',
        file: { name: 'photo.jpg', dataUrl: 'data:image/jpeg;base64,' },
      }),
    ).toBe('photo.jpg');
  });
});
