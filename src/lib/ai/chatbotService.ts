// Feature: ai-career-advisor-chatbot
import { callOpenRouter, isOpenRouterConfigured } from '../openRouter';
import type { StudentUser } from '../../types/auth';
import type { ChatbotResponse, TransparencyMeta, KnowledgeChunk, IntentResult } from './types';
import * as ragEngine from './ragEngine';
import * as contextManager from './contextManager';
import { classify } from './intentClassifier';
import { analyze } from './sentimentAnalyzer';
import { rank } from './personalizationEngine';
import { build } from './promptBuilder';
import { studentsDb } from '../../services/db/database.service';

const TIMEOUT_MS = 15_000; // 15s to get the first token
const studentCache = new Map<string, StudentUser>();

function buildFallbackResponse(topChunk: KnowledgeChunk): string {
  return `Based on available information about ${topChunk.title}: ${topChunk.content.slice(0, 400)}...\n\n(Note: Live AI generation is temporarily unavailable. This is a summary from our internal knowledge base.)`;
}

async function* singleChunkIterable(text: string): AsyncIterable<string> {
  yield text;
}

/**
 * 1. DATABASE AGNOSTIC INTEGRATION
 * Fetch student data from the active database or cache.
 */
async function getCachedStudentProfile(sapId: string, fallbackStudent: StudentUser): Promise<StudentUser> {
  if (!sapId) return fallbackStudent;
  if (studentCache.has(sapId)) return studentCache.get(sapId)!;

  try {
    const data = await studentsDb.getStudentBySapId(sapId);
    if (data) {
      // Map AdminStudentProfile back to StudentUser if needed, or assume interface compatibility
      const studentData = data as unknown as StudentUser;
      studentCache.set(sapId, studentData);
      return studentData;
    }
  } catch (err) {
    console.error('Failed to fetch student from database, using fallback:', err);
  }

  // Use the UI-provided student if database fetch fails
  studentCache.set(sapId, fallbackStudent);
  return fallbackStudent;
}

/**
 * 6. SUGGESTED PROMPTS GENERATOR
 */
function generateSuggestedPrompts(student: StudentUser, intent: IntentResult): string[] {
  const year = student.currentYear || 1;
  const isPlaced = student.placementStatus === 'Placed';
  const hasResume = !!student.resumeUrl;

  const prompts: string[] = [];

  // Focus on intent first
  if (intent.intent === 'leetcode_guidance') {
    prompts.push("What are the best DSA topics for my upcoming interviews?");
    prompts.push("Can you give me a weekly LeetCode study plan?");
  } else if (intent.intent === 'resume_help' && !hasResume) {
    prompts.push("What are the key sections I need to add to my resume?");
  } else if (intent.intent === 'interview_prep') {
    prompts.push("Give me 3 mock interview questions for my target role.");
  }

  // Focus on year / placement status
  if (isPlaced) {
    prompts.push("How can I prepare for the transition to a full-time role?");
    prompts.push("What technologies should I learn before joining my company?");
  } else if (year >= 3) {
    if ((student.leetcodeStats?.totalSolved || 0) < 100) {
      prompts.push("How do I improve my coding consistency for placement drives?");
    }
    prompts.push("Review my skill gaps against the latest tech benchmarks.");
  } else {
    prompts.push("What projects should I build this semester?");
    if (student.techSkills?.length === 0) {
      prompts.push("Where should I start if I want to learn web development?");
    }
  }

  // Fallback defaults if not enough generated
  if (prompts.length < 3) {
    prompts.push("Can you analyze my current placement readiness given my profile?");
  }
  if (prompts.length < 4) {
    prompts.push("What is the most critical area I need to focus on next?");
  }

  return prompts.slice(0, 4);
}

/**
 * Initialize the chatbot for a given student.
 */
export async function initialize(student: StudentUser): Promise<void> {
  // Pre-fetch/cache to have memory ready
  await getCachedStudentProfile(student.sapId, student);
  await ragEngine.initialize(student);
  contextManager.restore(student.uid);
}

/**
 * Central Pipeline execution.
 */
export async function sendMessage(
  message: string,
  uiStudent: StudentUser
): Promise<ChatbotResponse> {
  // Step 1: Input Processing
  const student = await getCachedStudentProfile(uiStudent.sapId, uiStudent);

  if (!ragEngine.isInitialized()) {
    await ragEngine.initialize(student);
  }

  contextManager.addTurn({ role: 'user', content: message, timestamp: Date.now() });

  const intentResult = classify(message);
  const sentimentResult = analyze(message);

  // Step 2 & 3: RAG Retrieval + Context Building + Personalization
  const ragResult = await ragEngine.retrieve(message);
  const personalizationResult = rank(ragResult, student, intentResult.intent);

  // Step 4: Prompt Construction
  const prompt = build({
    student,
    ragResult,
    intent: intentResult,
    sentiment: sentimentResult,
    personalization: personalizationResult,
    context: contextManager.getSnapshot(),
    userMessage: message,
  });

  const topChunk = ragResult.chunks[0];
  const suggestedPrompts = generateSuggestedPrompts(student, intentResult);
  
  const transparencyMeta: TransparencyMeta = {
    intent: intentResult.intent,
    intentConfidence: intentResult.confidence,
    sentimentLabel: sentimentResult.label,
    sentimentScore: sentimentResult.score,
    ragChunksRetrieved: ragResult.chunks.length,
    topChunkTitle: topChunk?.title ?? '',
    placementReadinessScore: personalizationResult.readinessScore,
    modelUsed: 'openrouter',
  };

  // Step 5: LLM Call via OpenRouter
  if (!isOpenRouterConfigured()) {
    // Local fallback when API key is missing
    transparencyMeta.modelUsed = 'local-fallback';
    const fallbackText = buildFallbackResponse(
      topChunk ?? { title: 'career guidance', content: 'Please check your profile.', id: '', source: 'faq', tags: [], tfidfVector: new Map() }
    );
    contextManager.addTurn({ role: 'assistant', content: fallbackText, timestamp: Date.now() });
    contextManager.persist(student.uid);
    return { stream: singleChunkIterable(fallbackText), transparencyMeta, suggestedPrompts };
  }

  try {
    // OpenRouter doesn't support streaming in the same way, so we get full response
    const response = await callOpenRouter(prompt);
    
    // Create a single-chunk stream for compatibility
    async function* singleResponseStream(): AsyncIterable<string> {
      yield response;
      contextManager.addTurn({ role: 'assistant', content: response, timestamp: Date.now() });
      contextManager.persist(student.uid);
    }
    
    return { stream: singleResponseStream(), transparencyMeta, suggestedPrompts };
  } catch (err) {
    console.error('OpenRouter API failed:', err);
    
    transparencyMeta.modelUsed = 'local-fallback';
    const fallbackText = buildFallbackResponse(
      topChunk ?? { title: 'career guidance', content: 'System is experiencing heavy load. Please try again soon.', id: '', source: 'faq', tags: [], tfidfVector: new Map() }
    ) + `\n\n**[Status]** System core was unable to connect.`;
    
    contextManager.addTurn({ role: 'assistant', content: fallbackText, timestamp: Date.now() });
    contextManager.persist(student.uid);
    return { stream: singleChunkIterable(fallbackText), transparencyMeta, suggestedPrompts };
  }
}

/**
 * Clear the session for a given student uid.
 */
export function clearSession(uid: string): void {
  contextManager.clear(uid);
}
