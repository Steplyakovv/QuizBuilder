import { createId } from '../utils/id';
import { Question, Quiz, QuizPage } from './quiz.models';

export interface QuestionPage {
  id: string | undefined;
  title: string | undefined;
  questions: Question[];
}

/**
 * Groups `questions` into pages using `quiz.pages` metadata. Questions sharing a
 * `pageId` are grouped together (in order of first appearance) even if they aren't
 * adjacent in `questions`; a question with no `pageId` gets its own untitled page.
 * When the quiz has no pages configured, everything is returned as a single page.
 */
export function paginateQuestions(quiz: Quiz, questions: Question[]): QuestionPage[] {
  if (!quiz.pages || quiz.pages.length === 0) {
    return [{ id: undefined, title: undefined, questions }];
  }
  const pagesById = new Map(quiz.pages.map((page) => [page.id, page]));
  const pageIndexByPageId = new Map<string, number>();
  const pages: QuestionPage[] = [];
  for (const question of questions) {
    const pageId = question.pageId;
    if (!pageId) {
      pages.push({ id: undefined, title: undefined, questions: [question] });
      continue;
    }
    let index = pageIndexByPageId.get(pageId);
    if (index === undefined) {
      index = pages.length;
      pageIndexByPageId.set(pageId, index);
      pages.push({ id: pageId, title: pagesById.get(pageId)?.title, questions: [] });
    }
    pages[index].questions.push(question);
  }
  return pages;
}

export function addPage(quiz: Quiz, title: string): Quiz {
  const page: QuizPage = { id: createId(), title: title.trim() };
  return { ...quiz, pages: [...(quiz.pages ?? []), page] };
}

export function renamePage(quiz: Quiz, pageId: string, title: string): Quiz {
  const trimmed = title.trim();
  if (!trimmed) {
    return quiz;
  }
  return {
    ...quiz,
    pages: (quiz.pages ?? []).map((page) =>
      page.id === pageId ? { ...page, title: trimmed } : page,
    ),
  };
}

export function removePage(quiz: Quiz, pageId: string): Quiz {
  return {
    ...quiz,
    pages: (quiz.pages ?? []).filter((page) => page.id !== pageId),
    questions: quiz.questions.map((question) =>
      question.pageId === pageId ? { ...question, pageId: undefined } : question,
    ),
  };
}
