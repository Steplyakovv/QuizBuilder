import { Question, QuestionResponse } from './quiz.models';

export function isQuestionAnswered(
  question: Question,
  response: QuestionResponse | undefined,
): boolean {
  switch (question.type) {
    case 'text':
    case 'number':
    case 'date':
      return !!response?.text?.trim();
    case 'true-false':
      return response?.text === 'true' || response?.text === 'false';
    default:
      return !!response?.selectedOptionIds && response.selectedOptionIds.length > 0;
  }
}

export function formatResponse(question: Question, response: QuestionResponse | undefined): string {
  switch (question.type) {
    case 'text':
    case 'number':
    case 'date':
      return response?.text?.trim() || '—';
    case 'true-false':
      if (response?.text === 'true') return 'Да';
      if (response?.text === 'false') return 'Нет';
      return '—';
    default: {
      const selectedIds = response?.selectedOptionIds ?? [];
      const labels = question.options
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => option.label);
      return labels.length > 0 ? labels.join(', ') : '—';
    }
  }
}
