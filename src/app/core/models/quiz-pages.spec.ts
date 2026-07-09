import { addPage, paginateQuestions, removePage, renamePage } from './quiz-pages';
import { createQuiz } from './quiz.factory';
import { Question, Quiz, TextQuestion } from './quiz.models';

function text(id: string, pageId?: string): TextQuestion {
  return { id, type: 'text', prompt: id, required: false, multiline: false, pageId };
}

describe('paginateQuestions', () => {
  it('returns a single untitled page when the quiz has no pages configured', () => {
    const quiz = createQuiz('Quiz');
    const questions: Question[] = [text('q1'), text('q2')];

    expect(paginateQuestions(quiz, questions)).toEqual([
      { id: undefined, title: undefined, questions },
    ]);
  });

  it('groups questions sharing a pageId even when not adjacent, ordered by first appearance', () => {
    let quiz = createQuiz('Quiz');
    quiz = addPage(quiz, 'Intro');
    quiz = addPage(quiz, 'Details');
    const [intro, details] = quiz.pages!;

    const q1 = text('q1', intro.id);
    const q2 = text('q2', details.id);
    const q3 = text('q3', intro.id);
    const questions: Question[] = [q1, q2, q3];

    const pages = paginateQuestions(quiz, questions);

    expect(pages).toEqual([
      { id: intro.id, title: 'Intro', questions: [q1, q3] },
      { id: details.id, title: 'Details', questions: [q2] },
    ]);
  });

  it('gives each pageless question its own untitled page', () => {
    let quiz = createQuiz('Quiz');
    quiz = addPage(quiz, 'Intro');
    const page = quiz.pages![0];

    const grouped = text('q1', page.id);
    const loose = text('q2');
    const questions: Question[] = [grouped, loose];

    expect(paginateQuestions(quiz, questions)).toEqual([
      { id: page.id, title: 'Intro', questions: [grouped] },
      { id: undefined, title: undefined, questions: [loose] },
    ]);
  });
});

describe('page management helpers', () => {
  let quiz: Quiz;

  beforeEach(() => {
    quiz = createQuiz('Quiz');
  });

  it('adds a page', () => {
    quiz = addPage(quiz, ' Intro ');
    expect(quiz.pages).toHaveLength(1);
    expect(quiz.pages![0].title).toBe('Intro');
  });

  it('renames a page', () => {
    quiz = addPage(quiz, 'Intro');
    const pageId = quiz.pages![0].id;
    quiz = renamePage(quiz, pageId, 'Introduction');
    expect(quiz.pages![0].title).toBe('Introduction');
  });

  it('ignores a blank rename', () => {
    quiz = addPage(quiz, 'Intro');
    const pageId = quiz.pages![0].id;
    quiz = renamePage(quiz, pageId, '   ');
    expect(quiz.pages![0].title).toBe('Intro');
  });

  it('removes a page and unassigns its questions', () => {
    quiz = addPage(quiz, 'Intro');
    const pageId = quiz.pages![0].id;
    quiz = { ...quiz, questions: [text('q1', pageId)] };

    quiz = removePage(quiz, pageId);

    expect(quiz.pages).toHaveLength(0);
    expect(quiz.questions[0].pageId).toBeUndefined();
  });
});
