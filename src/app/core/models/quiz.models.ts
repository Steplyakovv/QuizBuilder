export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  /** Named groups of questions, shown one page at a time in the runner. */
  pages?: QuizPage[];
  settings: QuizSettings;
  createdAt: string;
  updatedAt: string;
}

export interface QuizPage {
  id: string;
  title: string;
}

export interface QuizSettings {
  isGraded: boolean;
  shuffleQuestions?: boolean;
  /** Auto-submits the attempt once this many minutes have passed since it started. */
  timeLimitMinutes?: number;
  /** Max attempts allowed per respondent (tracked by a per-browser client id). */
  maxAttempts?: number;
  /** Defaults to true when unset, so quizzes created before this setting existed stay accessible. */
  published?: boolean;
  /** When set, a respondent must enter this exact code before taking the quiz. */
  accessPassword?: string;
  /** ISO timestamp; the quiz can no longer be taken once this passes. */
  expiresAt?: string;
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

export interface QuestionCondition {
  /** id of an earlier question that must be answered before this question is shown. */
  questionId: string;
}

export interface BaseQuestion {
  id: string;
  prompt: string;
  required: boolean;
  /** When set, this question is only shown if the referenced answer matches. */
  condition?: QuestionCondition;
  /** id of a QuizPage this question belongs to; questions without one get their own page. */
  pageId?: string;
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
  /** Per-browser id used to enforce settings.maxAttempts; not a real identity. */
  respondentClientId?: string;
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
