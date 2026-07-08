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
  | ConstantSumQuestion
  | WordChoiceQuestion
  | FillInTheBlankQuestion
  | RankingQuestion
  | MatchingQuestion
  | MatrixQuestion
  | HotspotQuestion
  | FileUploadQuestion;

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

/**
 * The word order in `words` is the correct sentence order — the respondent
 * sees them shuffled and must place them back in this order.
 */
export interface WordChoiceQuestion extends BaseQuestion {
  type: 'word-choice';
  words: Option[];
}

export interface FillInTheBlankQuestion extends BaseQuestion {
  type: 'fill-in-the-blank';
  /** Blanks are marked with `{{}}`, e.g. "Небо {{}} цвета." */
  template: string;
  /** One entry per blank; a blank entry means that blank isn't graded. */
  correctAnswers?: string[];
}

/**
 * The option order in `options` is the correct ranking — the respondent
 * sees them shuffled and must drag them back into this order.
 */
export interface RankingQuestion extends BaseQuestion {
  type: 'ranking';
  options: Option[];
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface MatrixQuestion extends BaseQuestion {
  type: 'matrix';
  rows: Option[];
  columns: Option[];
}

export interface HotspotRegion {
  id: string;
  /** Percent (0-100) from the left edge of the image. */
  x: number;
  /** Percent (0-100) from the top edge of the image. */
  y: number;
  /** Percent (0-100) of the image width. */
  width: number;
  /** Percent (0-100) of the image height. */
  height: number;
}

export interface HotspotQuestion extends BaseQuestion {
  type: 'hotspot';
  imageUrl: string;
  regions: HotspotRegion[];
  correctRegionId?: string;
}

export interface FileUploadQuestion extends BaseQuestion {
  type: 'file-upload';
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
  blanks?: string[];
  /** Maps a left-pair id to a right-pair id (matching) or a row id to a column id (matrix). */
  matches?: Record<string, string>;
  file?: { name: string; dataUrl: string };
}
