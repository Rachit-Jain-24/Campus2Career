import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutButton } from '../../components/ui/LogoutButton';
import {
    BrainCircuit, Target, Heart, ChevronRight, ChevronLeft,
    CheckCircle2, GraduationCap, Trophy, BarChart3,
    Zap, Clock, ArrowRight
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestionType = 'single' | 'scale' | 'rank';

interface Question {
    id: string;
    text: string;
    subtext?: string;
    type: QuestionType;
    options?: { label: string; value: string; emoji?: string }[];
    scaleMin?: string;
    scaleMax?: string;
}

interface Section {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    bgColor: string;
    questions: Question[];
}

// ─── Questions ────────────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
    {
        id: 'career',
        title: 'Career Interest Inventory',
        subtitle: 'Discover which career paths align with your natural interests.',
        icon: Target,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        questions: [
            {
                id: 'ci_1', type: 'single',
                text: 'Which activity sounds most exciting to you on a regular day?',
                options: [
                    { label: 'Building or coding an application', value: 'builder', emoji: '💻' },
                    { label: 'Analyzing data to find patterns', value: 'analyst', emoji: '📊' },
                    { label: 'Designing visuals and user experiences', value: 'designer', emoji: '🎨' },
                    { label: 'Managing a team or organizing events', value: 'manager', emoji: '🗂️' },
                    { label: 'Researching new technologies or concepts', value: 'researcher', emoji: '🔬' },
                    { label: 'Explaining concepts to others or teaching', value: 'educator', emoji: '📖' },
                ]
            },
            {
                id: 'ci_2', type: 'single',
                text: 'When you face a complex problem, what is your first instinct?',
                options: [
                    { label: 'Break it into smaller parts and code a solution', value: 'technical', emoji: '🔧' },
                    { label: 'Look for existing data or research', value: 'data-driven', emoji: '🔍' },
                    { label: 'Sketch ideas and think visually', value: 'visual', emoji: '✏️' },
                    { label: 'Discuss with people and brainstorm together', value: 'collaborative', emoji: '💬' },
                    { label: 'Write out a structured plan', value: 'strategic', emoji: '📋' },
                ]
            },
            {
                id: 'ci_3', type: 'single',
                text: 'Which of these domains do you want to explore the most?',
                options: [
                    { label: 'Artificial Intelligence & Machine Learning', value: 'ai_ml', emoji: '🤖' },
                    { label: 'Full-Stack Web / App Development', value: 'webdev', emoji: '🌐' },
                    { label: 'Cloud Computing & DevOps', value: 'cloud', emoji: '☁️' },
                    { label: 'Cybersecurity & Ethical Hacking', value: 'cyber', emoji: '🔐' },
                    { label: 'Data Science & Business Analytics', value: 'data', emoji: '📈' },
                    { label: 'UI/UX Design & Product', value: 'design', emoji: '🎯' },
                    { label: 'Embedded Systems & IoT', value: 'iot', emoji: '🔌' },
                    { label: 'Finance & FinTech', value: 'fintech', emoji: '💰' },
                ]
            },
            {
                id: 'ci_4', type: 'single',
                text: 'Which work environment appeals to you the most?',
                options: [
                    { label: 'A dynamic startup where I wear many hats', value: 'startup', emoji: '🚀' },
                    { label: 'A large MNC with structured career growth', value: 'mnc', emoji: '🏢' },
                    { label: 'A research lab or academic institution', value: 'research', emoji: '🔭' },
                    { label: 'My own company / freelance work', value: 'entrepreneur', emoji: '💼' },
                    { label: 'A government or public sector organization', value: 'govt', emoji: '🏛️' },
                ]
            },
            {
                id: 'ci_5', type: 'scale',
                text: 'How much do you enjoy working with numbers and statistics?',
                scaleMin: 'Not at all', scaleMax: 'Absolutely love it',
            },
            {
                id: 'ci_6', type: 'scale',
                text: 'How comfortable are you presenting or speaking in front of people?',
                scaleMin: 'Very uncomfortable', scaleMax: 'Very comfortable',
            },
        ]
    },
    {
        id: 'personality',
        title: 'Personality Assessment',
        subtitle: 'Understand your working style and how you interact with the world.',
        icon: BrainCircuit,
        color: 'text-violet-700',
        bgColor: 'bg-violet-100',
        questions: [
            {
                id: 'p_1', type: 'single',
                text: 'When working on a group project, you usually:',
                options: [
                    { label: 'Take the lead and delegate tasks', value: 'leader', emoji: '👑' },
                    { label: 'Contribute the most technically complex part', value: 'expert', emoji: '⚙️' },
                    { label: 'Focus on keeping everyone coordinated', value: 'coordinator', emoji: '🔗' },
                    { label: 'Make sure the work looks polished and presentable', value: 'finisher', emoji: '✨' },
                    { label: 'Contribute equally wherever needed', value: 'generalist', emoji: '🤝' },
                ]
            },
            {
                id: 'p_2', type: 'single',
                text: 'You get energized more by:',
                options: [
                    { label: 'Social interactions and group discussions', value: 'extrovert', emoji: '🎉' },
                    { label: 'Solo deep-focus work sessions', value: 'introvert', emoji: '🎧' },
                    { label: 'A balance of both', value: 'ambivert', emoji: '⚖️' },
                ]
            },
            {
                id: 'p_3', type: 'single',
                text: 'When given a new challenging task, your first reaction is:',
                options: [
                    { label: 'Excited — I love the thrill of something new', value: 'adventurous', emoji: '🔥' },
                    { label: 'Cautious — I plan carefully before starting', value: 'planner', emoji: '📐' },
                    { label: 'Curious — I research extensively first', value: 'curious', emoji: '🔎' },
                    { label: 'Practical — I look for the quickest effective path', value: 'pragmatic', emoji: '⚡' },
                ]
            },
            {
                id: 'p_4', type: 'single',
                text: 'How do you handle deadlines under pressure?',
                options: [
                    { label: 'I thrive — pressure gets the best out of me', value: 'pressure_positive', emoji: '💪' },
                    { label: 'I manage it, but it is stressful', value: 'pressure_managed', emoji: '😤' },
                    { label: 'I prefer planning ahead to avoid last-minute rushes', value: 'planner_pref', emoji: '📅' },
                    { label: 'I struggle with tight deadlines', value: 'deadline_tough', emoji: '😰' },
                ]
            },
            {
                id: 'p_5', type: 'scale',
                text: 'How would you rate your adaptability to rapid change?',
                scaleMin: 'Prefer stability & routine', scaleMax: 'Thrive on change & uncertainty',
            },
            {
                id: 'p_6', type: 'scale',
                text: 'How detail-oriented are you when completing a task?',
                scaleMin: 'Big-picture thinker', scaleMax: 'Extremely detail-focused',
            },
        ]
    },
    {
        id: 'behavioral',
        title: 'Behavioral Strengths',
        subtitle: 'Identify your behavioral patterns for placement and growth.',
        icon: Heart,
        color: 'text-rose-600',
        bgColor: 'bg-rose-100',
        questions: [
            {
                id: 'b_1', type: 'single',
                text: 'Describe your reaction when a project or plan fails unexpectedly:',
                options: [
                    { label: 'I analyze what went wrong and pivot quickly', value: 'resilient', emoji: '🔄' },
                    { label: 'I feel discouraged temporarily but bounce back', value: 'recovers', emoji: '🌱' },
                    { label: 'I seek help from mentors or peers', value: 'collaborative', emoji: '🤝' },
                    { label: 'I document the failure to learn systematically', value: 'systematic', emoji: '📝' },
                ]
            },
            {
                id: 'b_2', type: 'single',
                text: 'What is your strongest academic or extracurricular skill?',
                options: [
                    { label: 'Problem-solving and logical thinking', value: 'problem_solver', emoji: '🧩' },
                    { label: 'Communication and public speaking', value: 'communicator', emoji: '🎤' },
                    { label: 'Creative thinking and innovation', value: 'creative', emoji: '🌟' },
                    { label: 'Leadership and team motivation', value: 'leader', emoji: '🏆' },
                    { label: 'Research and learning new skills fast', value: 'learner', emoji: '📚' },
                ]
            },
            {
                id: 'b_3', type: 'single',
                text: 'When you disagree with a teammate\'s idea, you typically:',
                options: [
                    { label: 'Diplomatically present your perspective with data', value: 'diplomatic', emoji: '🤝' },
                    { label: 'Stay quiet and complete your own part', value: 'avoidant', emoji: '🤐' },
                    { label: 'Openly debate until the best solution is chosen', value: 'assertive', emoji: '💬' },
                    { label: 'Defer to the team leader\'s final decision', value: 'deferent', emoji: '🙌' },
                ]
            },
            {
                id: 'b_4', type: 'single',
                text: 'How do you typically manage your time during exams/project weeks?',
                options: [
                    { label: 'I start weeks ahead with a structured study plan', value: 'planner', emoji: '📅' },
                    { label: 'I use a daily task list and stick to it', value: 'systematic', emoji: '✅' },
                    { label: 'I study in bursts whenever motivation strikes', value: 'sporadic', emoji: '⚡' },
                    { label: 'I often end up last-minute cramming', value: 'procrastinator', emoji: '⏰' },
                ]
            },
            {
                id: 'b_5', type: 'scale',
                text: 'How proactive are you in seeking feedback on your work?',
                scaleMin: 'Wait for feedback to come', scaleMax: 'Actively seek it constantly',
            },
            {
                id: 'b_6', type: 'scale',
                text: 'How often do you pursue learning outside of classroom coursework?',
                scaleMin: 'Rarely / Never', scaleMax: 'Daily / Always',
            },
        ]
    }
];

