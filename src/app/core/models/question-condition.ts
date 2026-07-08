import { isQuestionAnswered } from './quiz-attempt';
import { Question, QuestionResponse } from './quiz.models';

export function isQuestionVisible(
  question: Question,
  allQuestions: Question[],
  responses: Record<string, QuestionResponse>,
): boolean {
  const condition = question.condition;
  if (!condition) {
    return true;
  }
  const source = allQuestions.find((candidate) => candidate.id === condition.questionId);
  if (!source) {
    return true;
  }
  return isQuestionAnswered(source, responses[condition.questionId]);
}
