export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: QuizSettings;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSettings {
  isGraded: boolean;
  shuffleQuestions?: boolean;
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextQuestion
  | ImageChoiceQuestion
  | TrueFalseQuestion
  | DropdownQuestion
  | NumberQuestion
  | DateQuestion
  | RatingQuestion
  | SliderQuestion
  | ConstantSumQuestion;

export interface BaseQuestion {
  id: string;
  prompt: string;
  required: boolean;
}

export interface Option {
  id: string;
  label: string;
  imageUrl?: string;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: Option[];
  correctOptionId?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: Option[];
  correctOptionIds?: string[];
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  multiline: boolean;
  maxLength?: number;
}

export interface ImageChoiceQuestion extends BaseQuestion {
  type: 'image-choice';
  multiple: boolean;
  options: Option[];
  correctOptionIds?: string[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  correctAnswer?: boolean;
}

export interface DropdownQuestion extends BaseQuestion {
  type: 'dropdown';
  options: Option[];
  correctOptionId?: string;
}

export interface NumberQuestion extends BaseQuestion {
  type: 'number';
  min?: number;
  max?: number;
}

export interface DateQuestion extends BaseQuestion {
  type: 'date';
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  min: number;
  max: number;
}

export interface SliderQuestion extends BaseQuestion {
  type: 'slider';
  min: number;
  max: number;
  step: number;
}

export interface ConstantSumQuestion extends BaseQuestion {
  type: 'constant-sum';
  options: Option[];
  total: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  respondentName?: string;
  startedAt: string;
  completedAt?: string;
  responses: QuestionResponse[];
  score?: number;
}

export interface QuestionResponse {
  questionId: string;
  selectedOptionIds?: string[];
  text?: string;
  distribution?: Record<string, number>;
}
