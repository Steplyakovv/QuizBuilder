import { Option, Question, QuestionResponse } from './quiz.models';

const CONDITION_SOURCE_TYPES = [
  'single-choice',
  'multiple-choice',
  'dropdown',
  'image-choice',
  'true-false',
] as const;

export type ConditionSourceType = (typeof CONDITION_SOURCE_TYPES)[number];

export function isConditionSource(question: Question): boolean {
  return (CONDITION_SOURCE_TYPES as readonly string[]).includes(question.type);
}

/** Value options a condition can target for the given source question. */
export function conditionOptions(question: Question): Option[] {
  if (question.type === 'true-false') {
    return [
      { id: 'true', label: 'Да' },
      { id: 'false', label: 'Нет' },
    ];
  }
  if ('options' in question) {
    return question.options;
  }
  return [];
}

export function isQuestionVisible(
  question: Question,
  allQuestions: Question[],
  responses: Record<string, QuestionResponse>,
): boolean {
  const condition = question.condition;
  if (!condition) {
    return true;
  }
  const source = allQuestions.find((candidate) => candidate.id === condition.questionId);
  if (!source) {
    return true;
  }
  const response = responses[condition.questionId];
  if (source.type === 'true-false') {
    return response?.text === condition.optionId;
  }
  return (response?.selectedOptionIds ?? []).includes(condition.optionId);
}
