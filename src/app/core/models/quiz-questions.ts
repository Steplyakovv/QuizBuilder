import { createQuestion, QuestionType } from './question.factory';
import { Quiz } from './quiz.models';

export function addQuestion(quiz: Quiz, type: QuestionType): Quiz {
  return { ...quiz, questions: [...quiz.questions, createQuestion(type)] };
}

export function removeQuestion(quiz: Quiz, questionId: string): Quiz {
  return { ...quiz, questions: quiz.questions.filter((question) => question.id !== questionId) };
}

export function updateQuestionPrompt(quiz: Quiz, questionId: string, prompt: string): Quiz {
  return {
    ...quiz,
    questions: quiz.questions.map((question) =>
      question.id === questionId ? { ...question, prompt } : question,
    ),
  };
}

export function reorderQuestions(quiz: Quiz, previousIndex: number, currentIndex: number): Quiz {
  const questions = [...quiz.questions];
  const [moved] = questions.splice(previousIndex, 1);
  questions.splice(currentIndex, 0, moved);
  return { ...quiz, questions };
}
