// Feature: ai-career-advisor-chatbot, Property 5: intent classification completeness

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { classify } from '../intentClassifier';
import type { Intent } from '../types';

const VALID_INTENTS: Intent[] = [
  'skill_gap_query',
  'interview_prep',
  'company_info',
  'placement_advice',
  'resume_help',
  'leetcode_guidance',
];

/**
 * **Validates: Requirements 2.1, 2.4**
 *
 * Property 5: Intent Classification Completeness
 * For any string input, `classify()` returns a valid `Intent` and
 * `confidence` in [0.0, 1.0].
 */
describe('intentClassifier — Property 5: Intent Classification Completeness', () => {
  it('classify() always returns a valid Intent and confidence in [0.0, 1.0]', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = classify(input);

        // Intent must be one of the 6 valid values
        const isValidIntent = VALID_INTENTS.includes(result.intent);

        // Confidence must be in [0.0, 1.0]
        const isValidConfidence =
          typeof result.confidence === 'number' &&
          isFinite(result.confidence) &&
          result.confidence >= 0.0 &&
          result.confidence <= 1.0;

        return isValidIntent && isValidConfidence;
      })
    );
  });
});
