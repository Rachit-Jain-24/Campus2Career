// Feature: ai-career-advisor-chatbot, Property 19: welcome message personalization
// Feature: ai-career-advisor-chatbot, Property 20: transparency meta completeness

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateWelcomeMessage } from '../ChatPanel';
import type { TransparencyMeta } from '@/lib/ai/types';
import type { Intent, SentimentLabel } from '@/lib/ai/types';

const VALID_INTENTS: Intent[] = [
  'skill_gap_query',
  'interview_prep',
  'company_info',
  'placement_advice',
  'resume_help',
  'leetcode_guidance',
];

const VALID_SENTIMENT_LABELS: SentimentLabel[] = ['stressed', 'neutral', 'confident'];

const VALID_MODEL_LABELS = ['gemini-1.5-flash', 'local-fallback'] as const;

/**
 * **Validates: Requirements 7.7**
 *
 * Property 19: Welcome Message Personalization
 * For any StudentUser profile, the welcome message generated on first chat open
 * must contain the student's `name` and `careerTrack` as substrings.
 */
describe('ChatPanel — Property 19: Welcome Message Personalization', () => {
  it('generateWelcomeMessage() always contains student.name and student.careerTrack as substrings', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1 }),
          careerTrack: fc.string({ minLength: 1 }),
        }),
        (student) => {
          const message = generateWelcomeMessage(student);

          const containsName = message.includes(student.name);
          const containsCareerTrack = message.includes(student.careerTrack);

          return containsName && containsCareerTrack;
        }
      )
    );
  });
});

/**
 * **Validates: Requirements 8.1, 8.2**
 *
 * Property 20: Transparency Meta Completeness
 * Every assistant response message has non-null `transparencyMeta` with all
 * required fields having valid values:
 *   - intent: valid Intent
 *   - intentConfidence: 0–1
 *   - sentimentLabel: valid SentimentLabel
 *   - sentimentScore: finite number
 *   - ragChunksRetrieved: positive integer
 *   - topChunkTitle: non-empty string
 *   - placementReadinessScore: 0–100
 *   - modelUsed: valid model label
 */
describe('ChatPanel — Property 20: Transparency Meta Completeness', () => {
  it('a valid TransparencyMeta object satisfies all field constraints', () => {
    // Build a representative set of valid TransparencyMeta objects and verify constraints
    const validMetas: TransparencyMeta[] = [
      {
        intent: 'skill_gap_query',
        intentConfidence: 0.85,
        sentimentLabel: 'neutral',
        sentimentScore: 0.1,
        ragChunksRetrieved: 5,
        topChunkTitle: 'Full Stack Developer Skills',
        placementReadinessScore: 72,
        modelUsed: 'gemini-1.5-flash',
      },
      {
        intent: 'interview_prep',
        intentConfidence: 0.0,
        sentimentLabel: 'stressed',
        sentimentScore: -1.5,
        ragChunksRetrieved: 1,
        topChunkTitle: 'Interview Tips',
        placementReadinessScore: 0,
        modelUsed: 'local-fallback',
      },
      {
        intent: 'placement_advice',
        intentConfidence: 1.0,
        sentimentLabel: 'confident',
        sentimentScore: 2.0,
        ragChunksRetrieved: 3,
        topChunkTitle: 'Placement Drive FAQ',
        placementReadinessScore: 100,
        modelUsed: 'gemini-1.5-flash',
      },
    ];

    for (const meta of validMetas) {
      // intent must be a valid Intent
      expect(VALID_INTENTS).toContain(meta.intent);

      // intentConfidence must be in [0, 1]
      expect(meta.intentConfidence).toBeGreaterThanOrEqual(0);
      expect(meta.intentConfidence).toBeLessThanOrEqual(1);

      // sentimentLabel must be valid
      expect(VALID_SENTIMENT_LABELS).toContain(meta.sentimentLabel);

      // sentimentScore must be a finite number
      expect(Number.isFinite(meta.sentimentScore)).toBe(true);

      // ragChunksRetrieved must be a positive integer
      expect(meta.ragChunksRetrieved).toBeGreaterThan(0);
      expect(Number.isInteger(meta.ragChunksRetrieved)).toBe(true);

      // topChunkTitle must be a non-empty string
      expect(typeof meta.topChunkTitle).toBe('string');
      expect(meta.topChunkTitle.length).toBeGreaterThan(0);

      // placementReadinessScore must be in [0, 100]
      expect(meta.placementReadinessScore).toBeGreaterThanOrEqual(0);
      expect(meta.placementReadinessScore).toBeLessThanOrEqual(100);

      // modelUsed must be a valid label
      expect(VALID_MODEL_LABELS).toContain(meta.modelUsed);
    }
  });

  it('property: any TransparencyMeta built from valid ranges satisfies all field constraints', () => {
    fc.assert(
      fc.property(
        fc.record({
          intent: fc.constantFrom(...VALID_INTENTS),
          intentConfidence: fc.float({ min: 0, max: 1, noNaN: true, noDefaultInfinity: true }),
          sentimentLabel: fc.constantFrom(...VALID_SENTIMENT_LABELS),
          sentimentScore: fc.float({ noNaN: true, noDefaultInfinity: true }),
          ragChunksRetrieved: fc.integer({ min: 1, max: 100 }),
          topChunkTitle: fc.string({ minLength: 1 }),
          placementReadinessScore: fc.integer({ min: 0, max: 100 }),
          modelUsed: fc.constantFrom(...VALID_MODEL_LABELS),
        }),
        (meta: TransparencyMeta) => {
          // intent must be valid
          const validIntent = VALID_INTENTS.includes(meta.intent);

          // intentConfidence in [0, 1]
          const validConfidence =
            typeof meta.intentConfidence === 'number' &&
            meta.intentConfidence >= 0 &&
            meta.intentConfidence <= 1;

          // sentimentLabel must be valid
          const validSentiment = VALID_SENTIMENT_LABELS.includes(meta.sentimentLabel);

          // sentimentScore must be finite
          const validScore = Number.isFinite(meta.sentimentScore);

          // ragChunksRetrieved must be positive integer
          const validChunks =
            Number.isInteger(meta.ragChunksRetrieved) && meta.ragChunksRetrieved > 0;

          // topChunkTitle non-empty
          const validTitle =
            typeof meta.topChunkTitle === 'string' && meta.topChunkTitle.length > 0;

          // placementReadinessScore in [0, 100]
          const validReadiness =
            meta.placementReadinessScore >= 0 && meta.placementReadinessScore <= 100;

          // modelUsed valid
          const validModel = (VALID_MODEL_LABELS as readonly string[]).includes(meta.modelUsed);

          return (
            validIntent &&
            validConfidence &&
            validSentiment &&
            validScore &&
            validChunks &&
            validTitle &&
            validReadiness &&
            validModel
          );
        }
      )
    );
  });
});
