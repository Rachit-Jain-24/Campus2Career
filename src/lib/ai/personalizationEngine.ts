import { industryBenchmarks } from '@/data/industryBenchmarks';
import { analyzeSkillGap } from '@/lib/skillGapAnalysis';
import type {
  KnowledgeChunk,
  RAGResult,
  Intent,
  RankedChunk,
  PersonalizationResult,
  StudentUser,
} from './types';

// Foundational skills that get a boost for year 1–2 students
const FOUNDATIONAL_SKILLS = new Set([
  'react', 'python', 'java', 'c++', 'javascript', 'typescript',
  'html', 'css', 'sql', 'git', 'node.js', 'data structures', 'algorithms',
  'object oriented programming', 'oop', 'c', 'c#', 'ruby', 'go',
]);

/**
 * Compute cosine similarity between query vector and chunk vector.
 * Both vectors are already L2-normalized, so this is just a dot product.
 */
function cosineScore(queryVector: Map<string, number>, chunkVector: Map<string, number>): number {
  let score = 0;
  for (const [term, weight] of queryVector) {
    const chunkWeight = chunkVector.get(term);
    if (chunkWeight !== undefined) {
      score += weight * chunkWeight;
    }
  }
  return score;
}

/**
 * Safely convert any value to lowercase string, returning '' for non-strings.
 */
function safeToLower(val: unknown): string {
  return typeof val === 'string' ? val.toLowerCase() : '';
}

/**
 * Build the set of career-track skills for a student:
 * union of student.skills, student.techSkills, and required skills of their careerTrack benchmark.
 */
function buildStudentCareerTrackSkills(student: StudentUser): Set<string> {
  const skillSet = new Set<string>();

  // Add student's own skills — guard against non-array and non-string values
  const rawSkills: unknown[] = Array.isArray(student.skills) ? student.skills : [];
  const rawTechSkills: unknown[] = Array.isArray(student.techSkills) ? student.techSkills : [];

  for (const s of rawSkills) {
    const lower = safeToLower(s);
    if (lower.length > 0) skillSet.add(lower);
  }
  for (const s of rawTechSkills) {
    const lower = safeToLower(s);
    if (lower.length > 0) skillSet.add(lower);
  }

  // Add required skills from the career track benchmark
  if (student.careerTrack && typeof student.careerTrack === 'string') {
    const benchmark = industryBenchmarks[student.careerTrack];
    if (benchmark) {
      for (const { skill } of benchmark.requiredSkills) {
        const lower = safeToLower(skill);
        if (lower.length > 0) skillSet.add(lower);
      }
    }
  }

  return skillSet;
}

/**
 * Profile relevance: fraction of chunk tags that overlap with the student's career-track skills.
 * profileRelevance = tagOverlap / max(chunk.tags.length, 1)
 */
function profileRelevance(chunk: KnowledgeChunk, studentSkills: Set<string>): number {
  if (chunk.tags.length === 0) return 0;
  let overlap = 0;
  for (const tag of chunk.tags) {
    const lower = safeToLower(tag);
    if (lower.length > 0 && studentSkills.has(lower)) {
      overlap++;
    }
  }
  return overlap / Math.max(chunk.tags.length, 1);
}

/**
 * Determine if a chunk is a "foundational skill" chunk:
 * source === 'industry_benchmark' and tags include at least one foundational skill.
 */
function isFoundationalChunk(chunk: KnowledgeChunk): boolean {
  if (chunk.source !== 'industry_benchmark') return false;
  return chunk.tags.some(tag => {
    const lower = safeToLower(tag);
    return lower.length > 0 && FOUNDATIONAL_SKILLS.has(lower);
  });
}

/**
 * Determine if a chunk is a "placement FAQ" chunk:
 * source === 'faq' and tags include 'placement' or 'eligibility'.
 */
function isPlacementFAQChunk(chunk: KnowledgeChunk): boolean {
  if (chunk.source !== 'faq') return false;
  return chunk.tags.some(tag => {
    const t = safeToLower(tag);
    return t === 'placement' || t === 'eligibility';
  });
}

/**
 * Determine if a chunk is an "internship or system design" chunk.
 */
function isInternshipOrSystemDesignChunk(chunk: KnowledgeChunk): boolean {
  return chunk.tags.some(tag => {
    const t = safeToLower(tag);
    return t === 'internship' || t === 'system design';
  });
}

/**
 * Determine if a chunk should be filtered out for a placed student.
 */
function isPlacementDriveOrEligibilityChunk(chunk: KnowledgeChunk): boolean {
  return chunk.tags.some(tag => {
    const t = safeToLower(tag);
    return t === 'placement_drive' || t === 'eligibility';
  });
}

/**
 * Rank RAG chunks using combined scoring and year-aware boosts.
 *
 * combinedScore = 0.6 × cosineScore + 0.4 × profileRelevance
 * Year 1–2: foundational chunks +0.15, placement FAQ chunks -0.2
 * Year 3–4: internship/system design chunks +0.15
 * Placed students: filter out placement_drive / eligibility chunks
 */
