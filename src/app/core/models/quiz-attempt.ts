import { countBlanks, splitTemplate } from './fill-in-the-blank';
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
    case 'word-choice':
      return (response?.selectedOptionIds?.length ?? 0) === question.words.length;
    case 'ranking':
      return (response?.selectedOptionIds?.length ?? 0) === question.options.length;
    case 'fill-in-the-blank': {
      const blanks = response?.blanks ?? [];
      const count = countBlanks(question.template);
      return (
        count > 0 && blanks.length === count && blanks.every((blank) => blank.trim().length > 0)
      );
    }
    case 'matching':
      return (
        question.pairs.length > 0 && question.pairs.every((pair) => !!response?.matches?.[pair.id])
      );
    case 'matrix':
      return (
        question.rows.length > 0 && question.rows.every((row) => !!response?.matches?.[row.id])
      );
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
    case 'word-choice': {
      const selectedIds = response?.selectedOptionIds ?? [];
      const labels = selectedIds.map(
        (id) => question.words.find((word) => word.id === id)?.label ?? '',
      );
      return labels.length > 0 ? labels.join(' ') : '—';
    }
    case 'ranking': {
      const selectedIds = response?.selectedOptionIds ?? [];
      const labels = selectedIds.map(
        (id) => question.options.find((option) => option.id === id)?.label ?? '',
      );
      return labels.length > 0 ? labels.join(' → ') : '—';
    }
    case 'fill-in-the-blank': {
      const blanks = response?.blanks;
      if (!blanks || blanks.some((blank) => !blank.trim())) return '—';
      const segments = splitTemplate(question.template);
      return segments.reduce(
        (result, segment, index) =>
          index === 0 ? segment : `${result}${blanks[index - 1]}${segment}`,
        '',
      );
    }
    case 'matching': {
      const matches = response?.matches ?? {};
      const parts = question.pairs
        .filter((pair) => matches[pair.id])
        .map((pair) => {
          const chosen = question.pairs.find((candidate) => candidate.id === matches[pair.id]);
          return `${pair.left} → ${chosen?.right ?? '—'}`;
        });
      return parts.length > 0 ? parts.join(', ') : '—';
    }
    case 'matrix': {
      const matches = response?.matches ?? {};
      const parts = question.rows
        .filter((row) => matches[row.id])
        .map((row) => {
          const chosen = question.columns.find((column) => column.id === matches[row.id]);
          return `${row.label}: ${chosen?.label ?? '—'}`;
        });
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
