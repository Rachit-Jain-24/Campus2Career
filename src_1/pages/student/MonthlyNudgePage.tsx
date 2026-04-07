import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { callOpenRouter, isOpenRouterConfigured } from '../../lib/openRouter';
import {
  Calendar, Sparkles, RefreshCw, CheckCircle2,
  Target, BookOpen, Code2, Briefcase, Award, Zap, ArrowRight
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthlyAction {
  title: string;
  why: string;
  howToStart: string;
  timeCommitment: string;
  category: 'learn' | 'build' | 'practice' | 'network' | 'apply';
  priority: 'must-do' | 'should-do' | 'nice-to-have';
}

interface MonthlyNudge {
  greeting: string;
  contextSummary: string;
  focusTheme: string;
  actions: MonthlyAction[];
  motivationalNote: string;
  monthYear: string;
}

// ── Config ────────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<MonthlyAction['category'], { icon: React.ElementType; color: string; bg: string }> = {
  learn:    { icon: BookOpen,  color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  build:    { icon: Code2,     color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  practice: { icon: Target,    color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
  network:  { icon: Briefcase, color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  apply:    { icon: Award,     color: 'text-rose-700',   bg: 'bg-rose-50 border-rose-200' },
};

const PRIORITY_CONFIG: Record<MonthlyAction['priority'], { label: string; color: string }> = {
  'must-do':       { label: 'Must Do',       color: 'bg-red-100 text-red-700' },
  'should-do':     { label: 'Should Do',     color: 'bg-amber-100 text-amber-700' },
  'nice-to-have':  { label: 'Nice to Have',  color: 'bg-slate-100 text-slate-600' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Cache helpers ─────────────────────────────────────────────────────────────
function getCacheKey(sapId: string) {
  const now = new Date();
  return `c2c_nudge_${sapId}_${now.getFullYear()}_${now.getMonth()}`;
}

function getCached(sapId: string): MonthlyNudge | null {
  try {
    const raw = localStorage.getItem(getCacheKey(sapId));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setCache(sapId: string, nudge: MonthlyNudge) {
  try { localStorage.setItem(getCacheKey(sapId), JSON.stringify(nudge)); } catch { /* ignore */ }
}

// ── Fallback nudge ────────────────────────────────────────────────────────────
function buildFallback(user: any): MonthlyNudge {
  const now = new Date();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const track = user?.careerTrack || 'Software Engineering';
  const yr = user?.currentYear || 1;

  const actionsByYear: MonthlyAction[] = yr <= 2 ? [
    {
      title: `Learn the fundamentals of ${track.split(' ')[0]}`,
      why: 'Year 1–2 is the best time to build a strong foundation before specialization.',
      howToStart: 'Pick one free course on YouTube or Coursera and commit to 30 minutes daily.',
      timeCommitment: '30 min/day',
      category: 'learn',
      priority: 'must-do',
    },
    {
      title: 'Build one mini project this month',
      why: 'Projects are the #1 thing that differentiates students at placement time.',
      howToStart: 'Pick a simple idea (to-do app, calculator, quiz game) and build it from scratch.',
      timeCommitment: '2–3 hours/week',
      category: 'build',
      priority: 'must-do',
    },
    {
      title: 'Solve 10 LeetCode Easy problems',
      why: 'Starting early with DSA gives you a massive advantage by Year 3.',
      howToStart: 'Go to LeetCode → Problems → Filter by Easy → solve one per day.',
      timeCommitment: '20 min/day',
      category: 'practice',
      priority: 'should-do',
    },
  ] : [
    {
      title: 'Apply to 3 internships this month',
      why: 'Internship experience is the single biggest placement differentiator in Year 3–4.',
      howToStart: 'Check Internshala, LinkedIn, and company career pages. Tailor your resume for each.',
      timeCommitment: '1 hour/week',
      category: 'apply',
      priority: 'must-do',
    },
    {
      title: 'Solve 20 LeetCode Medium problems',
      why: 'Most placement drives test Medium-level DSA. Consistency now pays off in drives.',
      howToStart: 'Focus on Arrays, Strings, and Trees this month — highest frequency topics.',
      timeCommitment: '45 min/day',
      category: 'practice',
      priority: 'must-do',
    },
    {
      title: 'Update your resume and LinkedIn',
      why: 'Recruiters check LinkedIn before interviews. An updated profile increases callbacks.',
      howToStart: 'Add your latest project, update skills, and write a 3-line summary.',
      timeCommitment: '2 hours (one-time)',
      category: 'network',
      priority: 'should-do',
    },
  ];

  return {
    greeting: `Here's your ${month} plan, ${user?.name?.split(' ')[0] || 'there'}`,
    contextSummary: `Year ${yr} · ${track} · ${month} ${year}`,
    focusTheme: yr <= 2 ? 'Build Your Foundation' : 'Placement Readiness',
    actions: actionsByYear,
    motivationalNote: yr <= 2
      ? 'The habits you build in Year 1–2 compound massively by Year 4. Start small, stay consistent.'
      : 'You\'re in the final stretch. Every action this month directly impacts your placement outcome.',
    monthYear: `${month} ${year}`,
  };
}

// ── AI generator ──────────────────────────────────────────────────────────
async function generateNudge(user: any): Promise<MonthlyNudge> {
  if (!isOpenRouterConfigured()) return buildFallback(user);

  const now = new Date();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  const prompt = `You are a proactive career mentor for engineering students. Generate a personalized monthly action plan.

STUDENT PROFILE:
- Name: ${user?.name?.split(' ')[0] || 'Student'}
- Year: ${user?.currentYear || 1} of 4
- Branch: ${user?.branch || 'B.Tech CSE'}
- Career Track: ${user?.careerTrack || 'Software Engineering'}
- Tech Skills: ${(user?.techSkills || []).slice(0, 6).join(', ') || 'None listed yet'}
- Projects: ${user?.projects?.length || 0}
- Internships: ${user?.internships?.length || 0}
- LeetCode Solved: ${user?.leetcodeStats?.totalSolved || 0}
- CGPA: ${user?.cgpa || 'Not set'}
- Month: ${month} ${year}

Generate a focused monthly nudge with exactly 3 actions. Be specific, practical, and encouraging.
Actions must be appropriate for their year (Year 1–2 = foundation building, Year 3–4 = placement prep).

Return ONLY valid JSON:
{
  "greeting": "short personalized greeting using first name",
  "contextSummary": "one line: Year X · Track · Month Year",
  "focusTheme": "3-4 word theme for this month",
  "actions": [
    {
      "title": "specific action title (max 8 words)",
      "why": "1 sentence — why this matters RIGHT NOW for their year and track",
      "howToStart": "1 concrete sentence on exactly how to begin today",
      "timeCommitment": "e.g. 30 min/day or 2 hours/week",
      "category": "learn|build|practice|network|apply",
      "priority": "must-do|should-do|nice-to-have"
    }
  ],
  "motivationalNote": "1 punchy, honest motivational sentence (not generic)",
  "monthYear": "${month} ${year}"
}`;

  try {
    const text = await callOpenRouter(prompt, { json: true });
    const parsed = JSON.parse(text) as MonthlyNudge;
    if (parsed.actions?.length && parsed.focusTheme) return parsed;
    throw new Error('invalid');
  } catch {
    return buildFallback(user);
  }
}

// ── Checked actions helpers ───────────────────────────────────────────────────
function getChecked(sapId: string): number[] {
  try {
    const raw = localStorage.getItem(`c2c_nudge_checked_${sapId}_${new Date().getMonth()}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveChecked(sapId: string, checked: number[]) {
  try {
    localStorage.setItem(`c2c_nudge_checked_${sapId}_${new Date().getMonth()}`, JSON.stringify(checked));
  } catch { /* ignore */ }
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MonthlyNudgePage() {
  const { user } = useAuth();
  const u = user as any;
  const sapId = u?.sapId || 'guest';

  const [nudge, setNudge] = useState<MonthlyNudge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);

  useEffect(() => {
    const cached = getCached(sapId);
    if (cached) {
      setNudge(cached);
      setChecked(getChecked(sapId));
      return;
    }
    load();
  }, [sapId]);

  const load = async (force = false) => {
    setIsLoading(true);
    try {
      const result = await generateNudge(u);
      setNudge(result);
      setCache(sapId, result);
      if (force) {
        setChecked([]);
        saveChecked(sapId, []);
      } else {
        setChecked(getChecked(sapId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheck = (idx: number) => {
    const next = checked.includes(idx) ? checked.filter(i => i !== idx) : [...checked, idx];
    setChecked(next);
    saveChecked(sapId, next);
  };

  const now = new Date();
  const monthName = MONTHS[now.getMonth()];
  const completedCount = checked.length;
  const totalActions = nudge?.actions.length || 0;

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="rounded-3xl gradient-primary p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest text-white/70">Monthly Nudge</span>
              </div>
              <h1 className="text-3xl font-black mb-1">{monthName}'s Action Plan</h1>
              <p className="text-white/70 text-sm">Your AI mentor's focused plan for this month.</p>
            </div>
            {totalActions > 0 && (
              <div className="text-center bg-white/20 rounded-2xl px-5 py-3 shrink-0">
                <p className="text-2xl font-black">{completedCount}/{totalActions}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Done</p>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-12 w-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-500">Your AI mentor is thinking...</p>
            <p className="text-xs text-slate-400 mt-1">Personalizing your {monthName} plan</p>
          </div>
        )}

        {/* Nudge content */}
        {!isLoading && nudge && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Greeting card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{nudge.contextSummary}</p>
                  <h2 className="text-xl font-black text-slate-900 mb-1">{nudge.greeting}</h2>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-xs font-black text-primary">{nudge.focusTheme}</span>
                  </div>
                </div>
                <button
                  onClick={() => load(true)}
                  className="shrink-0 p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/40 transition-all"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              {totalActions > 0 && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Monthly progress</span>
                    <span>{Math.round((completedCount / totalActions) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      animate={{ width: `${(completedCount / totalActions) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action cards */}
            <div className="space-y-3">
              {nudge.actions.map((action, idx) => {
                const cat = CATEGORY_CONFIG[action.category] || CATEGORY_CONFIG.learn;
                const pri = PRIORITY_CONFIG[action.priority] || PRIORITY_CONFIG['should-do'];
                const CatIcon = cat.icon;
                const isDone = checked.includes(idx);

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${isDone ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:shadow-md'}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Check button */}
                      <button
                        onClick={() => toggleCheck(idx)}
                        className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${isDone ? 'bg-green-500 border-green-500' : 'border-slate-200 hover:border-primary'}`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${cat.bg} ${cat.color}`}>
                            <CatIcon className="w-2.5 h-2.5" />
                            {action.category}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${pri.color}`}>
                            {pri.label}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 ml-auto">{action.timeCommitment}</span>
                        </div>

                        <h3 className={`text-sm font-black text-slate-900 mb-2 ${isDone ? 'line-through text-slate-400' : ''}`}>
                          {action.title}
                        </h3>

                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{action.why}</p>

                        <div className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-xl">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <p className="text-xs font-medium text-slate-600">{action.howToStart}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Motivational note */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-slate-700 italic leading-relaxed">"{nudge.motivationalNote}"</p>
            </div>

            {/* All done celebration */}
            {completedCount === totalActions && totalActions > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center"
              >
                <p className="text-2xl mb-1">🎉</p>
                <p className="font-black text-green-800">You crushed {monthName}!</p>
                <p className="text-xs text-green-600 mt-1">Come back next month for a fresh plan.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