export function rank(
  ragResult: RAGResult,
  student: StudentUser,
  _intent: Intent
): PersonalizationResult {
  const studentSkills = buildStudentCareerTrackSkills(student);
  const year = student.currentYear ?? 1;
  const isPlaced = student.placementStatus === 'placed';

  const rankedChunks: RankedChunk[] = [];

  for (const chunk of ragResult.chunks) {
    // Filter placed-student chunks
    if (isPlaced && isPlacementDriveOrEligibilityChunk(chunk)) {
      continue;
    }

    const cosine = cosineScore(ragResult.queryVector, chunk.tfidfVector);
    const profile = profileRelevance(chunk, studentSkills);

    let combined = 0.6 * cosine + 0.4 * profile;

    // Year-based boosts
    if (year <= 2) {
      if (isFoundationalChunk(chunk)) {
        combined += 0.15;
      }
      if (isPlacementFAQChunk(chunk)) {
        combined -= 0.2;
      }
    } else if (year >= 3) {
      if (isInternshipOrSystemDesignChunk(chunk)) {
        combined += 0.15;
      }
    }

    rankedChunks.push({
      chunk,
      combinedScore: combined,
      cosineScore: cosine,
      profileScore: profile,
    });
  }

  // Sort descending by combined score
  rankedChunks.sort((a, b) => b.combinedScore - a.combinedScore);

  // Compute readiness score via analyzeSkillGap
  // Guard: skills must be string[], cgpa may be stored as string in Firestore
  const safeSkills = (Array.isArray(student.skills) ? student.skills : [])
    .filter((s): s is string => typeof s === 'string');
  const safeCgpa = typeof student.cgpa === 'number'
    ? student.cgpa
    : parseFloat(String(student.cgpa ?? '0')) || 0;
  const skillGapResult = analyzeSkillGap(
    safeSkills,
    student.careerTrack ?? '',
    student.leetcodeStats?.totalSolved ?? 0,
    student.projects?.length ?? 0,
    student.internships?.length ?? 0,
    safeCgpa
  );
  const readinessScore = skillGapResult.overallReadiness;

  // Generate exactly 4 suggested prompts
  const suggestedPrompts = generateSuggestedPrompts(student, _intent);

  return {
    rankedChunks,
    readinessScore,
    suggestedPrompts,
  };
}

/**
 * Generate exactly 4 contextual suggested prompts based on student profile and intent.
 * When currentYear === 4 and placementStatus !== 'placed', at least one prompt must
 * contain a placement-readiness keyword: "placement", "ready", "drive", "eligible", or "assessment".
 */
function generateSuggestedPrompts(student: StudentUser, intent: Intent): string[] {
  const year = student.currentYear ?? 1;
  const isPlaced = student.placementStatus === 'placed';
  const isYear4Unplaced = year === 4 && !isPlaced;

  const prompts: string[] = [];

  if (isPlaced) {
    // Placed students get post-placement prompts
    prompts.push('How can I negotiate my offer?');
    prompts.push('What should I learn after placement?');
    prompts.push('How do I prepare for my first job?');
    prompts.push('What are growth opportunities in my role?');
    return prompts;
  }

  // Intent-specific prompt first
  const intentPrompt = getIntentPrompt(intent, year);
  prompts.push(intentPrompt);

  if (isYear4Unplaced) {
    // Must include at least one placement-readiness prompt
    prompts.push('Am I ready for campus placements?');
    prompts.push('How do I prepare for placement interviews?');
    prompts.push('What companies should I target for placement drive?');
  } else if (year >= 3) {
    // Year 3–4 (placed or not yet year 4 unplaced)
    const year34Prompts = [
      'How do I prepare for placement interviews?',
      'What companies should I target?',
      'How can I improve my resume?',
      'Am I ready for campus placements?',
    ].filter(p => p !== intentPrompt);
    prompts.push(...year34Prompts.slice(0, 3));
  } else {
    // Year 1–2
    const year12Prompts = [
      'What skills should I learn for my career track?',
      'How can I build better projects?',
      'What DSA topics should I focus on?',
      'How do I get my first internship?',
    ].filter(p => p !== intentPrompt);
    prompts.push(...year12Prompts.slice(0, 3));
  }

  // Ensure exactly 4 prompts (trim or pad if needed)
  return prompts.slice(0, 4);
}

/**
 * Return an intent-specific prompt appropriate for the student's year.
 */
function getIntentPrompt(intent: Intent, year: number): string {
  switch (intent) {
    case 'skill_gap_query':
      return 'What skills should I learn for my career track?';
    case 'interview_prep':
      return year >= 3
        ? 'How do I prepare for placement interviews?'
        : 'What DSA topics should I focus on?';
    case 'company_info':
      return 'What companies should I target?';
    case 'placement_advice':
      return year >= 3
        ? 'Am I ready for campus placements?'
        : 'How do I get my first internship?';
    case 'resume_help':
      return 'How can I improve my resume?';
    case 'leetcode_guidance':
      return 'What DSA topics should I focus on?';
    default:
      return year >= 3
        ? 'How do I prepare for placement interviews?'
        : 'What skills should I learn for my career track?';
  }
}

export default rank;
