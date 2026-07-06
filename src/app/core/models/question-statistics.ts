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
    const correct = attempts.filter((attempt) =>
      isCorrect(
        question,
        attempt.responses.find((response) => response.questionId === question.id),
      ),
    ).length;
    return {
      questionId: question.id,
      correct,
      incorrect: attempts.length - correct,
      total: attempts.length,
    };
  });
}
