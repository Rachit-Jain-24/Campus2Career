import type {
  InterviewMode, Difficulty, RubricCriteria, SessionPhase,
  QuestionMetadata, QuestionEvaluation, SessionConfig, InterviewRound
} from '../types/interview';

// ── Rubric Maps ──────────────────────────────────────────────────────────────
export const RUBRICS: Record<InterviewMode, RubricCriteria[]> = {
  dsa: [
    { criterion: 'Problem Understanding', weight: 0.15, description: 'Correctly identifies constraints and edge cases before coding' },
    { criterion: 'Algorithm Choice', weight: 0.25, description: 'Selects optimal algorithm with justified reasoning' },
    { criterion: 'Correctness', weight: 0.25, description: 'Solution handles all cases including edge cases' },
    { criterion: 'Complexity Analysis', weight: 0.20, description: 'Accurately states time and space complexity with explanation' },
    { criterion: 'Code Quality', weight: 0.15, description: 'Clean, readable, idiomatic code with good naming' },
  ],
  system_design: [
    { criterion: 'Requirements Clarification', weight: 0.15, description: 'Asks clarifying questions before designing' },
    { criterion: 'High-Level Architecture', weight: 0.25, description: 'Proposes clear components and their interactions' },
    { criterion: 'Scalability', weight: 0.25, description: 'Addresses bottlenecks, load balancing, sharding, caching' },
    { criterion: 'Trade-off Awareness', weight: 0.20, description: 'Acknowledges CAP theorem, consistency vs availability, etc.' },
    { criterion: 'API & Data Modeling', weight: 0.15, description: 'Defines clear APIs and schema decisions' },
  ],
  behavioral: [
    { criterion: 'Situation Clarity (S)', weight: 0.15, description: 'Clearly sets up context and stakes' },
    { criterion: 'Task Definition (T)', weight: 0.15, description: 'Specifies their role and responsibility' },
    { criterion: 'Action Detail (A)', weight: 0.40, description: 'Describes concrete, specific actions taken — the heart of STAR' },
    { criterion: 'Result & Impact (R)', weight: 0.20, description: 'Quantified, verifiable outcome' },
    { criterion: 'Reflection', weight: 0.10, description: 'Shows self-awareness and learning' },
  ],
  project: [
    { criterion: 'Architecture Rationale', weight: 0.30, description: 'Justifies tech choices with trade-offs' },
    { criterion: 'Problem Solving', weight: 0.25, description: 'Describes challenges faced and how overcome' },
    { criterion: 'Ownership & Impact', weight: 0.25, description: 'Clear individual contribution, not team-vague' },
    { criterion: 'Technical Depth', weight: 0.20, description: 'Goes beyond surface — discusses internals, performance, scale' },
  ],
  hr: [
    { criterion: 'Authenticity', weight: 0.25, description: 'Answer feels genuine and personal, not rehearsed' },
    { criterion: 'Alignment to Role', weight: 0.30, description: 'Connects answer to the target role/company' },
    { criterion: 'Communication Quality', weight: 0.25, description: 'Clear, structured, confident delivery' },
    { criterion: 'Self-Awareness', weight: 0.20, description: 'Shows realistic understanding of strengths/weaknesses' },
  ],
};

export const ROUND_TEMPLATES: Record<InterviewMode, InterviewRound> = {
  dsa: { mode: 'dsa', label: 'DSA / Coding', questionCount: 2, durationMinutes: 30 },
  system_design: { mode: 'system_design', label: 'System Design', questionCount: 1, durationMinutes: 25 },
  behavioral: { mode: 'behavioral', label: 'Behavioral', questionCount: 3, durationMinutes: 20 },
  project: { mode: 'project', label: 'Project Deep-Dive', questionCount: 2, durationMinutes: 20 },
  hr: { mode: 'hr', label: 'HR Round', questionCount: 3, durationMinutes: 15 },
};

export const DIFFICULTY_INFO: Record<Difficulty, { label: string; years: string; lcLevel: string; teaser: string }> = {
  junior: { label: 'Junior', years: '0–2 yrs', lcLevel: 'LeetCode Easy', teaser: 'Reverse a linked list, basic SQL queries' },
  mid: { label: 'Mid-Level', years: '2–5 yrs', lcLevel: 'LeetCode Medium', teaser: 'LRU Cache, design a rate limiter' },
  senior: { label: 'Senior', years: '5–10 yrs', lcLevel: 'LeetCode Hard', teaser: 'Design Twitter, serialize a binary tree' },
  staff: { label: 'Staff / Principal', years: '10+ yrs', lcLevel: 'LC Hard + Design', teaser: 'Design YouTube at scale, distributed consensus' },
};

