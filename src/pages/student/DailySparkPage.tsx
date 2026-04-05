import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Flame, CheckCircle2, XCircle, RefreshCw, Zap,
  Code2, Lightbulb, Wrench, Trophy, Calendar, ArrowRight
} from 'lucide-react';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// ── Types ────────────────────────────────────────────────────────────────────
type ChallengeType = 'concept' | 'build' | 'debug';

interface Challenge {
  type: ChallengeType;
  title: string;
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation: string;
  track: string;
}

// ── Static fallback challenges per track ─────────────────────────────────────
const FALLBACK_CHALLENGES: Record<string, Challenge[]> = {
  default: [
    {
      type: 'concept',
      title: 'What is a Variable?',
      question: 'Which of the following best describes a variable in programming?',
      options: [
        'A fixed value that never changes',
        'A named storage location that holds a value',
        'A function that returns a number',
        'A type of loop',
      ],
      correctIndex: 1,
      explanation: 'A variable is a named container in memory that stores a value. You can change the value stored in it throughout your program.',
      track: 'General',
    },
    {
      type: 'build',
      title: 'Mini Build Challenge',
      question: 'What would you build first if you had to create a simple to-do list app? Describe the 3 core features you\'d implement.',
      explanation: 'A good to-do app needs: (1) Add tasks, (2) Mark tasks as done, (3) Delete tasks. Everything else is extra.',
      track: 'General',
    },
    {
      type: 'concept',
      title: 'Arrays vs Linked Lists',
      question: 'When would you prefer a Linked List over an Array?',
      options: [
        'When you need fast random access by index',
        'When you frequently insert/delete at the beginning',
        'When memory is limited',
        'When you need to sort elements',
      ],
      correctIndex: 1,
      explanation: 'Linked Lists shine when you need frequent insertions/deletions at the start or middle — O(1) vs O(n) for arrays. Arrays win for random access.',
      track: 'General',
    },
  ],
};

// ── Streak helpers ────────────────────────────────────────────────────────────
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getStreak(sapId: string): number {
  try {
    const raw = localStorage.getItem(`c2c_spark_streak_${sapId}`);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return data.streak || 0;
  } catch { return 0; }
}

function updateStreak(sapId: string, completed: boolean) {
  try {
    const raw = localStorage.getItem(`c2c_spark_streak_${sapId}`);
    const data = raw ? JSON.parse(raw) : { streak: 0, lastDate: '' };
    const today = getTodayKey();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (data.lastDate === today) return data.streak;
    if (completed) {
      const newStreak = data.lastDate === yesterday ? data.streak + 1 : 1;
      localStorage.setItem(`c2c_spark_streak_${sapId}`, JSON.stringify({ streak: newStreak, lastDate: today }));
      return newStreak;
    }
    return data.streak;
  } catch { return 0; }
}

function isTodayDone(sapId: string): boolean {
  try {
    const raw = localStorage.getItem(`c2c_spark_streak_${sapId}`);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.lastDate === getTodayKey();
  } catch { return false; }
}

// ── AI Challenge Generator ────────────────────────────────────────────────────
async function generateChallenge(track: string, year: number): Promise<Challenge> {
  if (!API_KEY) return FALLBACK_CHALLENGES.default[Math.floor(Math.random() * 3)];

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const types: ChallengeType[] = ['concept', 'build', 'debug'];
  const type = types[Math.floor(Math.random() * types.length)];

  const prompt = `You are creating a daily 5-minute micro-challenge for a Year ${year} engineering student interested in ${track}.

Challenge type: ${type}
- "concept": A multiple-choice question testing a fundamental concept relevant to ${track}
- "build": An open-ended "what would you build" or "how would you design" prompt (no code needed, just thinking)
- "debug": A short broken code snippet or logical error to identify

Rules:
- Keep it appropriate for Year ${year} (Year 1-2 = beginner/intermediate, Year 3-4 = advanced)
- Make it genuinely interesting and industry-relevant
- For "concept" type, provide 4 options and mark the correct one (0-indexed)
- Keep the question under 100 words

Return ONLY valid JSON:
{
  "type": "${type}",
  "title": "short catchy title (5 words max)",
  "question": "the full question or prompt",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "clear 2-3 sentence explanation of the answer or ideal approach",
  "track": "${track}"
}

For "build" and "debug" types, omit "options" and "correctIndex".`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text) as Challenge;
  } catch {
    return FALLBACK_CHALLENGES.default[Math.floor(Math.random() * 3)];
  }
}

