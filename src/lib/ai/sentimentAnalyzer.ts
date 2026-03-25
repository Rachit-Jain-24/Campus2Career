import type { SentimentResult } from './types';

export const STRESS_TERMS: Array<{ term: string; weight: number }> = [
  { term: 'worried', weight: 1.0 },
  { term: 'anxious', weight: 1.0 },
  { term: 'scared', weight: 1.0 },
  { term: 'failing', weight: 1.2 },
  { term: 'failed', weight: 1.2 },
  { term: 'rejected', weight: 1.2 },
  { term: 'rejection', weight: 1.0 },
  { term: 'nervous', weight: 0.8 },
  { term: 'stressed', weight: 1.0 },
  { term: 'overwhelmed', weight: 1.0 },
  { term: 'behind', weight: 0.7 },
  { term: 'not ready', weight: 1.1 },
  { term: 'unprepared', weight: 1.1 },
  { term: 'hopeless', weight: 1.3 },
  { term: 'lost', weight: 0.8 },
  { term: 'confused', weight: 0.6 },
  { term: 'struggling', weight: 0.9 },
  { term: "can't", weight: 0.5 },
  { term: 'impossible', weight: 1.0 },
  { term: 'terrible', weight: 1.0 },
  { term: 'bad at', weight: 0.9 },
  { term: 'weak', weight: 0.7 },
  { term: 'no chance', weight: 1.2 },
  { term: 'give up', weight: 1.3 },
  { term: 'demotivated', weight: 1.0 },
  { term: 'depressed', weight: 1.2 },
  { term: 'doubt', weight: 0.6 },
  { term: 'fear', weight: 0.8 },
  { term: 'panic', weight: 1.0 },
  { term: 'disaster', weight: 1.1 },
  { term: 'horrible', weight: 1.0 },
];

export const CONFIDENCE_TERMS: Array<{ term: string; weight: number }> = [
  { term: 'ready', weight: 1.0 },
  { term: 'confident', weight: 1.0 },
  { term: 'excited', weight: 0.9 },
  { term: 'prepared', weight: 1.0 },
  { term: 'strong', weight: 0.8 },
  { term: 'good at', weight: 0.9 },
  { term: 'skilled', weight: 0.9 },
  { term: 'experienced', weight: 0.8 },
  { term: 'motivated', weight: 0.9 },
  { term: 'optimistic', weight: 0.8 },
  { term: 'improving', weight: 0.7 },
  { term: 'progressing', weight: 0.7 },
  { term: 'achieved', weight: 0.9 },
  { term: 'completed', weight: 0.7 },
  { term: 'mastered', weight: 1.0 },
  { term: 'love', weight: 0.6 },
  { term: 'enjoy', weight: 0.6 },
  { term: 'passionate', weight: 0.9 },
  { term: 'determined', weight: 0.9 },
  { term: 'focused', weight: 0.8 },
];

export function analyze(message: string): SentimentResult {
  const lower = message.toLowerCase();
  const matchedTerms: string[] = [];
  let confidenceSum = 0;
  let stressSum = 0;

  for (const { term, weight } of CONFIDENCE_TERMS) {
    if (lower.includes(term)) {
      matchedTerms.push(term);
      confidenceSum += weight;
    }
  }

  for (const { term, weight } of STRESS_TERMS) {
    if (lower.includes(term)) {
      matchedTerms.push(term);
      stressSum += weight;
    }
  }

  const rawScore = confidenceSum - stressSum;

  const label =
    rawScore < -0.5 ? 'stressed' : rawScore > 0.5 ? 'confident' : 'neutral';

  return { label, score: rawScore, matchedTerms };
}
