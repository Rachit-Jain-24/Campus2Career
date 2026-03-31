// Feature: ai-career-advisor-chatbot
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { StudentUser } from '../../types/auth';
import type { ChatbotResponse, TransparencyMeta, KnowledgeChunk, IntentResult } from './types';
import * as ragEngine from './ragEngine';
import * as contextManager from './contextManager';
import { classify } from './intentClassifier';
import { analyze } from './sentimentAnalyzer';
import { rank } from './personalizationEngine';
import { build } from './promptBuilder';
import { studentsDb } from '../../services/db/database.service';

const MODEL_NAME = 'gemini-2.5-flash';
const TIMEOUT_MS = 15_000; // 15s to get the first token
const studentCache = new Map<string, StudentUser>();

function getGenAI(): GoogleGenerativeAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
  return new GoogleGenerativeAI(apiKey);
}

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
  const ragResult = ragEngine.retrieve(message);
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
    modelUsed: MODEL_NAME,
  };

  // Step 5: LLM Call (Real-time Streaming)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
  if (!apiKey) {
    // Local fallback when API key is missing
    transparencyMeta.modelUsed = 'local-fallback';
    const fallbackText = buildFallbackResponse(
      topChunk ?? { title: 'career guidance', content: 'Please check your profile.', id: '', source: 'faq', tags: [], tfidfVector: new Map() }
    );
    contextManager.addTurn({ role: 'assistant', content: fallbackText, timestamp: Date.now() });
    contextManager.persist(student.uid);
    return { stream: singleChunkIterable(fallbackText), transparencyMeta, suggestedPrompts };
  }

  const genAI = getGenAI();
  const modelOptions = [MODEL_NAME, 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  let successfulStreamResult: AsyncIterable<string> | null = null;
  let finalAccumulatedText = "";
  let lastError: unknown = null;

  for (const modelId of modelOptions) {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      
      // Use standard Promise.race timeout for just the *initialization* of the stream request
      const requestStartPromise = model.generateContentStream(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_CONNECTING')), TIMEOUT_MS)
      );

      const streamResponse = await Promise.race([requestStartPromise, timeoutPromise]);
      
      if (streamResponse) {
        transparencyMeta.modelUsed = modelId as any;

        // Custom async generator wrapper to persist final text locally when stream completes
        async function* trackedStreamGenerator(): AsyncIterable<string> {
          for await (const chunk of streamResponse.stream) {
            const chunkText = chunk.text();
            finalAccumulatedText += chunkText;
            yield chunkText;
          }
          // After finishing streaming, persist exactly what was sent
          contextManager.addTurn({ role: 'assistant', content: finalAccumulatedText, timestamp: Date.now() });
          contextManager.persist(student.uid);
        }

        successfulStreamResult = trackedStreamGenerator();
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelId} failed to start stream, trying next... Error:`, err);
      continue;
    }
  }

  // Step 8: Error Handling — if all models fail to start streaming
  if (!successfulStreamResult) {
    const errorMsg = lastError ? (lastError instanceof Error ? lastError.message : String(lastError)) : "Unknown timeout or network error";
    console.error('Gemini API Streaming failed across all fallback models. Last error:', errorMsg);
    
    transparencyMeta.modelUsed = 'local-fallback';
    const fallbackText = buildFallbackResponse(
      topChunk ?? { title: 'career guidance', content: 'System is experiencing heavy load. Please try again soon.', id: '', source: 'faq', tags: [], tfidfVector: new Map() }
    ) + `\n\n**[Status]** System core was unable to connect.`;
    
    contextManager.addTurn({ role: 'assistant', content: fallbackText, timestamp: Date.now() });
    contextManager.persist(student.uid);
    return { stream: singleChunkIterable(fallbackText), transparencyMeta, suggestedPrompts };
  }

  return {
    stream: successfulStreamResult,
    transparencyMeta,
    suggestedPrompts,
  };
}

/**
 * Clear the session for a given student uid.
 */
export function clearSession(uid: string): void {
  contextManager.clear(uid);
}
