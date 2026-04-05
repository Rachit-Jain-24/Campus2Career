import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dna, Brain, Users, Zap, Shield, Lightbulb,
  ArrowRight, ArrowLeft, RefreshCw, Share2, CheckCircle2, Sparkles
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; trait: string }[];
}

interface DNAResult {
  archetype: string;
  emoji: string;
  tagline: string;
  description: string;
  bestFitTracks: string[];
  workStyle: string;
  superpower: string;
  watchOut: string;
  color: string;
}

// ── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'You get a new coding assignment. What\'s your first instinct?',
    options: [
      { label: 'Jump in and start writing code immediately', value: 'a', trait: 'builder' },
      { label: 'Sketch out the architecture and plan first', value: 'b', trait: 'analyst' },
      { label: 'Look for existing solutions or libraries', value: 'c', trait: 'pragmatist' },
      { label: 'Discuss the approach with a teammate', value: 'd', trait: 'collaborator' },
    ],
  },
  {
    id: 'q2',
    text: 'Which type of problem excites you the most?',
    options: [
      { label: 'Building something users can see and interact with', value: 'a', trait: 'builder' },
      { label: 'Optimizing a slow system to run 10x faster', value: 'b', trait: 'analyst' },
      { label: 'Figuring out why a complex bug is happening', value: 'c', trait: 'investigator' },
      { label: 'Designing a system that scales to millions of users', value: 'd', trait: 'architect' },
    ],
  },
  {
    id: 'q3',
    text: 'How do you prefer to work?',
    options: [
      { label: 'Deep solo focus — headphones on, no interruptions', value: 'a', trait: 'solo' },
      { label: 'Pair programming or constant collaboration', value: 'b', trait: 'collaborator' },
      { label: 'Mix of both — solo work with regular syncs', value: 'c', trait: 'balanced' },
      { label: 'Leading a small team toward a shared goal', value: 'd', trait: 'leader' },
    ],
  },
  {
    id: 'q4',
    text: 'What kind of company would you thrive in?',
    options: [
      { label: 'Fast-moving startup — wear many hats, ship fast', value: 'a', trait: 'startup' },
      { label: 'Big tech — structured, high-impact, great mentorship', value: 'b', trait: 'bigtech' },
      { label: 'Research lab or university — deep technical work', value: 'c', trait: 'research' },
      { label: 'Product company — own a feature end-to-end', value: 'd', trait: 'product' },
    ],
  },
  {
    id: 'q5',
    text: 'When you learn something new, you prefer:',
    options: [
      { label: 'Building a project with it immediately', value: 'a', trait: 'builder' },
      { label: 'Reading docs and understanding the internals', value: 'b', trait: 'analyst' },
      { label: 'Watching tutorials and following along', value: 'c', trait: 'visual' },
      { label: 'Teaching it to someone else to solidify it', value: 'd', trait: 'teacher' },
    ],
  },
  {
    id: 'q6',
    text: 'Which of these sounds most like you?',
    options: [
      { label: 'I love making things look and feel great', value: 'a', trait: 'creative' },
      { label: 'I love making things work efficiently under the hood', value: 'b', trait: 'systems' },
      { label: 'I love finding patterns in data and drawing insights', value: 'c', trait: 'data' },
      { label: 'I love protecting systems and thinking like an attacker', value: 'd', trait: 'security' },
    ],
  },
  {
    id: 'q7',
    text: 'Your team is stuck on a hard problem. You:',
    options: [
      { label: 'Prototype 3 quick solutions and test them', value: 'a', trait: 'builder' },
      { label: 'Break it down into smaller sub-problems systematically', value: 'b', trait: 'analyst' },
      { label: 'Search for how others have solved similar problems', value: 'c', trait: 'pragmatist' },
      { label: 'Facilitate a brainstorm to get everyone\'s ideas', value: 'd', trait: 'collaborator' },
    ],
  },
  {
    id: 'q8',
    text: 'What motivates you most in your career?',
    options: [
      { label: 'Seeing millions of people use something I built', value: 'a', trait: 'impact' },
      { label: 'Solving technically hard problems no one else can', value: 'b', trait: 'mastery' },
      { label: 'Financial growth and career progression', value: 'c', trait: 'growth' },
      { label: 'Working on meaningful problems that matter to society', value: 'd', trait: 'purpose' },
    ],
  },
];

