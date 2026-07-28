// Feature: ai-career-advisor-chatbot, Property 16: prompt structure completeness

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { build, estimateTokens, TONE_STRESSED, TONE_CONFIDENT, TONE_NEUTRAL } from '../promptBuilder';
import { RECOMMENDED_PROBLEMS } from '@/data/leetcodeProblems';
import type {
  PromptInput,
  StudentUser,
  RAGResult,
  IntentResult,
  SentimentResult,
  PersonalizationResult,
  ContextSnapshot,
  Intent,
  SentimentLabel,
} from '../types';

// ─── Shared arbitraries ───────────────────────────────────────────────────────

const studentArb = fc.record({
  uid: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  email: fc.string({ minLength: 1 }),
  role: fc.constant('student' as const),
  sapId: fc.string({ minLength: 1 }),
  rollNo: fc.string({ minLength: 1 }),
  branch: fc.string({ minLength: 1 }),
  currentYear: fc.integer({ min: 1, max: 4 }),
  onboardingStep: fc.integer({ min: 0, max: 5 }),
  careerTrack: fc.constantFrom('Software Engineer', 'Data Scientist', 'Backend Engineer'),
  cgpa: fc.constantFrom('7.5', '8.0', '9.0'),
  placementStatus: fc.constantFrom('not_placed', 'placed'),
  skills: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
  goals: fc.array(fc.string({ minLength: 1 }), { maxLength: 3 }),
  projects: fc.array(fc.record({ id: fc.string(), title: fc.string(), description: fc.string() }), { maxLength: 3 }),
  internships: fc.array(fc.record({ id: fc.string(), company: fc.string(), role: fc.string(), period: fc.string(), description: fc.string() }), { maxLength: 2 }),
  leetcodeStats: fc.record({ totalSolved: fc.integer({ min: 0, max: 500 }) }),
}) as fc.Arbitrary<StudentUser>;

const ragResultArb: fc.Arbitrary<RAGResult> = fc.record({
  chunks: fc.constant([]),
  queryVector: fc.constant(new Map<string, number>()),
});

const intentArb: fc.Arbitrary<IntentResult> = fc.record({
  intent: fc.constantFrom<Intent>(
    'skill_gap_query', 'interview_prep', 'company_info',
    'placement_advice', 'resume_help', 'leetcode_guidance'
  ),
  confidence: fc.float({ min: 0, max: 1, noNaN: true }),
  matchedKeywords: fc.array(fc.string()),
});

const sentimentArb: fc.Arbitrary<SentimentResult> = fc.record({
  label: fc.constantFrom<SentimentLabel>('stressed', 'neutral', 'confident'),
  score: fc.float({ noNaN: true }),
  matchedTerms: fc.array(fc.string()),
});

const personalizationArb: fc.Arbitrary<PersonalizationResult> = fc.record({
  rankedChunks: fc.constant([]),
  readinessScore: fc.integer({ min: 0, max: 100 }),
  suggestedPrompts: fc.array(fc.string(), { minLength: 4, maxLength: 4 }),
});

const contextArb: fc.Arbitrary<ContextSnapshot> = fc.record({
  turns: fc.constant([]),
  entities: fc.record({
    companies: fc.constant([]),
    roles: fc.constant([]),
    skills: fc.constant([]),
  }),
});

const promptInputArb: fc.Arbitrary<PromptInput> = fc.record({
  student: studentArb,
  ragResult: ragResultArb,
  intent: intentArb,
  sentiment: sentimentArb,
  personalization: personalizationArb,
  context: contextArb,
  userMessage: fc.string({ minLength: 1 }),
});

// ─── Property 16: Prompt Structure Completeness ───────────────────────────────

/**
 * **Validates: Requirements 6.1**
 *
 * Property 16: Prompt Structure Completeness
 * For any valid PromptInput, the built prompt contains all 8 structural sections.
 */
describe('promptBuilder — Property 16: Prompt Structure Completeness', () => {
  const SECTION_HEADERS = [
    '[PART 1 — SYSTEM PERSONA]',
    '[PART 2 — TONE INSTRUCTION]',
    '[PART 3 — STUDENT PROFILE SUMMARY]',
    '[PART 4 — RETRIEVED CONTEXT',
    '[PART 5 — CLASSIFIED INTENT]',
    '[PART 6 — PERSONALIZATION RATIONALE]',
    '[PART 7 — CONVERSATION HISTORY]',
    '[PART 8 — CURRENT QUESTION]',
  ];

  it('built prompt contains all 8 structural section headers for any valid PromptInput', () => {
    fc.assert(
      fc.property(promptInputArb, (input) => {
        const prompt = build(input);
        return SECTION_HEADERS.every((header) => prompt.includes(header));
      })
    );
  });
});

