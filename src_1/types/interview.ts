// ── Taxonomy ──────────────────────────────────────────────────────────────
export type InterviewMode = 'dsa' | 'system_design' | 'behavioral' | 'project' | 'hr';
export type Difficulty = 'junior' | 'mid' | 'senior' | 'staff';
export type AnswerMethod = 'voice' | 'text' | 'code' | 'voice_and_code';

export interface QuestionMetadata {
  id: string;
  text: string;
  mode: InterviewMode;
  difficulty: Difficulty;
  topicTags: string[];
  companyTags: string[];
  expectedDurationSec: number;
  rubric: RubricCriteria[];
  followUpSeeds: string[];
  answerMethod: AnswerMethod;
  modelSolution?: string;       // reference solution for DSA evaluation
  testCases?: string;           // sample test cases for correctness checking
  progressionLevel?: number;    // 1 = easiest, N = hardest within session
}

// ── Rubric ──────────────────────────────────────────────────────────────────
export interface RubricCriteria {
  criterion: string;
  weight: number;
  description: string;
}

// ── Evaluation ──────────────────────────────────────────────────────────────
export interface RubricScore {
  criterion: string;
  score: number;
  rationale: string;
  quote?: string;
}

export interface CommunicationAnalysis {
  speechSpeedWPM: number;
  fillerWordCount: number;
  fillerWords: string[];
  longestPauseSec: number;
  articulationScore: number;
  confidenceScore: number;
  clarityScore: number;
}

export interface STARAnalysis {
  situation: { present: boolean; quality: number; extract: string };
  task: { present: boolean; quality: number; extract: string };
  action: { present: boolean; quality: number; extract: string };
  result: { present: boolean; quality: number; extract: string };
  overallSTARScore: number;
  missing: string[];
}

export interface QuestionEvaluation {
  questionId: string;
  answer: string;
  answerMethod: AnswerMethod;
  codeSubmission?: string;
  codeLanguage?: string;
  durationSec: number;
  rubricScores: RubricScore[];
  overallScore: number;
  technicalDepthScore: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestion?: string;
  followUpEvaluation?: QuestionEvaluation;
  communication?: CommunicationAnalysis;
  starAnalysis?: STARAnalysis;
  hireSignal?: 'strong_yes' | 'yes' | 'lean_yes' | 'no' | 'strong_no';
}

// ── Session ─────────────────────────────────────────────────────────────────
export type SessionPhase =
  | 'lobby'
  | 'briefing'
  | 'thinking'
  | 'answering'
  | 'ai_responding'
  | 'follow_up'
  | 'between_questions'
  | 'round_complete'
  | 'finished';

export interface InterviewRound {
  mode: InterviewMode;
  label: string;
  questionCount: number;
  durationMinutes: number;
}

export interface SessionConfig {
  difficulty: Difficulty;
  targetRole: string;
  targetCompany: string;
  rounds: InterviewRound[];
  codeLanguage: string;
  resumeText: string;
  resumeName: string;
}

export interface InterviewSession {
  id: string;
  date: string;
  difficulty: Difficulty;
  targetRole: string;
  rounds: InterviewRound[];
  questions: QuestionMetadata[];
  evaluations: QuestionEvaluation[];
  resumeUsed: boolean;
  overallScore: number;
  roundScores: Partial<Record<InterviewMode, number>>;
  hireRecommendation: 'strong_yes' | 'yes' | 'lean_yes' | 'no' | 'strong_no';
  aiInterviewerNotes: string;
  durationSec: number;
}
