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

export function formatResponse(question: Question, response: QuestionResponse | undefined): string {
  if (question.type === 'text') {
    return response?.text?.trim() || '—';
  }
  const selectedIds = response?.selectedOptionIds ?? [];
  const labels = question.options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.label);
  return labels.length > 0 ? labels.join(', ') : '—';
}
