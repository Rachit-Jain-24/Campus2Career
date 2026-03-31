import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutButton } from '../../components/ui/LogoutButton';
import {
    User, Phone, MapPin, Home, BookOpen,
    Github, Linkedin, Code2, Link as LinkIcon,
    ChevronRight, ChevronLeft, CheckCircle2,
    Sparkles, GraduationCap, Heart, Plus, X,
    Upload, Star, Laptop, Languages, Trophy, Briefcase, Trash2,
    AlertCircle, Target, Award, Rocket, Check, Flag
} from 'lucide-react';
import { AddProjectModal, AddInternshipModal } from '../../components/ui/ExperienceModals';
import { Button } from '../../components/ui/Button';
import { generateStudentBio } from '../../lib/aiService';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
    // Personal
    fullName: string;
    phone: string;
    hometown: string;
    state: string;
    // Academic
    program: string;
    division: string;
    rollNo: string;
    cgpa: string;
    backlog: string;
    currentSemester: string;
    class12Board: string;
    class10Board: string;
    class12Percent: string;
    class10Percent: string;
    // Online Presence
    githubUrl: string;
    linkedinUrl: string;
    leetcodeUrl: string;
    portfolioUrl: string;
    // Languages
    languages: string[];
    // Skills
    knownTools: string[];
    // Extra-curriculars
    hobbies: string[];
    clubs: string[];
    // Experience & Portfolio
    projects: { id: string; title: string; description: string; tags: string[] }[];
    internships: { id: string; company: string; role: string; period: string; description: string }[];
    // Goals
    shortTermGoal: string;
    longTermGoal: string;
    // About
    bio: string;
}

const PROGRAMS = [
    'B.Tech CSE',
    'B.Tech CSDS',
    'B.Tech CSE (AI/ML)',
    'B.Tech IT',
    'B.Tech IT (Blockchain)',
    'B.Tech ECE',
    'B.Tech Mechanical',
    'B.Tech Civil',
    'B.Tech Chemical',
    'B.Tech Electrical',
];

const DIVISIONS = ['A', 'B', 'C', 'D', 'E'];
const SCHOOL_BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Other'];

const TOOLS_SUGGESTIONS = [
    'Python', 'Java', 'C++', 'JavaScript', 'React.js', 'Node.js', 
    'SQL', 'Git', 'Docker', 'AWS', 'Figma', 'Tableau'
];

const HOBBY_SUGGESTIONS = [
    'Competitive Programming', 'Open Source', 'Reading', 'Music', 
    'Gaming', 'Digital Art', 'Sports', 'Photography'
];

const CLUB_SUGGESTIONS = [
    'Coding Club', 'Robotics Club', 'GDSC', 'E-Cell', 'NSS', 
    'Drama Club', 'Music Society', 'Sports Committee'
];

const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Telugu', 'Tamil', 'Marathi', 'Gujarati', 'Bengali', 'Kannada', 'French', 'German'];

const SHORT_TERM_GOALS = [
    'Improve CGPA at least by 0.5',
    'Build a full-stack project from scratch',
    'Solve 200+ LeetCode problems',
    'Secure a paid internship',
    'Master technical interviewing skills',
    'Learn a new framework (React/Next.js)'
];

const LONG_TERM_GOALS = [
    'FAANG / Dream Product Company Role',
    'MS / Masters Abroad',
    'Entrepreneurship / Start my own venture',
    'Cybersecurity Specialist Role',
    'AI / Machine Learning Engineer',
    'Data Scientist / Analytics Lead'
];

const STEPS = [
    { id: 0, label: 'Profile', icon: User },
    { id: 1, label: 'Academic', icon: GraduationCap },
    { id: 2, label: 'Links', icon: LinkIcon },
    { id: 3, label: 'Portfolio', icon: Laptop },
    { id: 4, label: 'Goals', icon: Rocket },
];

