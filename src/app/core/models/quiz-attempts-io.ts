import { formatResponse } from './quiz-attempt';
import { scoreAttempt } from './quiz-scoring';
import { Quiz, QuizAttempt } from './quiz.models';

export function exportAttemptsToCsv(quiz: Quiz, attempts: QuizAttempt[]): string {
  const headers = [
    'Респондент',
    'Начато',
    'Завершено',
    ...(quiz.settings.isGraded ? ['Баллы'] : []),
    ...quiz.questions.map((question) => question.prompt),
  ];
  const rows = attempts.map((attempt) => {
    const effectiveQuiz = attempt.quizSnapshot ?? quiz;
    const score = scoreAttempt(effectiveQuiz, attempt.responses);
    return [
      attempt.respondentName ?? 'Аноним',
      formatDate(attempt.startedAt),
      attempt.completedAt ? formatDate(attempt.completedAt) : '',
      ...(quiz.settings.isGraded ? [score ? `${score.correct}/${score.total}` : ''] : []),
      ...quiz.questions.map((question) => {
        const effectiveQuestion =
          effectiveQuiz.questions.find((candidate) => candidate.id === question.id) ?? question;
        return formatResponse(
          effectiveQuestion,
          attempt.responses.find((response) => response.questionId === question.id),
        );
      }),
    ];
  });
  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU');
}

function csvEscape(value: string): string {
  return /["\n\r,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
