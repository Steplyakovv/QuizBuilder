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
  rating: 'Шкала оценки',
  slider: 'Ползунок',
  'constant-sum': 'Распределение баллов',
  'word-choice': 'Выбор слов',
  'fill-in-the-blank': 'Текст с пропусками',
  ranking: 'Сортировка вариантов',
  matching: 'Сопоставление пар',
  matrix: 'Таблица (матрица)',
  hotspot: 'Область на изображении',
  'file-upload': 'Загрузка файла',
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
    case 'rating':
      return { id, type, prompt: '', required: true, min: 1, max: 5 };
    case 'slider':
      return { id, type, prompt: '', required: true, min: 0, max: 100, step: 1 };
    case 'constant-sum':
      return { id, type, prompt: '', required: true, options: [], total: 100 };
    case 'word-choice':
      return { id, type, prompt: '', required: true, words: [] };
    case 'fill-in-the-blank':
      return { id, type, prompt: '', required: true, template: '' };
    case 'ranking':
      return { id, type, prompt: '', required: true, options: [] };
    case 'matching':
      return { id, type, prompt: '', required: true, pairs: [] };
    case 'matrix':
      return { id, type, prompt: '', required: true, rows: [], columns: [] };
    case 'hotspot':
      return { id, type, prompt: '', required: true, imageUrl: '', regions: [] };
    case 'file-upload':
      return { id, type, prompt: '', required: true };
  }
}

export function createOption(): Option {
  return { id: createId(), label: '' };
}
