// Feature: ai-career-advisor-chatbot, Property 10: sentiment label validity

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { analyze } from '../sentimentAnalyzer';
import type { SentimentLabel } from '../types';

const VALID_LABELS: SentimentLabel[] = ['stressed', 'neutral', 'confident'];

/**
 * **Validates: Requirements 4.2**
 *
 * Property 10: Sentiment Label Validity
 * For any string input, `analyze()` returns a valid `SentimentLabel` and
 * a finite `score`.
 */
describe('sentimentAnalyzer — Property 10: Sentiment Label Validity', () => {
  it('analyze() always returns a valid SentimentLabel and a finite score', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const result = analyze(input);

        // label must be one of the 3 valid SentimentLabel values
        const isValidLabel = VALID_LABELS.includes(result.label);

        // score must be a finite number
        const isFiniteScore =
          typeof result.score === 'number' && Number.isFinite(result.score);

        return isValidLabel && isFiniteScore;
      })
    );
  });
});
