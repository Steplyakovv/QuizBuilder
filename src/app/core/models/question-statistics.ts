import { hasCorrectAnswer, isCorrect } from './quiz-scoring';
import { Quiz, QuizAttempt } from './quiz.models';

export interface QuestionStat {
  questionId: string;
  correct: number;
  incorrect: number;
  total: number;
}

export function questionStatistics(quiz: Quiz, attempts: QuizAttempt[]): QuestionStat[] {
  if (!quiz.settings.isGraded) {
    return [];
  }
  return quiz.questions.filter(hasCorrectAnswer).map((question) => {
    const correct = attempts.filter((attempt) => {
      // Use the question as the respondent actually saw it, not later edits to the live quiz.
      const effectiveQuestion =
        attempt.quizSnapshot?.questions.find((candidate) => candidate.id === question.id) ??
        question;
      return isCorrect(
        effectiveQuestion,
        attempt.responses.find((response) => response.questionId === question.id),
      );
    }).length;
    return {
      questionId: question.id,
      correct,
      incorrect: attempts.length - correct,
      total: attempts.length,
    };
  });
}
