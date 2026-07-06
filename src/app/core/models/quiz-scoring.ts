import { Question, QuestionResponse, Quiz } from './quiz.models';

export interface AttemptScore {
  correct: number;
  total: number;
}

function hasCorrectAnswer(question: Question): boolean {
  switch (question.type) {
    case 'single-choice':
      return !!question.correctOptionId;
    case 'multiple-choice':
    case 'image-choice':
      return !!question.correctOptionIds && question.correctOptionIds.length > 0;
    case 'text':
      return false;
  }
}

function isCorrect(question: Question, response: QuestionResponse | undefined): boolean {
  const selected = response?.selectedOptionIds ?? [];
  switch (question.type) {
    case 'single-choice':
      return selected.length === 1 && selected[0] === question.correctOptionId;
    case 'multiple-choice':
    case 'image-choice': {
      const correct = question.correctOptionIds ?? [];
      return selected.length === correct.length && correct.every((id) => selected.includes(id));
    }
    case 'text':
      return false;
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
