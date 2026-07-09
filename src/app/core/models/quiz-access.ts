import { Quiz } from './quiz.models';

/** Quizzes created before `published` existed default to published, so they stay accessible. */
export function isQuizPublished(quiz: Quiz): boolean {
  return quiz.settings.published ?? true;
}

export function isQuizExpired(quiz: Quiz, now = new Date()): boolean {
  const expiresAt = quiz.settings.expiresAt;
  return !!expiresAt && now.getTime() >= new Date(expiresAt).getTime();
}

export function quizRequiresPassword(quiz: Quiz): boolean {
  return !!quiz.settings.accessPassword;
}

export function isAccessPasswordCorrect(quiz: Quiz, attempt: string): boolean {
  return attempt.trim() === (quiz.settings.accessPassword ?? '').trim();
}
