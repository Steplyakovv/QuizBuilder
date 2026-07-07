import { createId } from '../utils/id';
import { Option, Question } from './quiz.models';

export type QuestionType = Question['type'];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'single-choice': 'Одиночный выбор',
  'multiple-choice': 'Множественный выбор',
  text: 'Текстовый ответ',
  'image-choice': 'Выбор картинки',
  'true-false': 'Да/Нет',
  dropdown: 'Выпадающий список',
  number: 'Числовой ответ',
  date: 'Дата',
};

export function createQuestion(type: QuestionType): Question {
  const id = createId();
  switch (type) {
    case 'single-choice':
      return { id, type, prompt: '', required: true, options: [] };
    case 'multiple-choice':
      return { id, type, prompt: '', required: true, options: [] };
    case 'text':
      return { id, type, prompt: '', required: true, multiline: false };
    case 'image-choice':
      return { id, type, prompt: '', required: true, multiple: false, options: [] };
    case 'true-false':
      return { id, type, prompt: '', required: true };
    case 'dropdown':
      return { id, type, prompt: '', required: true, options: [] };
    case 'number':
      return { id, type, prompt: '', required: true };
    case 'date':
      return { id, type, prompt: '', required: true };
  }
}

export function createOption(): Option {
  return { id: createId(), label: '' };
}