export const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'Startup (General)', 'MNC (General)', 'Service-based (TCS/Infosys/Wipro)',
];

export const CODE_LANGUAGES = ['python', 'javascript', 'typescript', 'java', 'cpp', 'go', 'rust', 'sql'];

// ── Answer method per mode ───────────────────────────────────────────────────
export function getAnswerMethod(mode: InterviewMode): 'voice' | 'voice_and_code' | 'text' {
  if (mode === 'dsa') return 'voice_and_code';
  if (mode === 'system_design') return 'text';
  return 'voice';
}

// ── State Machine ────────────────────────────────────────────────────────────
export type InterviewAction =
  | { type: 'START_SESSION'; config: SessionConfig }
  | { type: 'BRIEFING_DONE' }
  | { type: 'START_ANSWERING' }
  | { type: 'ANSWER_SUBMITTED'; answer: string; code?: string; duration: number }
  | { type: 'EVALUATION_COMPLETE'; evaluation: QuestionEvaluation }
  | { type: 'FOLLOW_UP_ANSWERED' }
  | { type: 'ADVANCE_QUESTION' }
  | { type: 'ROUND_COMPLETE' }
  | { type: 'SESSION_COMPLETE' }
  | { type: 'SET_AI_MESSAGE'; message: string; speaking: boolean }
  | { type: 'SET_QUESTIONS'; questions: QuestionMetadata[] }
  | { type: 'ABORT' };

export interface InterviewState {
  phase: SessionPhase;
  config: SessionConfig | null;
  currentRoundIndex: number;
  currentQuestionIndex: number;
  questions: QuestionMetadata[];
  evaluations: QuestionEvaluation[];
  sessionStartTime: number;
  aiMessage: string;
  isAiSpeaking: boolean;
  error: string | null;
  pendingAnswer: { answer: string; code?: string; duration: number } | null;
}

export const initialInterviewState: InterviewState = {
  phase: 'lobby',
  config: null,
  currentRoundIndex: 0,
  currentQuestionIndex: 0,
  questions: [],
  evaluations: [],
  sessionStartTime: 0,
  aiMessage: '',
  isAiSpeaking: false,
  error: null,
  pendingAnswer: null,
};

export function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'START_SESSION':
      return { ...state, phase: 'briefing', config: action.config, sessionStartTime: Date.now(), currentRoundIndex: 0, currentQuestionIndex: 0, questions: [], evaluations: [] };
    case 'BRIEFING_DONE':
      return { ...state, phase: 'thinking' };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.questions };
    case 'START_ANSWERING':
      return { ...state, phase: 'answering' };
    case 'ANSWER_SUBMITTED':
      return { ...state, phase: 'ai_responding', pendingAnswer: { answer: action.answer, code: action.code, duration: action.duration } };
    case 'EVALUATION_COMPLETE': {
      const evals = [...state.evaluations, action.evaluation];
      const hasFollowUp = !!action.evaluation.followUpQuestion;
      return { ...state, evaluations: evals, pendingAnswer: null, phase: hasFollowUp ? 'follow_up' : 'between_questions' };
    }
    case 'FOLLOW_UP_ANSWERED':
      return { ...state, phase: 'between_questions' };
    case 'ADVANCE_QUESTION': {
      const nextQ = state.currentQuestionIndex + 1;
      if (nextQ >= state.questions.length) return { ...state, phase: 'finished' };
      return { ...state, currentQuestionIndex: nextQ, phase: 'thinking' };
    }
    case 'SET_AI_MESSAGE':
      return { ...state, aiMessage: action.message, isAiSpeaking: action.speaking };
    case 'ABORT':
      return { ...initialInterviewState };
    default:
      return state;
  }
}

// ── Score helpers ────────────────────────────────────────────────────────────
export function getHireLabel(score: number): string {
  if (score >= 8.5) return 'Strong Hire';
  if (score >= 7.0) return 'Hire';
  if (score >= 5.5) return 'Lean Hire';
  if (score >= 4.0) return 'No Hire';
  return 'Strong No';
}

export function getHireSignal(score: number): 'strong_yes' | 'yes' | 'lean_yes' | 'no' | 'strong_no' {
  if (score >= 8.5) return 'strong_yes';
  if (score >= 7.0) return 'yes';
  if (score >= 5.5) return 'lean_yes';
  if (score >= 4.0) return 'no';
  return 'strong_no';
}

export function scoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 5) return 'text-amber-600';
  return 'text-red-600';
}

export function scoreBg(score: number): string {
  if (score >= 8) return 'bg-green-50 border-green-200';
  if (score >= 5) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}
