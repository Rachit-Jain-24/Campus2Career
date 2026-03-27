import type { PromptInput } from './types';

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
    .join('\n\n');

  let turns = [...context.turns];

  function buildHistorySection(historyTurns: typeof turns): string {
    if (historyTurns.length === 0) return 'No previous conversation.';
    return historyTurns
      .map((t) => `${t.role === 'user' ? 'Student' : 'Mentor'}: ${t.content}`)
      .join('\n');
  }

  function assemblePrompt(historyTurns: typeof turns): string {
    return `You are an AI Career Mentor — friendly, concise, and conversational like ChatGPT.

Student Profile (use as background context, don't dump it all at once):
${studentProfileJson}

Intent: ${intent.intent} (${(intent.confidence * 100).toFixed(0)}% confidence)
Sentiment: ${sentiment.label}
Readiness Score: ${personalization.readinessScore}/100

Conversation History:
${buildHistorySection(historyTurns)}

Knowledge Context (use only if relevant to the question):
${ragContext}

Current User Message:
Student: ${userMessage}

Instructions:
- Respond ONLY to what the student actually asked — do not volunteer unsolicited analysis
- If it's a greeting or small talk, reply naturally and briefly (1-2 sentences), then ask what they need help with
- If they ask a specific question, answer it directly and concisely
- Only give a full structured breakdown (gaps, action plan, etc.) when explicitly asked for it
- Keep responses short to medium length — no walls of text unless the question demands depth
- Use bullet points or numbered lists only when listing multiple items makes it clearer
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
