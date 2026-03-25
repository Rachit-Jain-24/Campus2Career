// Feature: ai-career-advisor-chatbot
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { StudentUser } from '@/types/auth';
import type { ChatbotResponse, TransparencyMeta, KnowledgeChunk } from './types';
import * as ragEngine from './ragEngine';
import * as contextManager from './contextManager';
import { classify } from './intentClassifier';
import { analyze } from './sentimentAnalyzer';
import { rank } from './personalizationEngine';
import { build } from './promptBuilder';

const MODEL_NAME = 'gemini-1.5-flash';
const TIMEOUT_MS = 15_000;

function getGenAI(): GoogleGenerativeAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
  return new GoogleGenerativeAI(apiKey);
}

function buildFallbackResponse(topChunk: KnowledgeChunk): string {
  return `Based on available information about ${topChunk.title}: ${topChunk.content.slice(0, 400)}... 
  (Note: AI generation is temporarily unavailable. This is a summary from our knowledge base.)`;
}

async function* singleChunkIterable(text: string): AsyncIterable<string> {
  yield text;
}

/**
 * Initialize the chatbot for a given student.
 * Calls ragEngine.initialize and restores the context session.
 */
export async function initialize(student: StudentUser): Promise<void> {
  await ragEngine.initialize(student);
  contextManager.restore(student.uid);
}

/**
 * Send a message through the full NLP pipeline and return a streaming response.
 */
export async function sendMessage(
  message: string,
  student: StudentUser
): Promise<ChatbotResponse> {
  // Ensure RAG engine is initialized before processing (handles race condition
  // where user sends a message before the setTimeout(..., 0) in initialize() fires)
  if (!ragEngine.isInitialized()) {
    await ragEngine.initialize(student);
  }

  // Step 1 — add user turn to context
  contextManager.addTurn({ role: 'user', content: message, timestamp: Date.now() });

  // Step 2 — intent classification
  const intentResult = classify(message);

  // Step 3 — sentiment analysis
  const sentimentResult = analyze(message);

  // Step 4 — RAG retrieval
  const ragResult = ragEngine.retrieve(message);

  // Step 5 — personalization ranking
  const personalizationResult = rank(ragResult, student, intentResult.intent);

  // Step 6 — prompt assembly
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
  const topChunkTitle = topChunk?.title ?? '';

  // Build TransparencyMeta (modelUsed will be overwritten on fallback)
  const transparencyMeta: TransparencyMeta = {
    intent: intentResult.intent,
    intentConfidence: intentResult.confidence,
    sentimentLabel: sentimentResult.label,
    sentimentScore: sentimentResult.score,
    ragChunksRetrieved: ragResult.chunks.length,
    topChunkTitle,
    placementReadinessScore: personalizationResult.readinessScore,
    modelUsed: MODEL_NAME,
  };

  // Step 7 — call Gemini with streaming + 15s timeout
  let stream: AsyncIterable<string>;

  // Guard: if no API key is configured, skip Gemini and use fallback immediately
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
  if (!apiKey) {
    transparencyMeta.modelUsed = 'local-fallback';
    const fallbackText = buildFallbackResponse(
      topChunk ?? { title: 'career guidance', content: 'Please check your profile and try again.', id: '', source: 'faq', tags: [], tfidfVector: new Map() }
    );
    contextManager.addTurn({ role: 'assistant', content: fallbackText, timestamp: Date.now() });
    contextManager.persist(student.uid);
    return { stream: singleChunkIterable(fallbackText), transparencyMeta, suggestedPrompts: personalizationResult.suggestedPrompts };
  }

  try {
    const genAI = getGenAI();
    let result;
    const modelOptions = [MODEL_NAME, 'gemini-1.5-flash-8b', 'gemini-pro'];
    let lastErr = null;

    for (const modelId of modelOptions) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId });
        const generatePromise = model.generateContent(prompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
        );

        result = await Promise.race([generatePromise, timeoutPromise]);
        if (result) {
          transparencyMeta.modelUsed = modelId as any;
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn(`Model ${modelId} failed, trying next...`);
        continue;
      }
    }

    if (!result) throw lastErr || new Error('All models failed');

    const responseText = result.response.text();

    // Persist assistant turn
    contextManager.addTurn({ role: 'assistant', content: responseText, timestamp: Date.now() });
    contextManager.persist(student.uid);

    stream = singleChunkIterable(responseText);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Gemini API error (final):', errMsg);

    const fallbackText = buildFallbackResponse(
      topChunk ?? { title: 'career guidance', content: 'Please check your profile and try again.', id: '', source: 'faq', tags: [], tfidfVector: new Map() }
    );
    
    // For debugging, include error in fallback during development
    const debugFallbackText = `${fallbackText}\n\n(Technical Error: ${errMsg})\n(Final Model Attempted: ${transparencyMeta.modelUsed})`;

    transparencyMeta.modelUsed = 'local-fallback';
    contextManager.addTurn({ role: 'assistant', content: debugFallbackText, timestamp: Date.now() });
    contextManager.persist(student.uid);

    stream = singleChunkIterable(debugFallbackText);
  }

  return {
    stream,
    transparencyMeta,
    suggestedPrompts: personalizationResult.suggestedPrompts,
  };
}

/**
 * Clear the session for a given student uid.
 */
export function clearSession(uid: string): void {
  contextManager.clear(uid);
}
