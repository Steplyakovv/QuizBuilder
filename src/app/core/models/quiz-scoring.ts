import { splitTemplate } from './fill-in-the-blank';
import { Question, QuestionResponse, Quiz } from './quiz.models';

export interface AttemptScore {
  correct: number;
  total: number;
}

export function hasCorrectAnswer(question: Question): boolean {
  switch (question.type) {
    case 'single-choice':
    case 'dropdown':
      return !!question.correctOptionId;
    case 'multiple-choice':
    case 'image-choice':
      return !!question.correctOptionIds && question.correctOptionIds.length > 0;
    case 'true-false':
      return question.correctAnswer !== undefined;
    case 'word-choice':
      return question.words.length > 1;
    case 'ranking':
      return question.options.length > 1;
    case 'fill-in-the-blank':
      return !!question.correctAnswers && question.correctAnswers.some((answer) => answer.trim());
    case 'matching':
      return question.pairs.length > 1;
    case 'hotspot':
      return !!question.correctRegionId;
    case 'text':
    case 'number':
    case 'date':
    case 'rating':
    case 'slider':
    case 'constant-sum':
    case 'matrix':
    case 'file-upload':
      return false;
  }
}

export function isCorrect(question: Question, response: QuestionResponse | undefined): boolean {
  const selected = response?.selectedOptionIds ?? [];
  switch (question.type) {
    case 'single-choice':
    case 'dropdown':
      return selected.length === 1 && selected[0] === question.correctOptionId;
    case 'multiple-choice':
    case 'image-choice': {
      const correct = question.correctOptionIds ?? [];
      return selected.length === correct.length && correct.every((id) => selected.includes(id));
    }
    case 'true-false':
      return response?.text === (question.correctAnswer ? 'true' : 'false');
    case 'word-choice': {
      const correctOrder = question.words.map((word) => word.id);
      return (
        selected.length === correctOrder.length && selected.every((id, i) => id === correctOrder[i])
      );
    }
    case 'ranking': {
      const correctOrder = question.options.map((option) => option.id);
      return (
        selected.length === correctOrder.length && selected.every((id, i) => id === correctOrder[i])
      );
    }
    case 'fill-in-the-blank': {
      const blanks = response?.blanks ?? [];
      const correct = question.correctAnswers ?? [];
      return correct.every((expected, index) => {
        if (!expected.trim()) return true;
        return (blanks[index] ?? '').trim().toLowerCase() === expected.trim().toLowerCase();
      });
    }
    case 'matching':
      return question.pairs.every((pair) => response?.matches?.[pair.id] === pair.id);
    case 'hotspot':
      return selected.length === 1 && selected[0] === question.correctRegionId;
    case 'text':
    case 'number':
    case 'date':
    case 'rating':
    case 'slider':
    case 'constant-sum':
    case 'matrix':
    case 'file-upload':
      return false;
  }
}

export function formatCorrectAnswer(question: Question): string | undefined {
  if (!hasCorrectAnswer(question)) {
    return undefined;
  }
  switch (question.type) {
    case 'single-choice':
    case 'dropdown':
      return question.options.find((option) => option.id === question.correctOptionId)?.label;
    case 'multiple-choice':
    case 'image-choice': {
      const correctIds = question.correctOptionIds ?? [];
      return question.options
        .filter((option) => correctIds.includes(option.id))
        .map((option) => option.label)
        .join(', ');
    }
    case 'true-false':
      return question.correctAnswer ? 'Да' : 'Нет';
    case 'word-choice':
      return question.words.map((word) => word.label).join(' ');
    case 'ranking':
      return question.options.map((option) => option.label).join(' → ');
    case 'fill-in-the-blank': {
      const segments = splitTemplate(question.template);
      const answers = question.correctAnswers ?? [];
      return segments.reduce(
        (result, segment, index) =>
          index === 0
            ? segment
            : `${result}${answers[index - 1]?.trim() || '[любой ответ]'}${segment}`,
        '',
      );
    }
    case 'matching':
      return question.pairs.map((pair) => `${pair.left} → ${pair.right}`).join(', ');
    case 'hotspot': {
      const index = question.regions.findIndex((region) => region.id === question.correctRegionId);
      return index === -1 ? undefined : `Область №${index + 1}`;
    }
    default:
      return undefined;
  }
}

export function scoreAttempt(quiz: Quiz, responses: QuestionResponse[]): AttemptScore | undefined {
  if (!quiz.settings.isGraded) {
    return undefined;
  }
  const gradableQuestions = quiz.questions.filter(hasCorrectAnswer);
  if (gradableQuestions.length === 0) {
    return undefined;
  }
  const responseByQuestionId = new Map(
    responses.map((response) => [response.questionId, response]),
  );
  const correct = gradableQuestions.filter((question) =>
    isCorrect(question, responseByQuestionId.get(question.id)),
  ).length;
  return { correct, total: gradableQuestions.length };
}
