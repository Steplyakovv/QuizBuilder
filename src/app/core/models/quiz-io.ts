import { createId } from '../utils/id';
import { Quiz } from './quiz.models';

export function exportQuizToJson(quiz: Quiz): string {
  return JSON.stringify(quiz, null, 2);
}

export function parseImportedQuiz(json: string): Quiz {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Файл повреждён или не является корректным JSON.');
  }
  if (!isQuizShape(parsed)) {
    throw new Error('Файл не похож на экспортированный опросник.');
  }
  const now = new Date().toISOString();
  return { ...parsed, id: createId(), createdAt: now, updatedAt: now };
}

function isQuizShape(value: unknown): value is Quiz {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const quiz = value as Record<string, unknown>;
  return (
    typeof quiz['title'] === 'string' &&
    quiz['title'].trim().length > 0 &&
    Array.isArray(quiz['questions']) &&
    typeof quiz['settings'] === 'object' &&
    quiz['settings'] !== null &&
    typeof (quiz['settings'] as Record<string, unknown>)['isGraded'] === 'boolean'
  );
}