function TagInput({
    label, icon: Icon, tags, suggestions, onAdd, onRemove, placeholder, colorClass
}: {
    label: string; icon: any; tags: string[];
    suggestions: string[]; onAdd: (t: string) => void;
    onRemove: (t: string) => void; placeholder: string;
    colorClass?: string;
}) {
    const [input, setInput] = useState('');
    const filtered = suggestions.filter(s => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${colorClass || 'text-primary'}`} /> {label}
            </label>
            <div className="flex flex-wrap gap-2 min-h-[40px]">
                {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 shadow-sm hover:border-primary transition-all group">
                        {t}
                        <button type="button" onClick={() => onRemove(t)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="h-3 w-3" /></button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2 relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && input.trim()) {
                            e.preventDefault();
                            onAdd(input.trim());
                            setInput('');
                        }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary transition-all outline-none"
                />
                <button
                    type="button"
                    onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(''); } }}
                    className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            {filtered.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {filtered.slice(0, 6).map(s => (
                        <button
                            key={s} type="button"
                            onClick={() => onAdd(s)}
                            className="text-[10px] font-black text-slate-400 bg-white border border-slate-100 px-3 py-1 rounded-lg hover:border-primary hover:text-primary transition-all"
                        >
                            + {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProfileSetupPage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);

    // Modal states
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);

    // ── Year / Semester helpers (computed at component level, not inside JSX) ──
    const currentYr = user?.currentYear || 1;

    const [data, setData] = useState<ProfileData>({
        fullName: user?.name || '',
        phone: '',
        hometown: '',
        state: '',
        program: user?.branch || '',
        division: '',
        rollNo: user?.rollNo || '',
        cgpa: '',
        backlog: '0',
        currentSemester: '',
        class12Board: '',
        class10Board: '',
        class12Percent: '',
        class10Percent: '',
        githubUrl: '',
        linkedinUrl: '',
        leetcodeUrl: '',
        portfolioUrl: '',
        languages: ['English'],
        knownTools: [],
        hobbies: [],
        clubs: [],
        projects: [],
        internships: [],
        shortTermGoal: '',
        longTermGoal: '',
        bio: '',
    });

    const set = (key: keyof ProfileData, val: any) => setData(prev => ({ ...prev, [key]: val }));

    const addTag = (key: 'languages' | 'knownTools' | 'hobbies' | 'clubs', val: string) => {
        const arr = data[key] as string[];
        if (!arr.includes(val)) set(key, [...arr, val]);
    };
    const removeTag = (key: 'languages' | 'knownTools' | 'hobbies' | 'clubs', val: string) => {
        set(key, (data[key] as string[]).filter(x => x !== val));
    };

    const readinessScore = useMemo(() => {
        let score = 0;
        if (data.fullName.length > 3) score += 5;
        if (data.phone.length >= 10) score += 5;
        if (data.bio.length > 20) score += 10;
        if (data.cgpa && parseFloat(data.cgpa) > 0) score += 10;
        if (data.githubUrl.includes('github.com')) score += 15;
        if (data.linkedinUrl.includes('linkedin.com')) score += 15;
        if (data.leetcodeUrl.includes('leetcode.com')) score += 15;
        if (data.projects.length > 0) score += 15;
        return Math.min(100, score);
    }, [data]);

    const handleGenerateBio = async () => {
        setIsGeneratingBio(true);
        try {
            const bio = await generateStudentBio({
                name: data.fullName || user?.name || "Student",
                program: data.program || "Engineering",
                year: user?.currentYear || 1,
                skills: data.knownTools.length > 0 ? data.knownTools : ["Technology", "Problem Solving"],
                interests: data.languages.length > 0 ? data.languages : ["Innovation"]
            });
            set('bio', bio);
        } catch (error) {
            console.error("Bio Generation Failed:", error);
        } finally {
            setIsGeneratingBio(false);
        }
    };

    const handleComplete = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const leetcodeHandle = data.leetcodeUrl
                ? data.leetcodeUrl.replace(/\/$/, '').split('/').pop() || ''
                : '';

            const updatedUserData = {
                ...user,
                // Core identity
                name: data.fullName,
                phone: data.phone,
                location: `${data.hometown}, ${data.state}`,
                bio: data.bio,
                branch: data.program,
                rollNo: data.rollNo,
                // Skills & Interests — saved as TOP-LEVEL for Dashboard/SkillGap to read
                cgpa: data.cgpa,
                techSkills: data.knownTools,
                clubs: data.clubs,
                hobbies: data.hobbies,
                languages: data.languages,
                interests: [...data.knownTools, ...data.languages],
                goals: [data.shortTermGoal, data.longTermGoal].filter(Boolean),
                // Experience
                projects: data.projects,
                internships: data.internships,
                // Social links — BOTH top-level and nested for compatibility
                githubUrl: data.githubUrl,
                linkedinUrl: data.linkedinUrl,
                portfolioUrl: data.portfolioUrl,
                leetcode: leetcodeHandle,
                // Academic data nested for records
                academicData: {
                    cgpa: data.cgpa,
                    backlog: data.backlog,
                    class12: { board: data.class12Board, percent: data.class12Percent },
                    class10: { board: data.class10Board, percent: data.class10Percent },
                    division: data.division,
                },
                // Onboarding flags
                profileCompleted: true,
                // Assessment already done in Career Discovery — keep as true
                assessmentCompleted: user.assessmentCompleted ?? true,
            };

            await updateUser(updatedUserData);
            // Go directly to dashboard — assessment step is no longer separate
            navigate('/student/dashboard');
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Something went wrong. Please check your connection.');
        } finally {
            setIsSaving(false);
        }
    };

    const canProceed = () => {
        if (step === 0) return data.fullName && data.phone.length >= 10 && data.hometown;
        if (step === 1) return data.program && data.rollNo && data.class10Percent && data.class12Percent;
        if (step === 2) return data.githubUrl && data.linkedinUrl && data.leetcodeUrl;
        if (step === 3) return true; // Projects are optional — Year 1 especially may have none
        if (step === 4) return data.shortTermGoal && data.longTermGoal;
        return true;
    };

    const renderProgressBar = () => {
        return (
            <div className="flex items-center justify-between mb-12 px-2 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                {STEPS.map((s) => {
                    const StepIcon = s.icon;
                    return (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group" onClick={() => step > s.id && setStep(s.id)}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm border-2 ${
                                step === s.id ? 'bg-primary border-primary text-white scale-110' : 
                                step > s.id ? 'bg-green-500 border-green-500 text-white' : 
                                'bg-white border-slate-200 text-slate-400'
                            }`}>
                                {step > s.id ? <Check className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                step === s.id ? 'text-primary' : 'text-slate-400'
                            }`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 py-4 px-6 fixed top-0 w-full z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-black text-primary tracking-tighter text-xl">CAMPUS2CAREER</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Profile Readiness</p>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                             <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${readinessScore}%` }} />
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            <main className="flex-1 flex max-w-5xl mx-auto w-full pt-24 pb-12 px-6 gap-8">
                {/* ── Sidebar ── */}
                <aside className="hidden lg:block w-64 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-md relative group">
                            <User className="h-10 w-10 text-slate-300" />
                            <div className="absolute inset-0 bg-primary/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Upload className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-black text-slate-800 line-clamp-1">{data.fullName || user?.name || 'Your Name'}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.program || 'Student'}</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <div className="text-center flex-1">
                                <p className="text-lg font-black text-primary">{readinessScore}%</p>
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Complete</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100 mx-4" />
                            <div className="text-center flex-1">
                                <p className="text-lg font-black text-slate-800">{data.projects.length}</p>
                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Projects</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-[2rem] space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-4 w-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Pro Tip</p>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            A profile score above <span className="text-primary font-bold">80%</span> increases your placement visibility by <span className="text-green-600 font-bold">3x</span>.
                        </p>
                    </div>
                </aside>

                {/* ── Content ── */}
                <div className="flex-1 max-w-2xl">
                    {renderProgressBar()}

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 sm:p-12 relative overflow-hidden animate-in fade-in zoom-in duration-500">
                        {/* Step Icon Backdrop */}
                        <div className="absolute -top-12 -right-12 opacity-[0.03] scale-[4] rotate-12 pointer-events-none text-primary">
                            {(() => { 
                                const StepIcon = STEPS[step]?.icon; 
                                return StepIcon ? <StepIcon /> : <Sparkles />; 
                            })()}
                        </div>

                        {/* ── Step 0: Personal ── */}
                        {step === 0 && (
                            <div className="space-y-8 relative">
                                <div className="text-center space-y-2 mb-4">
                                    <h2 className="text-3xl font-black text-slate-900">Personal Details</h2>
                                    <p className="text-slate-500 text-sm">Let recruiters know who you are.</p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-primary" /> Full Name
                                        </label>
                                        <input className="input-nmims" placeholder="Enter Full Name" value={data.fullName} onChange={e => set('fullName', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-primary" /> Phone
                                        </label>
                                        <input className="input-nmims" placeholder="10-digit Mobile" value={data.phone} onChange={e => set('phone', e.target.value)} maxLength={10} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Home className="h-3.5 w-3.5 text-primary" /> Hometown
                                        </label>
                                        <input className="input-nmims" placeholder="City" value={data.hometown} onChange={e => set('hometown', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-primary" /> State
                                        </label>
                                        <input className="input-nmims" placeholder="State" value={data.state} onChange={e => set('state', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen className="h-3.5 w-3.5 text-primary" /> Professional Bio
                                        </label>
                                        <button 
                                            className={`text-[10px] text-primary font-bold flex items-center gap-1 hover:underline disabled:opacity-50 disabled:animate-pulse`}
                                            onClick={handleGenerateBio}
                                            disabled={isGeneratingBio}
                                        >
                                            <Sparkles className={`h-3 w-3 ${isGeneratingBio ? 'animate-spin' : ''}`} /> 
                                            {isGeneratingBio ? 'Generating...' : 'AI Suggest'}
                                        </button>
                                    </div>
                                    <textarea className="input-nmims h-24 resize-none pt-4" placeholder="Briefly describe your passions and professional interests..." value={data.bio} onChange={e => set('bio', e.target.value)} />
                                </div>
                                <TagInput label="Languages" icon={Languages} tags={data.languages} suggestions={LANGUAGE_OPTIONS} onAdd={v => addTag('languages', v)} onRemove={v => removeTag('languages', v)} placeholder="Add Language..." colorClass="text-green-500" />
                            </div>
                        )}

                        {/* ── Step 1: Academics ── */}
                        {step === 1 && (
                            <div className="space-y-8 relative">
                                <div className="text-center space-y-2 mb-4">
                                    <h2 className="text-3xl font-black text-slate-900">Academic History</h2>
                                    <p className="text-slate-500 text-sm">NMIMS internal records and baseline.</p>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Branch</label>
                                        <select className="input-nmims" value={data.program} onChange={e => set('program', e.target.value)}>
                                            <option value="">Select Branch</option>
                                            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Division</label>
                                        <select className="input-nmims" value={data.division} onChange={e => set('division', e.target.value)}>
                                            <option value="">Select Division</option>
                                            {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Semester</label>
                                        <select className="input-nmims" value={data.currentSemester} onChange={e => set('currentSemester', e.target.value)}>
                                            <option value="">Select Semester</option>
                                            {(() => {
                                                const yr = user?.currentYear || 1;
                                                const sems = yr === 1 ? [['1', 'Semester 1'], ['2', 'Semester 2']]
                                                    : yr === 2 ? [['3', 'Semester 3'], ['4', 'Semester 4']]
                                                    : yr === 3 ? [['5', 'Semester 5'], ['6', 'Semester 6']]
                                                    : [['7', 'Semester 7'], ['8', 'Semester 8']];
                                                return sems.map(([val, label]) => (
                                                    <option key={val} value={val}>{label}</option>
                                                ));
                                            })()}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SAP / Roll Number</label>
                                        <input className="input-nmims" placeholder="e.g. 70572212345" value={data.rollNo} onChange={e => set('rollNo', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current CGPA</label>
                                        <input className="input-nmims" type="number" step="0.01" max="10" placeholder="e.g. 8.45" value={data.cgpa} onChange={e => set('cgpa', e.target.value)} />
                                    </div>
                                </div>

                                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-6">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-primary" />
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Baseline Education</p>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">12th Board</label>
                                            <select className="input-nmims" value={data.class12Board} onChange={e => set('class12Board', e.target.value)}>
                                                <option value="">Select Board</option>
                                                {SCHOOL_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">10th Board</label>
                                            <select className="input-nmims" value={data.class10Board} onChange={e => set('class10Board', e.target.value)}>
                                                <option value="">Select Board</option>
                                                {SCHOOL_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class 12 %</label>
                                            <input className="input-nmims" placeholder="85.4" type="number" value={data.class12Percent} onChange={e => set('class12Percent', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class 10 %</label>
                                            <input className="input-nmims" placeholder="92.1" type="number" value={data.class10Percent} onChange={e => set('class10Percent', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Connections ── */}
                        {step === 2 && (
                            <div className="space-y-8 relative">
                                <div className="text-center space-y-2 mb-4">
                                    <h2 className="text-3xl font-black text-slate-900">Online Presence</h2>
                                    <p className="text-slate-500 text-sm">Enter your username — we'll build the link automatically.</p>
                                </div>

                                <div className="space-y-5">
                                    {[
                                        {
                                            id: 'githubUrl',
                                            icon: Github,
                                            label: 'GitHub',
                                            base: 'https://github.com/',
                                            placeholder: 'your-username',
                                            color: 'text-slate-800',
                                            bg: 'bg-slate-800/5',
                                            border: 'border-slate-200',
                                            required: true,
                                        },
                                        {
                                            id: 'linkedinUrl',
                                            icon: Linkedin,
                                            label: 'LinkedIn',
                                            base: 'https://linkedin.com/in/',
                                            placeholder: 'firstname-lastname',
                                            color: 'text-blue-600',
                                            bg: 'bg-blue-50',
                                            border: 'border-blue-100',
                                            required: true,
                                        },
                                        {
                                            id: 'leetcodeUrl',
                                            icon: Code2,
                                            label: 'LeetCode',
                                            base: 'https://leetcode.com/u/',
                                            placeholder: 'your-username',
                                            color: 'text-orange-500',
                                            bg: 'bg-orange-50',
                                            border: 'border-orange-100',
                                            required: true,
                                        },
                                        {
                                            id: 'portfolioUrl',
                                            icon: LinkIcon,
                                            label: 'Portfolio',
                                            base: 'https://',
                                            placeholder: 'yoursite.vercel.app',
                                            color: 'text-purple-600',
                                            bg: 'bg-purple-50',
                                            border: 'border-purple-100',
                                            required: false,
                                        },
                                    ].map(link => {
                                        const LinkIconComp = link.icon;
                                        // Extract username from stored URL for display
                                        const storedUrl: string = (data as any)[link.id] || '';
                                        const displayValue = storedUrl.startsWith(link.base)
                                            ? storedUrl.slice(link.base.length).replace(/\/$/, '')
                                            : storedUrl;
                                        const isConnected = displayValue.length > 0;

                                        return (
                                            <div key={link.id} className={`rounded-2xl bg-white border ${link.border} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
                                                {/* Header row */}
                                                <div className={`flex items-center gap-3 px-4 py-3 ${link.bg} border-b ${link.border}`}>
                                                    <div className={`p-1.5 rounded-lg bg-white ${link.color} shadow-sm`}>
                                                        <LinkIconComp className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-800">{link.label}</span>
                                                    {!link.required && (
                                                        <span className="ml-auto text-[9px] font-black text-slate-400 uppercase tracking-widest">Optional</span>
                                                    )}
                                                    {isConnected && (
                                                        <span className="ml-auto flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-widest">
                                                            <Check className="h-2.5 w-2.5" /> Connected
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Username input with prefix */}
                                                <div className="flex items-center">
                                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-3.5 border-r border-slate-100 whitespace-nowrap select-none">
                                                        {link.base}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        placeholder={link.placeholder}
                                                        value={displayValue}
                                                        onChange={e => {
                                                            const handle = e.target.value.trim();
                                                            // For portfolio, store as-is with https:// prefix
                                                            if (link.id === 'portfolioUrl') {
                                                                set(link.id as any, handle ? (handle.startsWith('http') ? handle : link.base + handle) : '');
                                                            } else {
                                                                set(link.id as any, handle ? link.base + handle : '');
                                                            }
                                                        }}
                                                        className="flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-800 font-medium outline-none placeholder:text-slate-300"
                                                    />
                                                </div>
                                                {/* Preview URL */}
                                                {isConnected && (
                                                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                                                        <a
                                                            href={(data as any)[link.id]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`text-[10px] font-mono ${link.color} hover:underline break-all`}
                                                        >
                                                            {(data as any)[link.id]}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">Make sure all your profiles are <strong>public</strong>. Recruiters will skip profiles they can't access.</p>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Portfolio ── */}
                        {step === 3 && (() => {
                            const yr = user?.currentYear || 1;
                            const sem = parseInt(data.currentSemester || '0');
                            const isSem8 = yr === 4 && sem === 8;
                            const isYear4 = yr === 4;

                            const ProjectCard = ({ p, i }: { p: any; i: number }) => (
                                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                            <Rocket className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800">{p.title}</h4>
                                            <p className="text-[10px] text-slate-500 line-clamp-1">{p.description}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => set('projects', data.projects.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            );

                            return (
                            <div className="space-y-8 relative">
                                <div className="text-center space-y-2 mb-4">
                                    <h2 className="text-3xl font-black text-slate-900">Skills & Portfolio</h2>
                                    <p className="text-slate-500 text-sm">Show, don't just tell. Log your best work here.</p>
                                </div>

                                <TagInput label="Technical Tools" icon={Laptop} tags={data.knownTools} suggestions={TOOLS_SUGGESTIONS} onAdd={v => addTag('knownTools', v)} onRemove={v => removeTag('knownTools', v)} placeholder="Python, React, etc." colorClass="text-blue-500" />

                                {/* ── 4th Year: Capstone (Sem 7 only) ── */}
                                {isYear4 && !isSem8 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                                            <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center shrink-0">
                                                <GraduationCap className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-indigo-900">Capstone Project — Sem 7</p>
                                                <p className="text-[10px] text-indigo-500 font-medium">Your interdisciplinary team project from 7th semester</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-indigo-500" /> Capstone Projects
                                            </p>
                                            <button onClick={() => setIsProjectModalOpen(true)} className="text-[10px] font-black text-indigo-600 hover:underline">+ Add Capstone</button>
                                        </div>
                                        <div className="grid gap-3">
                                            {data.projects.length > 0
                                                ? data.projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)
                                                : (
                                                    <div className="p-10 text-center border-2 border-dashed border-indigo-100 rounded-3xl bg-indigo-50/30">
                                                        <GraduationCap className="h-8 w-8 text-indigo-200 mx-auto mb-2" />
                                                        <p className="text-xs text-indigo-400 font-bold">Add your Capstone Project from Sem 7</p>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}

                                {/* ── 4th Year: Major Project (Sem 8 only) ── */}
                                {isSem8 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-100">
                                            <div className="h-8 w-8 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
                                                <Flag className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-rose-900">Major Project — Sem 8</p>
                                                <p className="text-[10px] text-rose-400 font-medium">Your final year major project (thesis / research project)</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Rocket className="h-4 w-4 text-rose-500" /> Major Project
                                            </p>
                                            <button onClick={() => setIsProjectModalOpen(true)} className="text-[10px] font-black text-rose-600 hover:underline">+ Add Major Project</button>
                                        </div>
                                        <div className="grid gap-3">
                                            {data.projects.length > 0
                                                ? data.projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)
                                                : (
                                                    <div className="p-10 text-center border-2 border-dashed border-rose-100 rounded-3xl bg-rose-50/30">
                                                        <Flag className="h-8 w-8 text-rose-200 mx-auto mb-2" />
                                                        <p className="text-xs text-rose-400 font-bold">Add your Final Year Major Project</p>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Year 1–3: Regular Projects ── */}
                                {!isYear4 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-indigo-500" /> Featured Projects
                                                {yr === 1 && (
                                                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Optional</span>
                                                )}
                                            </p>
                                            <button onClick={() => setIsProjectModalOpen(true)} className="text-[10px] font-black text-primary hover:underline">+ Add New</button>
                                        </div>
                                        {yr === 1 && (
                                            <p className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                                <Sparkles className="h-3 w-3 text-primary shrink-0" />
                                                1st year? No projects yet is completely fine — add any personal or college mini-project if you have one, or skip ahead.
                                            </p>
                                        )}
                                        <div className="grid gap-3">
                                            {data.projects.length > 0
                                                ? data.projects.map((p, i) => <ProjectCard key={p.id} p={p} i={i} />)
                                                : (
                                                    <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl space-y-2">
                                                        <p className="text-xs text-slate-400 font-bold">
                                                            {yr === 1 ? "No projects yet — that's okay!" : 'No projects added yet.'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-300 font-medium">
                                                            {yr === 1 ? "Add one if you've built something, or hit Next to skip." : 'Add projects to boost your profile score.'}
                                                        </p>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                )}


                                {/* ── Internships (Year 3+) ── */}
                                {yr >= 3 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-emerald-500" /> Internships
                                            </p>
                                            <button onClick={() => setIsInternshipModalOpen(true)} className="text-[10px] font-black text-primary hover:underline">+ Log Work</button>
                                        </div>
                                        <div className="grid gap-3">
                                            {data.internships.length > 0 ? data.internships.map((int, i) => (
                                                <div key={int.id} className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-emerald-900">{int.role} @ {int.company}</h4>
                                                            <p className="text-[10px] text-emerald-600 font-medium">{int.period}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => set('internships', data.internships.filter((_, idx) => idx !== i))} className="text-emerald-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            )) : (
                                                <div className="p-10 text-center border-2 border-dashed border-emerald-100 rounded-3xl bg-emerald-50/20">
                                                    <Briefcase className="h-8 w-8 text-emerald-200 mx-auto mb-2" />
                                                    <p className="text-xs text-emerald-400 font-bold">No internships logged yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="pt-6 border-t border-slate-100">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <TagInput label="Hobbies & Interests" icon={Heart} tags={data.hobbies} suggestions={HOBBY_SUGGESTIONS} onAdd={v => addTag('hobbies', v)} onRemove={v => removeTag('hobbies', v)} placeholder="Reading, Gaming..." colorClass="text-rose-500" />
                                        <TagInput label="Clubs & Societies" icon={Star} tags={data.clubs} suggestions={CLUB_SUGGESTIONS} onAdd={v => addTag('clubs', v)} onRemove={v => removeTag('clubs', v)} placeholder="GDSC, NSS..." colorClass="text-amber-500" />
                                    </div>
                                </div>
                            </div>
                            );
                        })()}

                        {/* ── Step 4: Motivation ── */}
                        {step === 4 && (
                            <div className="space-y-8 relative">
                                <div className="text-center space-y-2 mb-4">
                                    <h2 className="text-3xl font-black text-slate-900">Career Vision</h2>
                                    <p className="text-slate-500 text-sm">Setting targets helps us tailor your daily roadmaps.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Target className="h-4 w-4 text-primary" /> Short-Term Goal
                                        </label>
                                        <div className="grid gap-2">
                                            {SHORT_TERM_GOALS.map(goal => (
                                                <button key={goal} onClick={() => set('shortTermGoal', goal)} className={`p-4 rounded-2xl text-left text-xs font-bold transition-all border-2 ${data.shortTermGoal === goal ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 bg-slate-50/50 text-slate-500 hover:border-slate-200'}`}>{goal}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Flag className="h-4 w-4 text-indigo-500" /> Long-Term Vision
                                        </label>
                                        <div className="grid gap-2">
                                            {LONG_TERM_GOALS.map(goal => (
                                                <button key={goal} onClick={() => set('longTermGoal', goal)} className={`p-4 rounded-2xl text-left text-xs font-bold transition-all border-2 ${data.longTermGoal === goal ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-50 bg-slate-50/50 text-slate-500 hover:border-slate-200'}`}>{goal}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Footer Nav ── */}
                        <div className="mt-12 flex gap-4">
                            <Button variant="outline" className="flex-1 py-4" onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)} disabled={isSaving}>
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            {step < STEPS.length - 1 ? (
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={!canProceed()}
                                    className="flex-[2] py-4 bg-primary text-white font-black text-sm rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={!canProceed() || isSaving}
                                    className="flex-[2] py-4 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? "Finalizing..." : "Finish Setup"} <Sparkles className="w-4 h-4 text-yellow-400" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <AddProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={(project) => set('projects', [...data.projects, project])} />
            <AddInternshipModal isOpen={isInternshipModalOpen} onClose={() => setIsInternshipModalOpen(false)} onSave={(internship) => set('internships', [...data.internships, internship])} />
            
            <footer className="py-8 text-center text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                NMIMS HYDERABAD • CAREER READINESS ENGINE • 2026
            </footer>
        </div>
    );
}