// ── Archetype Engine ─────────────────────────────────────────────────────────
function computeDNA(answers: Record<string, string>): DNAResult {
  const traits = Object.values(answers).map(v => {
    const q = QUESTIONS.find(q => q.options.some(o => o.value === v));
    return q?.options.find(o => o.value === v)?.trait || '';
  });

  const counts: Record<string, number> = {};
  traits.forEach(t => { counts[t] = (counts[t] || 0) + 1; });

  const isBuilder = (counts['builder'] || 0) >= 2;
  const isAnalyst = (counts['analyst'] || 0) >= 2;
  const isCollaborator = (counts['collaborator'] || 0) >= 2;
  const isData = counts['data'] >= 1;
  const isSecurity = counts['security'] >= 1;
  const isCreative = counts['creative'] >= 1;
  const isSystems = counts['systems'] >= 1;
  const isResearch = counts['research'] >= 1;

  if (isSecurity) return {
    archetype: 'The Guardian',
    emoji: '🛡️',
    tagline: 'You think like an attacker to defend like a pro.',
    description: 'You have a natural instinct for finding weaknesses and protecting systems. You think adversarially — always asking "how could this break?" — which makes you invaluable in security-critical environments.',
    bestFitTracks: ['Cybersecurity', 'Cloud & DevOps', 'Backend Engineering'],
    workStyle: 'Methodical, detail-oriented, risk-aware',
    superpower: 'Spotting vulnerabilities others miss',
    watchOut: 'Can over-engineer security at the cost of shipping speed',
    color: 'from-red-500 to-orange-600',
  };

  if (isData) return {
    archetype: 'The Insight Engine',
    emoji: '📊',
    tagline: 'You turn raw numbers into decisions that matter.',
    description: 'You see patterns where others see noise. Your analytical mind thrives on data — you\'re not satisfied until you understand the "why" behind every trend. You\'re the person who makes data-driven decisions feel obvious in hindsight.',
    bestFitTracks: ['AI / ML Engineering', 'Data Engineering', 'Product Analytics'],
    workStyle: 'Curious, systematic, evidence-driven',
    superpower: 'Extracting signal from noise',
    watchOut: 'Can get stuck in analysis paralysis — ship faster',
    color: 'from-amber-500 to-yellow-600',
  };

  if (isCreative && isBuilder) return {
    archetype: 'The Craftsperson',
    emoji: '🎨',
    tagline: 'You build things that are both beautiful and functional.',
    description: 'You care deeply about the user experience. You\'re not just writing code — you\'re crafting an experience. You bridge the gap between design and engineering, making products that people actually love to use.',
    bestFitTracks: ['UI/UX Design', 'Full-Stack Development', 'Product Management'],
    workStyle: 'Creative, user-empathetic, detail-focused',
    superpower: 'Making complex things feel simple',
    watchOut: 'Perfectionism can slow down delivery',
    color: 'from-rose-500 to-pink-600',
  };

  if (isSystems || (isAnalyst && !isBuilder)) return {
    archetype: 'The Systems Thinker',
    emoji: '⚙️',
    tagline: 'You see the whole machine, not just the parts.',
    description: 'You think in systems, abstractions, and trade-offs. You\'re the person who asks "but what happens at scale?" before anyone else. You love understanding how things work under the hood and designing elegant architectures.',
    bestFitTracks: ['Backend Engineering', 'Cloud & DevOps', 'Software Engineering'],
    workStyle: 'Structured, first-principles, architecture-focused',
    superpower: 'Designing systems that don\'t break under pressure',
    watchOut: 'Can over-architect simple problems',
    color: 'from-cyan-500 to-blue-600',
  };

  if (isCollaborator) return {
    archetype: 'The Catalyst',
    emoji: '⚡',
    tagline: 'You make every team around you better.',
    description: 'You\'re the glue that holds teams together. You communicate clearly, unblock others, and have a rare ability to translate between technical and non-technical stakeholders. You thrive in cross-functional environments.',
    bestFitTracks: ['Product Management', 'Full-Stack Development', 'Engineering Leadership'],
    workStyle: 'Collaborative, communicative, empathetic',
    superpower: 'Aligning people toward a shared vision',
    watchOut: 'Can deprioritize deep technical depth',
    color: 'from-green-500 to-emerald-600',
  };

  if (isResearch) return {
    archetype: 'The Deep Diver',
    emoji: '🔬',
    tagline: 'You go where others stop — into the unknown.',
    description: 'You\'re driven by intellectual curiosity and the desire to push boundaries. You\'re not satisfied with "good enough" — you want to understand the fundamental principles. Research, innovation, and novel problem-solving are your natural habitat.',
    bestFitTracks: ['AI / ML Research', 'Blockchain', 'AR/VR Development'],
    workStyle: 'Curious, thorough, innovation-driven',
    superpower: 'Solving problems that don\'t have Stack Overflow answers',
    watchOut: 'Can lose sight of practical delivery timelines',
    color: 'from-violet-500 to-purple-700',
  };

  // Default: Builder
  return {
    archetype: 'The Builder',
    emoji: '🔨',
    tagline: 'You ship. Others talk — you build.',
    description: 'You have a bias for action. You learn by doing, and you\'re never happier than when you\'re creating something from scratch. You move fast, iterate quickly, and have a natural instinct for what needs to be built next.',
    bestFitTracks: ['Full-Stack Development', 'Software Engineering', 'Mobile Development'],
    workStyle: 'Action-oriented, iterative, hands-on',
    superpower: 'Turning ideas into working products fast',
    watchOut: 'Can skip planning and create technical debt',
    color: 'from-slate-600 to-slate-800',
  };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CareerDNAPage() {
  const { user, updateUser } = useAuth();
  const u = user as any;

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DNAResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!u?.careerDNA);

  // Load existing result
  const existingDNA: DNAResult | null = u?.careerDNA || null;

  const handleAnswer = (questionId: string, value: string) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(c => c + 1), 300);
    } else {
      const dna = computeDNA(next);
      setResult(dna);
      setPhase('result');
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    setIsSaving(true);
    try {
      await updateUser({ ...user, careerDNA: result } as any);
      setSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setSaved(false);
    setPhase('quiz');
  };

  const progress = ((currentQ) / QUESTIONS.length) * 100;
  const displayResult = result || existingDNA;

  return (
    <DashboardLayout role="student">
      <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">

        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-3xl gradient-primary p-8 text-white text-center relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
                    <Dna className="w-8 h-8" />
                  </div>
                  <h1 className="text-3xl font-black mb-2">Career DNA</h1>
                  <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">
                    8 questions. 2 minutes. Discover your engineering personality and which career tracks fit you best.
                  </p>
                </div>
              </div>

              {existingDNA && (
                <div className={`rounded-2xl bg-gradient-to-br ${existingDNA.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{existingDNA.emoji}</span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-white/70">Your Career DNA</p>
                        <p className="text-xl font-black">{existingDNA.archetype}</p>
                      </div>
                    </div>
                    <button onClick={handleRetake} className="flex items-center gap-1.5 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-all">
                      <RefreshCw className="w-3 h-3" /> Retake
                    </button>
                  </div>
                  <p className="text-sm text-white/80 italic">"{existingDNA.tagline}"</p>
                </div>
              )}

              {!existingDNA && (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Brain, label: 'Problem-solving style', color: 'bg-purple-50 text-purple-600' },
                      { icon: Users, label: 'Work preference', color: 'bg-blue-50 text-blue-600' },
                      { icon: Zap, label: 'Learning approach', color: 'bg-amber-50 text-amber-600' },
                      { icon: Shield, label: 'Risk appetite', color: 'bg-green-50 text-green-600' },
                    ].map(item => (
                      <div key={item.label} className={`flex items-center gap-2 p-3 rounded-xl ${item.color}`}>
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setPhase('quiz')}
                    className="w-full h-12 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    Start Assessment <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {existingDNA && (
                <button
                  onClick={() => setPhase('result')}
                  className="w-full h-12 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                >
                  View Full Results <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}

          {/* ── QUIZ ── */}
          {phase === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQ}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-black text-primary">{currentQ + 1}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900 leading-snug">
                      {QUESTIONS[currentQ].text}
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {QUESTIONS[currentQ].options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(QUESTIONS[currentQ].id, opt.value)}
                        className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-primary flex items-center justify-center shrink-0 transition-colors">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

              {currentQ > 0 && (
                <button onClick={() => setCurrentQ(c => c - 1)} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Previous question
                </button>
              )}
            </motion.div>
          )}

          {/* ── RESULT ── */}
          {phase === 'result' && displayResult && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">

              {/* Hero card */}
              <div className={`rounded-3xl bg-gradient-to-br ${displayResult.color} p-8 text-white relative overflow-hidden`}>
                <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-white/70" />
                    <span className="text-xs font-black uppercase tracking-widest text-white/70">Your Career DNA</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{displayResult.emoji}</span>
                    <div>
                      <h2 className="text-3xl font-black">{displayResult.archetype}</h2>
                      <p className="text-white/80 text-sm italic mt-1">"{displayResult.tagline}"</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">{displayResult.description}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Best-Fit Career Tracks</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayResult.bestFitTracks.map(t => (
                      <span key={t} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-full">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Zap, label: 'Work Style', value: displayResult.workStyle, color: 'bg-blue-50 text-blue-700' },
                    { icon: Lightbulb, label: 'Superpower', value: displayResult.superpower, color: 'bg-amber-50 text-amber-700' },
                    { icon: Shield, label: 'Watch Out', value: displayResult.watchOut, color: 'bg-red-50 text-red-700' },
                  ].map(item => (
                    <div key={item.label} className={`rounded-2xl p-4 ${item.color}`}>
                      <item.icon className="w-4 h-4 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{item.label}</p>
                      <p className="text-xs font-bold leading-snug">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!saved ? (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 h-12 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save to Profile'}
                  </button>
                ) : (
                  <div className="flex-1 h-12 bg-green-50 border border-green-200 text-green-700 font-black rounded-2xl flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Saved to Profile
                  </div>
                )}
                <button
                  onClick={handleRetake}
                  className="h-12 px-5 border border-slate-200 text-slate-600 font-bold rounded-2xl flex items-center gap-2 hover:border-primary/40 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Retake
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
