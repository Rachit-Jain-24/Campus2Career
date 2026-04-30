import type { PromptInput } from './types';
import { RECOMMENDED_PROBLEMS } from '../../data/leetcodeProblems';

export const TONE_STRESSED = 'Use a warm, reassuring tone. Acknowledge the pressure, reduce overwhelm, and suggest one clear next step.';
export const TONE_CONFIDENT = 'Use a direct, high-agency tone. Validate momentum, then challenge the student with sharper next actions.';
export const TONE_NEUTRAL = 'Use a balanced, practical tone. Be concise, specific, and helpful without over-explaining.';

/** Estimate token count: 1 token ≈ 4 characters */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function build(input: PromptInput): string {
  const { student, ragResult, intent, sentiment, personalization, context, userMessage } = input;

  const studentProfileData = {
    name: student.name,
    year: student.currentYear,
    branch: student.branch,
    careerTrack: student.careerTrack,
    cgpa: student.cgpa,
    placementStatus: student.placementStatus,
    skills: student.skills || [],
    techSkills: student.techSkills || [],
    leetcodeStats: student.leetcodeStats || null,
    projects: student.projects || [],
    internships: student.internships || [],
    goals: student.goals || []
  };

  const studentProfileJson = JSON.stringify(studentProfileData, null, 2);

  const topChunks = ragResult.chunks.slice(0, 5);
  const ragContext = topChunks
    .map((chunk, i) => `[Chunk ${i + 1}: ${chunk.title}]\n${chunk.content}`)
    .join('\n\n') || 'No retrieved context available.';

  const toneInstruction = sentiment.label === 'stressed'
    ? TONE_STRESSED
    : sentiment.label === 'confident'
      ? TONE_CONFIDENT
      : TONE_NEUTRAL;

  const leetcodeBlock = intent.intent === 'leetcode_guidance'
    ? `\n\n[LEETCODE PROBLEMS - YEAR ${student.currentYear}]\n${RECOMMENDED_PROBLEMS
      .filter((problem) => problem.level <= student.currentYear)
      .map((problem) => `- ${problem.title} (${problem.difficulty}, ${problem.category}, Year ${problem.level})`)
      .join('\n')}`
    : '';

  let turns = [...context.turns];

  function buildHistorySection(historyTurns: typeof turns): string {
    if (historyTurns.length === 0) return 'No previous conversation.';
    return historyTurns
      .map((t) => `${t.role === 'user' ? 'Student' : 'Mentor'}: ${t.content}`)
      .join('\n');
  }

  function assemblePrompt(historyTurns: typeof turns): string {
    return `[PART 1 — SYSTEM PERSONA]
You are an AI Career Mentor for Campus2Career. Be friendly, concise, and conversational like ChatGPT, while staying grounded in the student's actual profile and the retrieved knowledge.

[PART 2 — TONE INSTRUCTION]
Sentiment: ${sentiment.label}
${toneInstruction}

[PART 3 — STUDENT PROFILE SUMMARY]
Student Profile (use as background context, don't dump it all at once):
${studentProfileJson}

[PART 4 — RETRIEVED CONTEXT]
Knowledge Context (use only if relevant to the question):
${ragContext}${leetcodeBlock}

[PART 5 — CLASSIFIED INTENT]
Intent: ${intent.intent} (${(intent.confidence * 100).toFixed(0)}% confidence)
Matched keywords: ${intent.matchedKeywords?.join(', ') || 'none'}

[PART 6 — PERSONALIZATION RATIONALE]
Readiness Score: ${personalization.readinessScore}/100
Suggested prompts: ${personalization.suggestedPrompts?.filter(Boolean).join(' | ') || 'none'}

[PART 7 — CONVERSATION HISTORY]
Conversation History:
${buildHistorySection(historyTurns)}

[PART 8 — CURRENT QUESTION]
Current User Message:
Student: ${userMessage}

Instructions:
- Respond ONLY to what the student actually asked — do not volunteer unsolicited analysis
- If it's a greeting or small talk, reply naturally and briefly (1-2 sentences), then ask what they need help with
- If they ask a specific question, answer it directly and concisely
- Only give a full structured breakdown (gaps, action plan, etc.) when explicitly asked for it
- Keep responses short to medium length — no walls of text unless the question demands depth
- Use **bold** for key terms, section headers, and important points
- Use *italic* for emphasis, role names, and technical terms
- Use bullet points (- item) for lists of 3+ items
- Use numbered lists (1. item) for step-by-step instructions or ranked items
- Add a blank line between sections for readability
- Match the student's tone: casual if they're casual, detailed if they ask for detail
- If stressed → be warm and supportive; if confident → be direct and push harder
`;
  }

  let prompt = assemblePrompt(turns);
  while (estimateTokens(prompt) > 4000 && turns.length > 0) {
    turns = turns.slice(1);
    prompt = assemblePrompt(turns);
  }

  return prompt;
}
