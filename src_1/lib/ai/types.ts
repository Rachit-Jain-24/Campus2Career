import type { StudentUser } from '@/types/auth';

export type { StudentUser };

// RAG Engine types
export interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
  source: 'industry_benchmark' | 'leetcode' | 'faq' | 'student_profile';
  tags: string[];
  tfidfVector: Map<string, number>;
}

export interface RAGResult {
  chunks: KnowledgeChunk[];
  queryVector: Map<string, number>;
}

// Intent Classifier types
export type Intent =
  | 'skill_gap_query'
  | 'interview_prep'
  | 'company_info'
  | 'placement_advice'
  | 'resume_help'
  | 'leetcode_guidance';

export interface IntentResult {
  intent: Intent;
  confidence: number;
  matchedKeywords: string[];
}

// Context Manager types
export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ExtractedEntities {
  companies: string[];
  roles: string[];
  skills: string[];
}

export interface ContextSnapshot {
  turns: ConversationTurn[];
  entities: ExtractedEntities;
}

// Sentiment Analyzer types
export type SentimentLabel = 'stressed' | 'neutral' | 'confident';

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
  matchedTerms: string[];
}

// Personalization Engine types
export interface RankedChunk {
  chunk: KnowledgeChunk;
  combinedScore: number;
  cosineScore: number;
  profileScore: number;
}

export interface PersonalizationResult {
  rankedChunks: RankedChunk[];
  readinessScore: number;
  suggestedPrompts: string[];
}

// Prompt Builder types
export interface PromptInput {
  student: StudentUser;
  ragResult: RAGResult;
  intent: IntentResult;
  sentiment: SentimentResult;
  personalization: PersonalizationResult;
  context: ContextSnapshot;
  userMessage: string;
}

// Chatbot Service types
export interface TransparencyMeta {
  intent: Intent;
  intentConfidence: number;
  sentimentLabel: SentimentLabel;
  sentimentScore: number;
  ragChunksRetrieved: number;
  topChunkTitle: string;
  placementReadinessScore: number;
  modelUsed: string;
}

export interface ChatbotResponse {
  stream: AsyncIterable<string>;
  transparencyMeta: TransparencyMeta;
  suggestedPrompts: string[];
}

// Session persistence
export interface PersistedSession {
  version: 1;
  uid: string;
  turns: ConversationTurn[];
  entities: ExtractedEntities;
  lastUpdated: number;
}

// UI Message type (for ChatPanel)
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  transparencyMeta?: TransparencyMeta;
  isStreaming?: boolean;
  feedback?: 'up' | 'down' | null;
}