// ─── Result mapping ────────────────────────────────────────────────────────────
function computeResult(answers: Record<string, any>) {
    const careerAns = Object.entries(answers).filter(([k]) => k.startsWith('ci_'));
    const hasAI = careerAns.some(([, v]) => v === 'ai_ml');
    const hasData = careerAns.some(([, v]) => v === 'data' || v === 'analyst');
    const hasDesign = careerAns.some(([, v]) => v === 'design' || v === 'designer');
    const hasWeb = careerAns.some(([, v]) => v === 'webdev');

    if (hasAI) return { title: 'AI / ML Engineer Track', emoji: '🤖', color: 'bg-violet-600', desc: 'You show a strong inclination towards Artificial Intelligence. Focus on Python, ML frameworks, and mathematics.' };
    if (hasData) return { title: 'Data Analyst / Data Scientist Track', emoji: '📊', color: 'bg-blue-600', desc: 'You are drawn to patterns and insights. Build skills in SQL, Python, Excel, and Statistics.' };
    if (hasDesign) return { title: 'Product / UX Designer Track', emoji: '🎨', color: 'bg-pink-600', desc: 'Your creative instincts shine. Learn Figma, UI principles, and user research methods.' };
    if (hasWeb) return { title: 'Full-Stack Developer Track', emoji: '💻', color: 'bg-emerald-600', desc: 'You enjoy building products. Master React, Node.js, and databases to become a full-stack developer.' };
    return { title: 'Generalist Tech Track', emoji: '🚀', color: 'bg-primary', desc: 'You have broad interests. Explore multiple domains in Year 1 before specializing.' };
}

