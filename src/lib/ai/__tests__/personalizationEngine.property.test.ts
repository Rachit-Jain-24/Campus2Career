// Feature: ai-career-advisor-chatbot, Property 13: combined scoring formula invariant

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { rank } from '../personalizationEngine';
import type { RAGResult, KnowledgeChunk, StudentUser, Intent } from '../types';

/**
 * **Validates: Requirements 5.2**
 *
 * Property 13: Combined Scoring Formula Invariant
 * For any set of RAG chunks and student profile, each RankedChunk must satisfy:
 * |combinedScore - (0.6 × cosineScore + 0.4 × profileScore)| < 0.001
 *
 * We use source 'leetcode' chunks to avoid year-based boosts (+0.15 / -0.2),
 * which are applied on top of the base formula. This lets us verify the base
 * formula holds exactly (within floating-point tolerance).
 */
describe('personalizationEngine — Property 13: Combined Scoring Formula Invariant', () => {
  // Arbitrary for a single TF-IDF weight entry
  const termWeightArb = fc.tuple(
    fc.string({ minLength: 3, maxLength: 10 }),
    fc.float({ min: Math.fround(0.01), max: Math.fround(1.0), noNaN: true })
  );

  // Arbitrary for a KnowledgeChunk with source 'leetcode' (no year boosts)
  const chunkArb = fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1 }),
    content: fc.string({ minLength: 1 }),
    source: fc.constant('leetcode' as const),
    tags: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 5 }),
    tfidfVector: fc.array(termWeightArb, { minLength: 1, maxLength: 10 }).map(
      (pairs) => new Map(pairs)
    ),
  });

  // Arbitrary for a query vector (simulates the RAG engine's normalized query)
  const queryVectorArb = fc.array(termWeightArb, { minLength: 1, maxLength: 10 }).map(
    (pairs) => new Map(pairs)
  );

  // Arbitrary for a StudentUser (minimal fields needed by personalizationEngine)
  const studentArb = fc.record({
    uid: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    email: fc.string({ minLength: 1 }),
    role: fc.constant('student' as const),
    currentYear: fc.integer({ min: 1, max: 4 }),
    skills: fc.array(fc.string()),
    careerTrack: fc.constantFrom(
      'Software Engineer',
      'Data Scientist',
      'Backend Engineer'
    ),
    placementStatus: fc.constantFrom('not_placed', 'placed'),
  }) as fc.Arbitrary<StudentUser>;

  const intentArb = fc.constantFrom<Intent>(
    'skill_gap_query',
    'interview_prep',
    'company_info',
    'placement_advice',
    'resume_help',
    'leetcode_guidance'
  );

  it('each RankedChunk satisfies |combinedScore - (0.6*cosine + 0.4*profile)| < 0.001', () => {
    fc.assert(
      fc.property(
        fc.array(chunkArb, { minLength: 1, maxLength: 10 }),
        queryVectorArb,
        studentArb,
        intentArb,
        (chunks: KnowledgeChunk[], queryVector, student, intent) => {
          const ragResult: RAGResult = { chunks, queryVector };
          const result = rank(ragResult, student, intent);

          for (const rc of result.rankedChunks) {
            const expected = 0.6 * rc.cosineScore + 0.4 * rc.profileScore;
            const diff = Math.abs(rc.combinedScore - expected);
            if (diff >= 0.001) {
              return false;
            }
          }
          return true;
        }
      )
    );
  });
});

// Feature: ai-career-advisor-chatbot, Property 14: year-aware chunk ranking

/**
 * **Validates: Requirements 5.3, 5.4**
 *
 * Property 14: Year-Aware Chunk Ranking
 *
 * Year 1–2: foundational chunks (source='industry_benchmark', tags=['react'])
 *   rank higher than placement FAQ chunks (source='faq', tags=['placement']).
 *   Foundational gets +0.15 boost; placement FAQ gets -0.2 penalty.
 *
 * Year 3–4: internship/system design chunks (tags=['internship'])
 *   rank higher than foundational chunks (source='industry_benchmark', tags=['react']).
 *   Internship gets +0.15 boost; foundational gets no boost for year 3–4.
 *
 * Strategy: both chunks have IDENTICAL cosine scores (same tfidfVector, same queryVector)
 * and identical profileRelevance (student has no skills matching either chunk's tags).
 * The only difference in combinedScore comes from year-based boosts.
 */
