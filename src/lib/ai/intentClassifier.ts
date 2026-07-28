
// intentclassifier
import type { Intent, IntentResult } from './types';

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  skill_gap_query: [
    'skill', 'gap', 'missing', 'lack', 'need to learn', 'what should i learn',
    'improve', 'weak', 'not good at', 'skills required', 'technology', 'tech stack'
  ],
  interview_prep: [
    'interview', 'prepare', 'preparation', 'mock', 'question', 'answer',
    'hr round', 'technical round', 'coding round', 'behavioral', 'system design'
  ],
  company_info: [
    'company', 'google', 'amazon', 'microsoft', 'flipkart', 'infosys', 'tcs',
    'wipro', 'accenture', 'startup', 'mnc', 'package', 'salary', 'ctc', 'offer'
  ],
  placement_advice: [
    'placement', 'placed', 'campus', 'drive', 'eligible', 'criteria', 'shortlist',
    'resume', 'apply', 'job', 'career', 'advice', 'tips', 'strategy', 'plan'
  ],
  resume_help: [
    'resume', 'cv', 'ats', 'format', 'template', 'write', 'update', 'improve resume',
    'projects section', 'experience', 'summary', 'objective', 'keywords'
  ],
  leetcode_guidance: [
    'leetcode', 'dsa', 'data structure', 'algorithm', 'coding', 'problem',
    'array', 'tree', 'graph', 'dp', 'dynamic programming', 'solve', 'practice'
  ]
};

const SEMANTIC_RULES: Array<{ pattern: RegExp; intent: Intent; boost: number }> = [
  { pattern: /what (skills?|tech) (do i|should i|must i)/i, intent: 'skill_gap_query', boost: 0.4 },
  { pattern: /how (to|do i) (prepare|crack|pass) (interview|round)/i, intent: 'interview_prep', boost: 0.4 },
  { pattern: /which (company|companies|firm)/i, intent: 'company_info', boost: 0.3 },
  { pattern: /am i (eligible|ready|prepared)/i, intent: 'placement_advice', boost: 0.35 },
  { pattern: /how (to|should i) (write|improve|update|fix) (my )?(resume|cv)/i, intent: 'resume_help', boost: 0.4 },
  { pattern: /which (leetcode|dsa|problems?) (should i|to|must i)/i, intent: 'leetcode_guidance', boost: 0.4 },
];

function keywordScore(intent: Intent, message: string): number {
  const lower = message.toLowerCase();
  const keywords = INTENT_KEYWORDS[intent];
  const matched = keywords.filter(kw => lower.includes(kw));
  return matched.length / keywords.length;
}

function semanticBoost(intent: Intent, message: string): number {
  return SEMANTIC_RULES
    .filter(rule => rule.intent === intent && rule.pattern.test(message))
    .reduce((sum, rule) => sum + rule.boost, 0);
}

export function classify(message: string): IntentResult {
  const input = message.length > 1000 ? message.slice(0, 500) : message;
  const lower = input.toLowerCase();

  const intents: Intent[] = [
    'skill_gap_query', 'interview_prep', 'company_info',
    'placement_advice', 'resume_help', 'leetcode_guidance'
  ];

  let bestIntent: Intent = 'placement_advice';
  let bestConfidence = 0;

  for (const intent of intents) {
    const confidence = keywordScore(intent, input) + semanticBoost(intent, input);
    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestIntent = intent;
    }
  }

  const matchedKeywords = INTENT_KEYWORDS[bestIntent].filter(kw => lower.includes(kw));

  if (bestConfidence < 0.3) {
    return { intent: 'placement_advice', confidence: 0, matchedKeywords: [] };
  }

  return { intent: bestIntent, confidence: bestConfidence, matchedKeywords };
}
