// Feature: ai-career-advisor-chatbot
import { RECOMMENDED_PROBLEMS } from '@/data/leetcodeProblems';
import type { PromptInput } from './types';

// Tone instruction constants (exported for use in tests)
export const TONE_STRESSED =
  "The student seems anxious. Lead with encouragement. Acknowledge their effort before listing gaps.";
export const TONE_CONFIDENT =
  "The student is confident. Be direct and ambitious. Suggest stretch goals.";
export const TONE_NEUTRAL =
  "Use a balanced, professional tone.";

const TONE_MAP: Record<string, string> = {
  stressed: TONE_STRESSED,
  confident: TONE_CONFIDENT,
  neutral: TONE_NEUTRAL,
};

/** Estimate token count: 1 token ≈ 4 characters */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Assemble the 8-part structured Gemini prompt */
export function build(input: PromptInput): string {
  const { student, ragResult, intent, sentiment, personalization, context, userMessage } = input;

  // Part 1 — System Persona
  const part1 = `[PART 1 — SYSTEM PERSONA]
You are an expert AI Career Advisor for Campus2Career, a placement management system.
Your role is to give personalized, actionable career guidance to engineering students.
Be specific, cite data from the student's profile, and always suggest concrete next steps.`;

  // Part 2 — Tone Instruction
  const toneInstruction = TONE_MAP[sentiment.label] ?? TONE_NEUTRAL;
  const part2 = `[PART 2 — TONE INSTRUCTION]
${toneInstruction}`;

  // Part 3 — Student Profile Summary
  const skills = (student.skills ?? []).join(', ');
  const goals = (student.goals ?? []).join(', ');
  const leetcodeSolved = student.leetcodeStats?.totalSolved ?? 0;
  const projectCount = student.projects?.length ?? 0;
  const internshipCount = student.internships?.length ?? 0;
  const part3 = `[PART 3 — STUDENT PROFILE SUMMARY]
Name: ${student.name} | Year: ${student.currentYear} | Branch: ${student.branch}
Career Track: ${student.careerTrack} | CGPA: ${student.cgpa} | Placement Status: ${student.placementStatus}
Skills: ${skills}
LeetCode Solved: ${leetcodeSolved}
Projects: ${projectCount} | Internships: ${internshipCount}
Goals: ${goals}`;

  // Part 4 — Retrieved Context (top 5 RAG chunks, content truncated to 300 chars each)
  const topChunks = ragResult.chunks.slice(0, 5);
  const contextBlocks = topChunks
    .map((chunk, i) => {
      const truncated = chunk.content.length > 300 ? chunk.content.slice(0, 300) + '...' : chunk.content;
      return `--- Context ${i + 1}: ${chunk.title} ---\n${truncated}`;
    })
    .join('\n\n');
  const part4 = `[PART 4 — RETRIEVED CONTEXT (top 5 RAG chunks)]
${contextBlocks}`;

  // Part 5 — Classified Intent
  const confidencePct = (intent.confidence * 100).toFixed(0);
  const part5 = `[PART 5 — CLASSIFIED INTENT]
The student's query intent is: ${intent.intent} (confidence: ${confidencePct}%)
Focus your answer on this intent category.`;

  // Part 6 — Personalization Rationale
  const topFocusAreas = personalization.rankedChunks
    .slice(0, 3)
    .map((rc) => rc.chunk.title)
    .join(', ');
  const part6 = `[PART 6 — PERSONALIZATION RATIONALE]
Placement Readiness Score: ${personalization.readinessScore}/100
Top advice focus areas: ${topFocusAreas}`;

  // Part 7 — Conversation History (mutable — oldest turns removed for token budget)
  let turns = [...context.turns];

  // Part 8 — Current Question
  const part8 = `[PART 8 — CURRENT QUESTION]
Student: ${userMessage}
Advisor:`;

  // Optional LeetCode injection for leetcode_guidance intent
  let leetcodeBlock = '';
  if (intent.intent === 'leetcode_guidance') {
    const filtered = RECOMMENDED_PROBLEMS.filter(
      (p) => p.level <= student.currentYear
    );
    if (filtered.length > 0) {
      const problemLines = filtered
        .map((p) => `- [${p.difficulty}] ${p.title} (${p.category}, Year ${p.level})`)
        .join('\n');
      leetcodeBlock = `\n[LEETCODE PROBLEMS — Level ≤ Year ${student.currentYear}]\n${problemLines}`;
    }
  }

  // Assemble prompt with token budget enforcement
  function buildHistorySection(historyTurns: typeof turns): string {
    if (historyTurns.length === 0) return '[PART 7 — CONVERSATION HISTORY]\n(No prior conversation)';
    const lines = historyTurns
      .map((t) => `${t.role === 'user' ? 'Student' : 'Advisor'}: ${t.content}`)
      .join('\n');
    return `[PART 7 — CONVERSATION HISTORY]\n${lines}`;
  }

  function assemblePrompt(historyTurns: typeof turns): string {
    return [part1, part2, part3, part4, part5, part6, buildHistorySection(historyTurns), part8, leetcodeBlock]
      .filter(Boolean)
      .join('\n\n');
  }

  // Enforce 4000-token budget by removing oldest turns one at a time
  let prompt = assemblePrompt(turns);
  while (estimateTokens(prompt) > 4000 && turns.length > 0) {
    turns = turns.slice(1); // remove oldest turn
    prompt = assemblePrompt(turns);
  }

  return prompt;
}