describe('personalizationEngine — Property 14: Year-Aware Chunk Ranking', () => {
  // A fixed tfidf vector shared by both chunks → identical cosine scores
  const sharedTfidfVector = new Map([['term', 0.5]]);
  const sharedQueryVector = new Map([['term', 0.5]]);

  // Student with no skills → profileRelevance = 0 for all chunks
  const baseStudent = {
    uid: 'test-uid',
    name: 'Test Student',
    email: 'test@example.com',
    role: 'student' as const,
    skills: [] as string[],
    techSkills: [] as string[],
    careerTrack: 'Software Engineer',
    placementStatus: 'not_placed',
  };

  const intent: Intent = 'placement_advice';

  it('year 1–2: foundational chunk ranks above placement FAQ chunk', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 2 }),
        (year) => {
          const foundationalChunk: KnowledgeChunk = {
            id: 'foundational-1',
            title: 'React Fundamentals',
            content: 'Learn React basics',
            source: 'industry_benchmark',
            tags: ['react'],
            tfidfVector: sharedTfidfVector,
          };

          const placementFAQChunk: KnowledgeChunk = {
            id: 'faq-placement-1',
            title: 'Placement FAQ',
            content: 'Placement process info',
            source: 'faq',
            tags: ['placement'],
            tfidfVector: sharedTfidfVector,
          };

          const student = { ...baseStudent, currentYear: year } as StudentUser;
          const ragResult: RAGResult = {
            chunks: [placementFAQChunk, foundationalChunk],
            queryVector: sharedQueryVector,
          };

          const result = rank(ragResult, student, intent);

          const foundationalRanked = result.rankedChunks.find(rc => rc.chunk.id === 'foundational-1');
          const faqRanked = result.rankedChunks.find(rc => rc.chunk.id === 'faq-placement-1');

          if (!foundationalRanked || !faqRanked) return false;

          // Foundational (+0.15) should beat placement FAQ (-0.2)
          return foundationalRanked.combinedScore > faqRanked.combinedScore;
        }
      )
    );
  });

  it('year 3–4: internship chunk ranks above foundational chunk', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 3, max: 4 }),
        (year) => {
          const internshipChunk: KnowledgeChunk = {
            id: 'internship-1',
            title: 'Internship Preparation',
            content: 'How to get internships',
            source: 'faq',
            tags: ['internship'],
            tfidfVector: sharedTfidfVector,
          };

          const foundationalChunk: KnowledgeChunk = {
            id: 'foundational-2',
            title: 'React Fundamentals',
            content: 'Learn React basics',
            source: 'industry_benchmark',
            tags: ['react'],
            tfidfVector: sharedTfidfVector,
          };

          const student = { ...baseStudent, currentYear: year } as StudentUser;
          const ragResult: RAGResult = {
            chunks: [foundationalChunk, internshipChunk],
            queryVector: sharedQueryVector,
          };

          const result = rank(ragResult, student, intent);

          const internshipRanked = result.rankedChunks.find(rc => rc.chunk.id === 'internship-1');
          const foundationalRanked = result.rankedChunks.find(rc => rc.chunk.id === 'foundational-2');

          if (!internshipRanked || !foundationalRanked) return false;

          // Internship (+0.15) should beat foundational (no boost for year 3–4)
          return internshipRanked.combinedScore > foundationalRanked.combinedScore;
        }
      )
    );
  });
});

// Feature: ai-career-advisor-chatbot, Property 15: placed student filtering

/**
 * **Validates: Requirements 5.5**
 *
 * Property 15: Placed Student Filtering
 * For any student with `placementStatus === 'placed'`, no chunk tagged
 * `placement_drive` or `eligibility` appears in `rankedChunks`.
 */