// ─── Components ───────────────────────────────────────────────────────────────
function ScaleQuestion({ q, value, onChange }: { q: Question; value: number; onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>{q.scaleMin}</span>
                <span>{q.scaleMax}</span>
            </div>
            <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all font-black text-sm ${value === n ? 'border-primary bg-primary text-white shadow-md shadow-primary/25' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-primary/40'}`}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function AssessmentPage() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [sectionIdx, setSectionIdx] = useState(0);
    const [qIdx, setQIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isComplete, setIsComplete] = useState(false);
    const [saving, setSaving] = useState(false);

    const section = SECTIONS[sectionIdx];
    const question = section.questions[qIdx];
    const totalQuestions = SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
    const answeredTotal = Object.keys(answers).length;
    const globalProgress = Math.round((answeredTotal / totalQuestions) * 100);

    const Icon = section.icon;
    const currentAnswer = answers[question.id];

    const setAnswer = (val: any) => setAnswers(prev => ({ ...prev, [question.id]: val }));

    const goNext = () => {
        if (qIdx < section.questions.length - 1) {
            setQIdx(q => q + 1);
        } else if (sectionIdx < SECTIONS.length - 1) {
            setSectionIdx(s => s + 1);
            setQIdx(0);
        } else {
            setIsComplete(true);
        }
    };

    const goPrev = () => {
        if (qIdx > 0) {
            setQIdx(q => q - 1);
        } else if (sectionIdx > 0) {
            setSectionIdx(s => s - 1);
            setQIdx(SECTIONS[sectionIdx - 1].questions.length - 1);
        }
    };

    const handleFinish = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const track = computeResult(answers);

            const updatedUserData = {
                ...user,
                careerTrack: track.title,
                careerTrackEmoji: track.emoji,
                assessmentResults: answers,
                assessmentCompleted: true
            };

            await updateUser(updatedUserData);

            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 1500));
            setSaving(false);
            navigate('/student/dashboard');
        } catch (error) {
            console.error('Failed to save assessment:', error);
            alert('Failed to save assessment results. Please try again.');
            setSaving(false);
        }
    };

    const result = computeResult(answers);

    // ── Completion Screen ──────────────────────────────────────────────────────
    if (isComplete) {
        return (
            <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                <div className="max-w-2xl w-full space-y-6">
                    {/* Confetti-like header */}
                    <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-20 w-20 rounded-3xl bg-gradient-nmims mx-auto flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
                            <Trophy className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Assessment Complete!</h1>
                        <p className="text-slate-500 font-medium">We've analyzed your responses. Here is your initial Campus2Career profile.</p>
                    </div>

                    {/* Career Track Result - PREMIUM CARD */}
                    <div className="relative group animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-violet-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-2xl">
                            <div className={`${result.color} p-8 text-white relative overflow-hidden`}>
                                <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
                                <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-black/10 rounded-full blur-3xl" />

                                <div className="relative flex flex-col items-center text-center space-y-4">
                                    <span className="text-7xl animate-bounce duration-[2000ms]">{result.emoji}</span>
                                    <div>
                                        <p className="text-white/70 text-xs font-black uppercase tracking-[0.3em] mb-1">Your Projected Track</p>
                                        <h2 className="text-4xl font-black tracking-tighter">{result.title}</h2>
                                    </div>
                                    <p className="max-w-md text-white/90 text-sm font-medium leading-relaxed">
                                        {result.desc}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 grid sm:grid-cols-3 gap-6 bg-white">
                                {[
                                    { label: 'Primary Interest', value: result.title.split(' Track')[0], icon: Target, color: 'text-primary', bg: 'bg-primary/5' },
                                    { label: 'Working Style', value: answers['p_2'] === 'introvert' ? 'Deep Worker' : answers['p_2'] === 'extrovert' ? 'Collaborator' : 'Versatile', icon: BrainCircuit, color: 'text-violet-600', bg: 'bg-violet-50' },
                                    { label: 'Core Strength', value: answers['b_2'] === 'problem_solver' ? 'Logic' : answers['b_2'] === 'communicator' ? 'Communication' : 'Innovation', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50' },
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className={`h-10 w-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                                            <item.icon className={`h-5 w-5 ${item.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="font-black text-slate-800">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Progress Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {SECTIONS.map(s => {
                            const SIcon = s.icon;
                            return (
                                <div key={s.id} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-4 flex flex-col items-center gap-2">
                                    <div className={`h-8 w-8 ${s.bgColor} rounded-lg flex items-center justify-center`}>
                                        <SIcon className={`h-4 w-4 ${s.color}`} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{s.title.split(' ')[0]}</p>
                                        <div className="flex gap-1 mt-1 justify-center">
                                            {s.questions.map((_, i) => (
                                                <div key={i} className="h-1 w-2 rounded-full bg-green-500" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-[1200ms]">
                        <button
                            onClick={handleFinish}
                            disabled={saving}
                            className="w-full py-5 bg-slate-900 text-white font-black rounded-[2rem] text-lg flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {saving ? (
                                <span className="relative z-10 flex items-center gap-3">
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Synchronizing Profile...
                                </span>
                            ) : (
                                <span className="relative z-10 flex items-center gap-3">
                                    Unlock My Dashboard <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>

                        <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
                            NMIMS HYDERABAD • CAMPUS2CAREER INSIGHTS ENGINE
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Question Screen ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            {/* ── Header ── */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-nmims flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-black text-primary text-sm tracking-tight">CAMPUS2CAREER</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{answeredTotal}/{totalQuestions} answered</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>

                {/* Global Progress */}
                <div className="h-1 bg-slate-100">
                    <div
                        className="h-full bg-gradient-nmims transition-all duration-500"
                        style={{ width: `${globalProgress}%` }}
                    />
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center py-8 px-4">
                <div className="w-full max-w-2xl space-y-5">

                    {/* Section Header */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                        {/* Section Tabs */}
                        <div className="flex gap-1 flex-1 overflow-x-auto">
                            {SECTIONS.map((s, i) => {
                                const SIcon = s.icon;
                                const done = i < sectionIdx;
                                const active = i === sectionIdx;
                                return (
                                    <div key={s.id}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all
                                            ${active ? `${s.bgColor} ${s.color}` :
                                                done ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>
                                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <SIcon className="h-3.5 w-3.5" />}
                                        {s.title.split(' ')[0]}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question</p>
                            <p className="font-black text-slate-700">{qIdx + 1}/{section.questions.length}</p>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/80 overflow-hidden">

                        {/* Card Header */}
                        <div className={`p-5 flex items-center gap-4 border-b border-slate-100`}>
                            <div className={`h-12 w-12 ${section.bgColor} rounded-2xl flex items-center justify-center shrink-0`}>
                                <Icon className={`h-6 w-6 ${section.color}`} />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${section.color}`}>{section.title}</p>
                                <p className="text-xs text-slate-400 font-medium">{section.subtitle}</p>
                            </div>
                        </div>

                        {/* Question Body */}
                        <div className="p-6 sm:p-8">
                            <h3 className="text-lg font-black text-slate-900 leading-snug mb-1">
                                {question.text}
                            </h3>
                            {question.subtext && (
                                <p className="text-sm text-slate-400 font-medium mb-5">{question.subtext}</p>
                            )}

                            <div className="mt-6 space-y-2.5">
                                {question.type === 'single' && question.options?.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setAnswer(opt.value)}
                                        className={`w-full p-4 rounded-xl text-left border-2 transition-all flex items-center gap-3 group
                                            ${currentAnswer === opt.value
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                                    >
                                        {opt.emoji && (
                                            <span className="text-xl shrink-0">{opt.emoji}</span>
                                        )}
                                        <span className={`text-sm font-bold ${currentAnswer === opt.value ? 'text-primary' : 'text-slate-700'}`}>
                                            {opt.label}
                                        </span>
                                        {currentAnswer === opt.value && (
                                            <CheckCircle2 className="h-4 w-4 text-primary ml-auto shrink-0" />
                                        )}
                                    </button>
                                ))}

                                {question.type === 'scale' && (
                                    <ScaleQuestion
                                        q={question}
                                        value={currentAnswer || 0}
                                        onChange={v => setAnswer(v)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="px-6 sm:px-8 pb-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={goPrev}
                                disabled={sectionIdx === 0 && qIdx === 0}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </button>

                            <div className="flex gap-1">
                                {section.questions.map((_, i) => (
                                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === qIdx ? 'w-5 bg-primary' : answers[section.questions[i].id] !== undefined ? 'w-2 bg-green-400' : 'w-2 bg-slate-200'}`} />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={goNext}
                                disabled={currentAnswer === undefined || currentAnswer === null || currentAnswer === 0}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed
                                    ${sectionIdx === SECTIONS.length - 1 && qIdx === section.questions.length - 1
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                                        : 'bg-primary hover:bg-primary-dark text-white shadow-primary/25'}`}
                            >
                                {sectionIdx === SECTIONS.length - 1 && qIdx === section.questions.length - 1
                                    ? <><BarChart3 className="h-4 w-4" /> See Results</>
                                    : <>Next <ChevronRight className="h-4 w-4" /></>
                                }
                            </button>
                        </div>
                    </div>

                    {/* Skip Note */}
                    <p className="text-center text-xs text-slate-400 font-medium">
                        <Zap className="h-3.5 w-3.5 inline mb-0.5 mr-1 text-amber-400" />
                        Your responses power your AI-driven career roadmap. Be honest for best results!
                    </p>
                </div>
            </main>
        </div>
    );
}
