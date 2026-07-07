import { Question, QuestionResponse } from './quiz.models';

export function isQuestionAnswered(
  question: Question,
  response: QuestionResponse | undefined,
): boolean {
  switch (question.type) {
    case 'text':
    case 'number':
    case 'date':
    case 'rating':
    case 'slider':
      return !!response?.text?.trim();
    case 'true-false':
      return response?.text === 'true' || response?.text === 'false';
    case 'constant-sum': {
      const distribution = response?.distribution;
      if (!distribution) return false;
      const sum = Object.values(distribution).reduce((total, value) => total + value, 0);
      return sum === question.total;
    }
    default:
      return !!response?.selectedOptionIds && response.selectedOptionIds.length > 0;
  }
}

export function formatResponse(question: Question, response: QuestionResponse | undefined): string {
  switch (question.type) {
    case 'text':
    case 'number':
    case 'date':
    case 'rating':
    case 'slider':
      return response?.text?.trim() || '—';
    case 'true-false':
      if (response?.text === 'true') return 'Да';
      if (response?.text === 'false') return 'Нет';
      return '—';
    case 'constant-sum': {
      const distribution = response?.distribution ?? {};
      const parts = question.options
        .filter((option) => distribution[option.id] !== undefined)
        .map((option) => `${option.label}: ${distribution[option.id]}`);
      return parts.length > 0 ? parts.join(', ') : '—';
    }
    default: {
      const selectedIds = response?.selectedOptionIds ?? [];
      const labels = question.options
        .filter((option) => selectedIds.includes(option.id))
        .map((option) => option.label);
      return labels.length > 0 ? labels.join(', ') : '—';
    }
  }
}
