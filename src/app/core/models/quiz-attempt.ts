import { Question, QuestionResponse } from './quiz.models';

export function isQuestionAnswered(
  question: Question,
  response: QuestionResponse | undefined,
): boolean {
  if (question.type === 'text') {
    return !!response?.text?.trim();
  }
  return !!response?.selectedOptionIds && response.selectedOptionIds.length > 0;
}
