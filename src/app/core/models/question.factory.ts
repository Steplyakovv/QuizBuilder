import { createId } from '../utils/id';
import { Option, Question } from './quiz.models';

export type QuestionType = Question['type'];

/** Order used for the "add question" dropdown; labels live in public/i18n/*.json's questionTypes. */
export const QUESTION_TYPES: QuestionType[] = [
  'single-choice',
  'multiple-choice',
  'text',
  'image-choice',
  'image-grid',
  'true-false',
  'dropdown',
  'number',
  'date',
  'rating',
  'slider',
  'constant-sum',
  'word-choice',
  'fill-in-the-blank',
  'ranking',
  'matching',
  'matrix',
  'hotspot',
  'file-upload',
];

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
    case 'image-grid':
      return { id, type, prompt: '', required: true, columns: 3, options: [] };
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
