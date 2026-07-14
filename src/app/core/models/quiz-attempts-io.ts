import { formatResponse } from './quiz-attempt';
import { scoreAttempt } from './quiz-scoring';
import { Quiz, QuizAttempt } from './quiz.models';

export function exportAttemptsToCsv(
  translate: (key: string, params?: Record<string, unknown>) => string,
  quiz: Quiz,
  attempts: QuizAttempt[],
): string {
  const headers = [
    translate('quizResults.respondentHeader'),
    translate('quizResults.startedHeader'),
    translate('quizResults.completedHeader'),
    ...(quiz.settings.isGraded ? [translate('quizResults.scoreHeader')] : []),
    ...quiz.questions.map((question) => question.prompt),
  ];
  const rows = attempts.map((attempt) => {
    const effectiveQuiz = attempt.quizSnapshot ?? quiz;
    const score = scoreAttempt(effectiveQuiz, attempt.responses);
    return [
      attempt.respondentName ?? translate('quizResults.anonymous'),
      formatDate(attempt.startedAt),
      attempt.completedAt ? formatDate(attempt.completedAt) : '',
      ...(quiz.settings.isGraded ? [score ? `${score.correct}/${score.total}` : ''] : []),
      ...quiz.questions.map((question) => {
        const effectiveQuestion =
          effectiveQuiz.questions.find((candidate) => candidate.id === question.id) ?? question;
        return formatResponse(
          translate,
          effectiveQuestion,
          attempt.responses.find((response) => response.questionId === question.id),
        );
      }),
    ];
  });
  // Excel on a ru-RU locale treats "," as the decimal separator and defaults
  // to ";" as the CSV delimiter, so "," here would silently merge columns.
  return [headers, ...rows].map((row) => row.map(csvEscape).join(';')).join('\r\n');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU');
}

function csvEscape(value: string): string {
  return /["\n\r;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
