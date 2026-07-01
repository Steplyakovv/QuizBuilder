import { createId } from '../utils/id';
import { Option, Question } from './quiz.models';

export type QuestionType = Question['type'];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'single-choice': 'Одиночный выбор',
  'multiple-choice': 'Множественный выбор',
  text: 'Текстовый ответ',
  'image-choice': 'Выбор картинки',
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
  }
}

export function createOption(): Option {
  return { id: createId(), label: '' };
}