describe('personalizationEngine — Property 15: Placed Student Filtering', () => {
  const sharedTfidfVector = new Map([['term', 0.5]]);
  const sharedQueryVector = new Map([['term', 0.5]]);

  // Arbitrary for a KnowledgeChunk with random tags (no forbidden tags)
  const neutralChunkArb = fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1 }),
    content: fc.string({ minLength: 1 }),
    source: fc.constantFrom('leetcode', 'faq', 'industry_benchmark', 'student_profile') as fc.Arbitrary<KnowledgeChunk['source']>,
    tags: fc.array(
      fc.string({ minLength: 1 }).filter(t => t !== 'placement_drive' && t !== 'eligibility'),
      { minLength: 0, maxLength: 4 }
    ),
    tfidfVector: fc.constant(sharedTfidfVector),
  });

  // Arbitrary for a placed StudentUser
  const placedStudentArb = fc.record({
    uid: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    email: fc.string({ minLength: 1 }),
    role: fc.constant('student' as const),
    currentYear: fc.integer({ min: 1, max: 4 }),
    skills: fc.array(fc.string()),
    careerTrack: fc.constantFrom('Software Engineer', 'Data Scientist', 'Backend Engineer'),
    placementStatus: fc.constant('placed' as const),
  }) as fc.Arbitrary<StudentUser>;

  const intentArb = fc.constantFrom<Intent>(
    'skill_gap_query',
    'interview_prep',
    'company_info',
    'placement_advice',
    'resume_help',
    'leetcode_guidance'
  );

  it('no placement_drive or eligibility chunk appears in rankedChunks for placed students', () => {
    fc.assert(
      fc.property(
        fc.array(neutralChunkArb, { minLength: 0, maxLength: 8 }),
        placedStudentArb,
        intentArb,
        (neutralChunks: KnowledgeChunk[], student, intent) => {
          // Inject forbidden chunks to ensure the filter is exercised
          const forbiddenChunks: KnowledgeChunk[] = [
            {
              id: 'forbidden-placement-drive',
              title: 'Placement Drive Info',
              content: 'Upcoming placement drives',
              source: 'faq',
              tags: ['placement_drive'],
              tfidfVector: sharedTfidfVector,
            },
            {
              id: 'forbidden-eligibility',
              title: 'Eligibility Criteria',
              content: 'CGPA and backlog requirements',
              source: 'faq',
              tags: ['eligibility'],
              tfidfVector: sharedTfidfVector,
            },
            {
              id: 'forbidden-both-tags',
              title: 'Drive Eligibility',
              content: 'Who can apply to placement drives',
              source: 'faq',
              tags: ['placement_drive', 'eligibility', 'other'],
              tfidfVector: sharedTfidfVector,
            },
          ];

          const allChunks = [...neutralChunks, ...forbiddenChunks];
          const ragResult: RAGResult = { chunks: allChunks, queryVector: sharedQueryVector };
          const result = rank(ragResult, student, intent);

          // No ranked chunk should have a forbidden tag
          for (const rc of result.rankedChunks) {
            for (const tag of rc.chunk.tags) {
              const t = tag.toLowerCase();
              if (t === 'placement_drive' || t === 'eligibility') {
                return false;
              }
            }
          }
          return true;
        }
      )
    );
  });
});

// Feature: ai-career-advisor-chatbot, Property 12: readiness score range

/**
 * **Validates: Requirements 5.1**
 *
 * Property 12: Readiness Score Range
 * For any valid `StudentUser` profile, `rank()` returns `readinessScore` in [0, 100].
 */
describe('personalizationEngine — Property 12: Readiness Score Range', () => {
  const emptyQueryVector = new Map<string, number>();

  const studentArb = fc.record({
    uid: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    email: fc.string({ minLength: 1 }),
    role: fc.constant('student' as const),
    currentYear: fc.integer({ min: 1, max: 4 }),
    skills: fc.array(fc.string()),
    careerTrack: fc.constantFrom(
      'Software Engineer',
      'Data Scientist',
      'Backend Engineer',
      'Full Stack Developer',
      'DevOps Engineer',
      'ML Engineer'
    ),
    placementStatus: fc.constantFrom('not_placed', 'placed'),
    cgpa: fc.float({ min: 0, max: 10, noNaN: true }),
    leetcodeStats: fc.record({ totalSolved: fc.integer({ min: 0, max: 500 }) }),
    projects: fc.array(fc.record({ title: fc.string() })),
    internships: fc.array(fc.record({ company: fc.string() })),
  }) as fc.Arbitrary<StudentUser>;

  it('readinessScore is in [0, 100] for any valid student profile', () => {
    fc.assert(
      fc.property(
        studentArb,
        (student) => {
          const ragResult: RAGResult = { chunks: [], queryVector: emptyQueryVector };
          const result = rank(ragResult, student, 'placement_advice');
          return result.readinessScore >= 0 && result.readinessScore <= 100;
        }
      )
    );
  });
});

// Feature: ai-career-advisor-chatbot, Property 21: suggested prompts count