// ─── Property 17: Token Limit Enforcement ────────────────────────────────────

// Feature: ai-career-advisor-chatbot, Property 17: token limit enforcement

/**
 * **Validates: Requirements 6.5**
 *
 * Property 17: Token Limit Enforcement
 * For any PromptInput with many long turns, the built prompt's estimated token
 * count is ≤ 8000.
 */
describe('promptBuilder — Property 17: Token Limit Enforcement', () => {
  it('estimated token count is ≤ 8000 even with many long conversation turns', () => {
    fc.assert(
      fc.property(
        promptInputArb,
        fc.array(fc.string({ minLength: 200 }), { minLength: 20 }),
        (baseInput, longContents) => {
          const turns = longContents.map((content, i) => ({
            role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
            content,
            timestamp: Date.now() + i,
          }));

          const input: PromptInput = {
            ...baseInput,
            context: {
              ...baseInput.context,
              turns,
            },
          };

          const prompt = build(input);
          return estimateTokens(prompt) <= 8000;
        }
      )
    );
  });
});

// ─── Property 11: Tone Instruction Injection ─────────────────────────────────

// Feature: ai-career-advisor-chatbot, Property 11: tone instruction injection

/**
 * **Validates: Requirements 4.3, 4.4, 4.5**
 *
 * Property 11: Tone Instruction Injection
 * For each SentimentLabel, the built prompt contains the corresponding tone
 * instruction string exported from promptBuilder.
 */
describe('promptBuilder — Property 11: Tone Instruction Injection', () => {
  const TONE_MAP: Record<SentimentLabel, string> = {
    stressed: TONE_STRESSED,
    confident: TONE_CONFIDENT,
    neutral: TONE_NEUTRAL,
  };

  it('built prompt contains the correct tone instruction for each SentimentLabel', () => {
    fc.assert(
      fc.property(
        promptInputArb,
        fc.constantFrom<SentimentLabel>('stressed', 'neutral', 'confident'),
        (baseInput, label) => {
          const input: PromptInput = {
            ...baseInput,
            sentiment: { ...baseInput.sentiment, label },
          };

          const prompt = build(input);
          return prompt.includes(TONE_MAP[label]);
        }
      )
    );
  });
});

// ─── Property 18: LeetCode Intent Context Injection ──────────────────────────

// Feature: ai-career-advisor-chatbot, Property 18: LeetCode intent context injection

/**
 * **Validates: Requirements 6.6**
 *
 * Property 18: LeetCode Intent Context Injection
 * When intent === 'leetcode_guidance', the built prompt contains problem entries
 * filtered to level <= student.currentYear.
 */
describe('promptBuilder — Property 18: LeetCode Intent Context Injection', () => {
  it('prompt includes only problems with level <= currentYear when intent is leetcode_guidance', () => {
    fc.assert(
      fc.property(
        promptInputArb,
        fc.integer({ min: 1, max: 4 }),
        (baseInput, currentYear) => {
          const input: PromptInput = {
            ...baseInput,
            student: { ...baseInput.student, currentYear },
            intent: { ...baseInput.intent, intent: 'leetcode_guidance' },
          };

          const prompt = build(input);

          const expectedProblems = RECOMMENDED_PROBLEMS.filter((p) => p.level <= currentYear);
          const excludedProblems = RECOMMENDED_PROBLEMS.filter((p) => p.level > currentYear);

          // All expected problems must appear in the prompt
          const allIncluded = expectedProblems.every((p) => prompt.includes(p.title));

          // No excluded problems should appear in the leetcode block
          const noneExcluded = excludedProblems.every((p) => {
            // A problem title might coincidentally appear in other parts (e.g. student name),
            // so we check specifically within the leetcode block section.
            const leetcodeBlockStart = prompt.indexOf('[LEETCODE PROBLEMS');
            if (leetcodeBlockStart === -1) {
              // If there are no expected problems, the block won't be injected
              return expectedProblems.length === 0;
            }
            const leetcodeBlock = prompt.slice(leetcodeBlockStart);
            return !leetcodeBlock.includes(p.title);
          });

          return allIncluded && noneExcluded;
        }
      )
    );
  });

  it('leetcode block is absent when intent is not leetcode_guidance', () => {
    fc.assert(
      fc.property(
        promptInputArb,
        fc.constantFrom<Intent>(
          'skill_gap_query', 'interview_prep', 'company_info',
          'placement_advice', 'resume_help'
        ),
        (baseInput, nonLeetcodeIntent) => {
          const input: PromptInput = {
            ...baseInput,
            intent: { ...baseInput.intent, intent: nonLeetcodeIntent },
          };

          const prompt = build(input);
          return !prompt.includes('[LEETCODE PROBLEMS');
        }
      )
    );
  });
});
