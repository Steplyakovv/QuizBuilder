import { createId } from './id';

const STORAGE_KEY = 'quiz-builder.client-id';

/** Stable per-browser id (not a real identity) used to enforce attempt limits. */
export function getClientId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const id = createId();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