// ── Icons per type ────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ChallengeType, { icon: React.ElementType; label: string; color: string }> = {
  concept: { icon: Lightbulb, label: 'Concept Check', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  build: { icon: Wrench, label: 'Build Thinking', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  debug: { icon: Code2, label: 'Debug It', color: 'bg-red-50 text-red-700 border-red-200' },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function DailySparkPage() {
  const { user, updateUser } = useAuth();
  const u = user as any;
  const sapId = u?.sapId || 'guest';
  const track = u?.careerTrack || 'Software Engineering';
  const year = u?.currentYear || 1;

  // Prefer DB-persisted streak, fall back to localStorage
  const [streak, setStreak] = useState<number>(() => u?.sparkStreak || getStreak(sapId));
  const [todayDone, setTodayDone] = useState<boolean>(() => {
    const dbLastDate = u?.sparkLastDate || '';
    return dbLastDate === getTodayKey() || isTodayDone(sapId);
  });

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [openAnswer, setOpenAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Load today's challenge from cache or generate new
  useEffect(() => {
    const cacheKey = `c2c_spark_challenge_${sapId}_${getTodayKey()}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setChallenge(JSON.parse(cached));
        return;
      } catch { /* fall through */ }
    }
    loadChallenge(cacheKey);
  }, [sapId]);

  const loadChallenge = async (cacheKey?: string) => {
    setIsLoading(true);
    setSelectedOption(null);
    setAnswered(false);
    setOpenAnswer('');
    setSubmitted(false);
    try {
      const c = await generateChallenge(track, year);
      setChallenge(c);
      const key = cacheKey || `c2c_spark_challenge_${sapId}_${getTodayKey()}`;
      localStorage.setItem(key, JSON.stringify(c));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    if (!todayDone) {
      const newStreak = updateStreak(sapId, true);
      setStreak(newStreak);
      setTodayDone(true);
      // Persist to Supabase
      if (user) updateUser({ ...user, sparkStreak: newStreak, sparkLastDate: getTodayKey() } as any).catch(() => {});
    }
  };

  const handleOpenSubmit = () => {
    if (!openAnswer.trim()) return;
    setSubmitted(true);
    if (!todayDone) {
      const newStreak = updateStreak(sapId, true);
      setStreak(newStreak);
      setTodayDone(true);
      // Persist to Supabase
      if (user) updateUser({ ...user, sparkStreak: newStreak, sparkLastDate: getTodayKey() } as any).catch(() => {});
    }
  };

  const typeConfig = challenge ? TYPE_CONFIG[challenge.type] : null;
  const TypeIcon = typeConfig?.icon || Lightbulb;

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

        {/* Header */}
        <div className="rounded-3xl gradient-primary p-8 text-white relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest text-white/70">Daily Spark</span>
              </div>
              <h1 className="text-3xl font-black mb-1">Today's Challenge</h1>
              <p className="text-white/70 text-sm">5 minutes. One challenge. Build the habit.</p>
            </div>
            <div className="text-center bg-white/20 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-1.5 justify-center mb-1">
                <Flame className="w-4 h-4 text-orange-300" />
                <span className="text-2xl font-black">{streak}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: 'Today', value: todayDone ? '✅ Done' : '⏳ Pending', color: todayDone ? 'text-green-600' : 'text-amber-600' },
            { icon: Trophy, label: 'Best Streak', value: `${streak} days`, color: 'text-primary' },
            { icon: Zap, label: 'Track', value: track.split(' ')[0], color: 'text-slate-700' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Challenge Card */}
        {isLoading ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-12 w-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
              <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-bold text-slate-500">Generating your challenge...</p>
          </div>
        ) : challenge && (
          <AnimatePresence mode="wait">
            <motion.div
              key={challenge.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="p-6 border-b border-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full border ${typeConfig?.color}`}>
                    <TypeIcon className="w-3 h-3" />
                    {typeConfig?.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{challenge.track}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">{challenge.title}</h2>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-slate-700 text-sm leading-relaxed font-medium">{challenge.question}</p>

                {/* MCQ */}
                {challenge.type === 'concept' && challenge.options && (
                  <div className="space-y-2">
                    {challenge.options.map((opt, idx) => {
                      const isCorrect = idx === challenge.correctIndex;
                      const isSelected = idx === selectedOption;
                      let cls = 'border-slate-100 hover:border-primary/30 hover:bg-primary/5';
                      if (answered) {
                        if (isCorrect) cls = 'border-green-300 bg-green-50';
                        else if (isSelected && !isCorrect) cls = 'border-red-300 bg-red-50';
                        else cls = 'border-slate-100 opacity-50';
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          disabled={answered}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${cls}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answered && isCorrect ? 'border-green-500 bg-green-500' : answered && isSelected ? 'border-red-500 bg-red-500' : 'border-slate-200'}`}>
                            {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-white" />}
                            {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Open-ended */}
                {(challenge.type === 'build' || challenge.type === 'debug') && !submitted && (
                  <div className="space-y-3">
                    <textarea
                      value={openAnswer}
                      onChange={e => setOpenAnswer(e.target.value)}
                      placeholder="Type your answer or approach here..."
                      rows={4}
                      className="w-full p-4 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    />
                    <button
                      onClick={handleOpenSubmit}
                      disabled={!openAnswer.trim()}
                      className="w-full h-11 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      Submit Answer <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Explanation */}
                {(answered || submitted) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Explanation</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{challenge.explanation}</p>
                  </motion.div>
                )}

                {/* Streak celebration */}
                {(answered || submitted) && todayDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3"
                  >
                    <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-orange-800">
                        {streak === 1 ? "First spark! 🔥 Come back tomorrow to build your streak." : `${streak}-day streak! 🔥 Keep it going!`}
                      </p>
                      <p className="text-xs text-orange-600">Come back tomorrow for a new challenge.</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Refresh (only if today's challenge is done or for testing) */}
        {!isLoading && challenge && (
          <button
            onClick={() => loadChallenge()}
            className="w-full h-11 border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2 hover:border-primary/40 hover:text-primary transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try a different challenge
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}