/**
 * **Validates: Requirements 9.1**
 *
 * Property 21: Suggested Prompts Count
 * For any `StudentUser` profile, `rank()` returns exactly 4 strings in `suggestedPrompts`.
 */
describe('personalizationEngine — Property 21: Suggested Prompts Count', () => {
  const emptyQueryVector = new Map<string, number>();

  const studentArb = fc.record({
    uid: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    email: fc.string({ minLength: 1 }),
    role: fc.constant('student' as const),
    currentYear: fc.integer({ min: 1, max: 4 }),
    skills: fc.array(fc.string()),
    careerTrack: fc.constantFrom(
      'Software Engineer',
      'Data Scientist',
      'Backend Engineer',
      'Full Stack Developer',
      'DevOps Engineer',
      'ML Engineer'
    ),
    placementStatus: fc.constantFrom('not_placed', 'placed'),
    cgpa: fc.float({ min: 0, max: 10, noNaN: true }),
    leetcodeStats: fc.record({ totalSolved: fc.integer({ min: 0, max: 500 }) }),
    projects: fc.array(fc.record({ title: fc.string() })),
    internships: fc.array(fc.record({ company: fc.string() })),
  }) as fc.Arbitrary<StudentUser>;

  const intentArb = fc.constantFrom<Intent>(
    'skill_gap_query',
    'interview_prep',
    'company_info',
    'placement_advice',
    'resume_help',
    'leetcode_guidance'
  );

  it('suggestedPrompts has exactly 4 string elements for any student profile', () => {
    fc.assert(
      fc.property(
        studentArb,
        intentArb,
        (student, intent) => {
          const ragResult: RAGResult = { chunks: [], queryVector: emptyQueryVector };
          const result = rank(ragResult, student, intent);

          return (
            result.suggestedPrompts.length === 4 &&
            result.suggestedPrompts.every(p => typeof p === 'string')
          );
        }
      )
    );
  });
});

// Feature: ai-career-advisor-chatbot, Property 22: year-4 unplaced placement prompt

/**
 * **Validates: Requirements 9.4**
 *
 * Property 22: Year-4 Unplaced Placement Prompt
 * For any student with `currentYear === 4` and `placementStatus !== 'placed'`,
 * at least one of the 4 suggested prompts contains a placement-readiness keyword:
 * "placement", "ready", "drive", "eligible", or "assessment" (case-insensitive).
 */
describe('personalizationEngine — Property 22: Year-4 Unplaced Placement Prompt', () => {
  const PLACEMENT_READINESS_KEYWORDS = ['placement', 'ready', 'drive', 'eligible', 'assessment'];
  const emptyQueryVector = new Map<string, number>();

  const studentArb = fc.record({
    uid: fc.string({ minLength: 1 }),
    name: fc.string({ minLength: 1 }),
    email: fc.string({ minLength: 1 }),
    role: fc.constant('student' as const),
    currentYear: fc.constant(4),
    placementStatus: fc.string().filter(s => s !== 'placed'),
    skills: fc.array(fc.string()),
    careerTrack: fc.constantFrom(
      'Software Engineer',
      'Data Scientist',
      'Backend Engineer',
      'Full Stack Developer',
      'DevOps Engineer',
      'ML Engineer'
    ),
    cgpa: fc.float({ min: 0, max: 10, noNaN: true }),
    leetcodeStats: fc.record({ totalSolved: fc.integer({ min: 0, max: 500 }) }),
    projects: fc.array(fc.record({ title: fc.string() })),
    internships: fc.array(fc.record({ company: fc.string() })),
  }) as fc.Arbitrary<StudentUser>;

  const intentArb = fc.constantFrom<Intent>(
    'skill_gap_query',
    'interview_prep',
    'company_info',
    'placement_advice',
    'resume_help',
    'leetcode_guidance'
  );

  it('at least one suggestedPrompt contains a placement-readiness keyword for year-4 unplaced students', () => {
    fc.assert(
      fc.property(
        studentArb,
        intentArb,
        (student, intent) => {
          const ragResult: RAGResult = { chunks: [], queryVector: emptyQueryVector };
          const result = rank(ragResult, student, intent);

          return result.suggestedPrompts.some(prompt =>
            PLACEMENT_READINESS_KEYWORDS.some(keyword =>
              prompt.toLowerCase().includes(keyword)
            )
          );
        }
      )
    );
  });
});
