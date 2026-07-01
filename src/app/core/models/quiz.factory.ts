import { createId } from '../utils/id';
import { Quiz } from './quiz.models';

export function createQuiz(title: string): Quiz {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: title.trim(),
    questions: [],
    settings: { isGraded: false },
    createdAt: now,
    updatedAt: now,
  };
}
