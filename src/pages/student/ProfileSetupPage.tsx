import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogoutButton } from '../../components/ui/LogoutButton';
import {
    User, Phone, MapPin, Home, BookOpen,
    Github, Linkedin, Code2, Link as LinkIcon,
    ChevronRight, ChevronLeft, CheckCircle2,
    Sparkles, GraduationCap, Heart, Plus, X,
    Upload, Star, Laptop, Languages, Trophy, Briefcase, Trash2
} from 'lucide-react';
import { AddProjectModal, AddInternshipModal } from '../../components/ui/ExperienceModals';

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
    'B.Tech CSE', 'B.Tech CSE (AI/ML)', 'B.Tech CSE (Data Science)',
    'B.Tech CSE (IoT)', 'B.Tech IT', 'B.Tech ECE', 'B.Tech Mechanical',
    'BCA', 'BBA', 'B.Com', 'B.Sc (Other)'
];

const DIVISIONS = ['A', 'B', 'C', 'D'];

const SCHOOL_BOARDS = ['CBSE', 'ICSE', 'State Board (AP/TS)', 'IB', 'Other'];

const TOOLS_SUGGESTIONS = [
    'Python', 'Java', 'C++', 'JavaScript', 'HTML/CSS',
    'React', 'Node.js', 'SQL', 'Git', 'VS Code', 'MS Office',
    'Photoshop', 'Figma', 'Arduino', 'MATLAB'
];

const HOBBY_SUGGESTIONS = [
    'Reading', 'Music', 'Sports', 'Gaming', 'Art & Painting',
    'Photography', 'Cooking', 'Dancing', 'Writing', 'Traveling',
    'Volunteering', 'Yoga & Fitness'
];

const CLUB_SUGGESTIONS = [
    'Coding Club', 'Robotics Club', 'Drama Club', 'Music Club',
    'NSS', 'NCC', 'Sports Committee', 'Cultural Committee',
    'Technical Fest Committee', 'Literary Club', 'E-Cell', 'GDSC'
];

const LANGUAGE_OPTIONS = [
    'English', 'Hindi', 'Telugu', 'Tamil', 'Marathi',
    'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Punjabi'
];

const SHORT_TERM_GOALS = [
    'Improve my CGPA above 8.0',
    'Learn a programming language from scratch',
    'Complete a certification in my domain of interest',
    'Build my first project and put it on GitHub',
    'Get an internship by end of 2nd year',
    'Participate in a hackathon or coding competition',
];

const LONG_TERM_GOALS = [
    'Land a job at a top tech product company (FAANG/MNC)',
    'Pursue Masters abroad (MS/MBA)',
    'Start my own startup / entrepreneurship journey',
    'Get placed in a reputed service-based company',
    'Become a researcher / pursue PhD',
    'Work in the Government / PSU sector',
];

const STEPS = [
    { id: 0, label: 'Personal', icon: User },
    { id: 1, label: 'Academic', icon: GraduationCap },
    { id: 2, label: 'Profiles', icon: Laptop },
    { id: 3, label: 'Interests', icon: Heart },
    { id: 4, label: 'Goals', icon: Star },
];

function TagInput({
    label, icon: Icon, tags, suggestions, onAdd, onRemove, placeholder
}: {
    label: string; icon: any; tags: string[];
    suggestions: string[]; onAdd: (t: string) => void;
    onRemove: (t: string) => void; placeholder: string;
}) {
    const [input, setInput] = useState('');
    const filtered = suggestions.filter(s => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase()));

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" /> {label}
            </label>
            {/* Chips */}
            <div className="flex flex-wrap gap-2 min-h-[36px]">
                {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-full px-3 py-1">
                        {t}
                        <button type="button" onClick={() => onRemove(t)}><X className="h-3 w-3" /></button>
                    </span>
                ))}
            </div>
            {/* Input */}
            <div className="flex gap-2">
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
                    className="input-nmims flex-1 text-sm"
                />
                <button
                    type="button"
                    onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(''); } }}
                    className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
            {/* Suggestions */}
            {filtered.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {filtered.slice(0, 8).map(s => (
                        <button
                            key={s} type="button"
                            onClick={() => onAdd(s)}
                            className="text-[11px] font-bold text-slate-500 border border-dashed border-slate-300 px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-all"
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

    // Modal states
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);

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

    const handleComplete = async () => {
        if (!user) return;
        setIsSaving(true);

        try {
            // Construct the updated user object
            // In a real app, we'd have a separate 'profiles' collection, 
            // but for simplicity here we merge into the user doc or mock the save.
            const updatedUserData = {
                ...user,
                name: data.fullName,
                phone: data.phone,
                location: `${data.hometown}, ${data.state}`,
                bio: data.bio,
                branch: data.program,
                rollNo: data.rollNo,
                leetcode: data.leetcodeUrl ? data.leetcodeUrl.split('/').filter(Boolean).pop() : '',
                interests: data.knownTools,
                goals: [data.shortTermGoal, data.longTermGoal],
                projects: data.projects,
                internships: data.internships,
                assessmentResults: {
                    ...user.assessmentResults,
                    cgpa: data.cgpa,
                },
                // We mark that profile setup is done
                profileCompleted: true,
            };

            await updateUser(updatedUserData);

            // Artificial delay for UX
            await new Promise(r => setTimeout(r, 1500));
            navigate('/student/dashboard');
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const canProceed = () => {
        if (step === 0) {
            const isValidPhone = /^\d{10}$/.test(data.phone.replace(/\D/g, ''));
            return data.fullName && isValidPhone && data.hometown && data.state;
        }
        if (step === 1) return data.program && data.rollNo && data.class10Percent && data.class12Percent && data.class10Board && data.class12Board && ((user?.currentYear || 1) > 1 ? !!data.cgpa : true);
        if (step === 2) {
            const isValidGithub = !data.githubUrl || data.githubUrl.includes('github.com');
            const isValidLinkedin = !data.linkedinUrl || data.linkedinUrl.includes('linkedin.com');
            const isValidLeetcode = !data.leetcodeUrl || data.leetcodeUrl.includes('leetcode.com');

            return data.githubUrl && isValidGithub &&
                data.linkedinUrl && isValidLinkedin &&
                data.leetcodeUrl && isValidLeetcode &&
                data.portfolioUrl;
        }
        if (step === 3) return data.knownTools.length > 0 || data.hobbies.length > 0;
        if (step === 4) return data.shortTermGoal && data.longTermGoal;
        return true;
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            {/* ── Header ── */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gradient-nmims flex items-center justify-center">
                            <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <span className="font-black text-primary text-sm tracking-tight">CAMPUS2CAREER</span>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Profile Setup</p>
                        </div>
                    </div>

                    {/* Step Pills */}
                    <div className="hidden md:flex items-center gap-1">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.id} className="flex items-center gap-1">
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all
                                        ${step === s.id ? 'bg-primary text-white shadow-sm' :
                                            step > s.id ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                        {step > s.id ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                                        {s.label}
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`h-0.5 w-4 rounded-full ${step > s.id ? 'bg-green-300' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <LogoutButton />
                </div>

                {/* Mobile Progress Bar */}
                <div className="md:hidden h-1 bg-slate-100">
                    <div
                        className="h-full bg-gradient-nmims transition-all duration-500"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </header>

            {/* ── Main ── */}
            <main className="flex-1 flex items-start justify-center py-8 px-4">
                <div className="w-full max-w-2xl">

                    {/* Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/80 overflow-hidden">

                        {/* Card Header */}
                        <div className="bg-gradient-nmims p-6 text-white">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white/15 rounded-2xl flex items-center justify-center">
                                    {(() => { const S = STEPS[step].icon; return <S className="h-5 w-5" />; })()}
                                </div>
                                <div>
                                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Step {step + 1} of {STEPS.length}</p>
                                    <h2 className="text-xl font-black tracking-tight">
                                        {step === 0 && 'Personal Details'}
                                        {step === 1 && 'Academic Background'}
                                        {step === 2 && 'Online Presence'}
                                        {step === 3 && 'Skills & Interests'}
                                        {step === 4 && 'Career Goals'}
                                    </h2>
                                </div>
                            </div>
                            <p className="text-white/60 text-xs mt-2 font-medium">
                                {step === 0 && 'Tell us a bit about yourself. This helps personalize your Campus2Career experience.'}
                                {step === 1 && 'Your academic details help us tailor recommendations and track your progress.'}
                                {step === 2 && 'Connect your online profiles for a complete digital portfolio. (All optional)'}
                                {step === 3 && 'Add your tools, languages, hobbies and clubs — every detail counts!'}
                                {step === 4 && 'Set your short and long-term career goals. Your roadmap starts here.'}
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">

                            {/* ── Step 0: Personal ── */}
                            {step === 0 && (
                                <div className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5" /> Full Name *
                                            </label>
                                            <input className="input-nmims" placeholder="As per college records" value={data.fullName}
                                                onChange={e => set('fullName', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <Phone className="h-3.5 w-3.5" /> Phone Number *
                                            </label>
                                            <input className="input-nmims" placeholder="10 digit number" value={data.phone}
                                                onChange={e => set('phone', e.target.value)} type="tel" maxLength={15} />
                                            {data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, '')) && (
                                                <p className="text-[10px] text-red-500 font-bold px-1 mt-0.5">Please enter a valid 10-digit number</p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <Home className="h-3.5 w-3.5" /> Hometown *
                                            </label>
                                            <input className="input-nmims" placeholder="City / Town" value={data.hometown}
                                                onChange={e => set('hometown', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" /> State *
                                            </label>
                                            <input className="input-nmims" placeholder="e.g. Telangana" value={data.state}
                                                onChange={e => set('state', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <BookOpen className="h-3.5 w-3.5" /> About Yourself
                                        </label>
                                        <textarea
                                            rows={3}
                                            className="input-nmims resize-none"
                                            placeholder="Write a short bio about yourself — your background, what drives you, and what you hope to achieve at NMIMS..."
                                            value={data.bio}
                                            onChange={e => set('bio', e.target.value)}
                                        />
                                        <p className="text-[11px] text-slate-400">{data.bio.length}/300 characters</p>
                                    </div>

                                    <TagInput
                                        label="Languages Known"
                                        icon={Languages}
                                        tags={data.languages}
                                        suggestions={LANGUAGE_OPTIONS}
                                        onAdd={v => addTag('languages', v)}
                                        onRemove={v => removeTag('languages', v)}
                                        placeholder="Add language..."
                                    />
                                </div>
                            )}

                            {/* ── Step 1: Academic ── */}
                            {step === 1 && (
                                <div className="space-y-5">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Program *</label>
                                            <select className="input-nmims" value={data.program} onChange={e => set('program', e.target.value)}>
                                                <option value="">Select Program</option>
                                                {PROGRAMS.map(p => <option key={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Division</label>
                                            <select className="input-nmims" value={data.division} onChange={e => set('division', e.target.value)}>
                                                <option value="">Select Division</option>
                                                {DIVISIONS.map(d => <option key={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roll Number *</label>
                                            <input className="input-nmims" placeholder="e.g. C25001" value={data.rollNo}
                                                onChange={e => set('rollNo', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current CGPA {(user?.currentYear || 1) > 1 && '*'}</label>
                                            <input className="input-nmims" placeholder={((user?.currentYear || 1) === 1) ? "e.g. 8.5 (skip if Sem 1)" : "e.g. 8.5"} value={data.cgpa}
                                                onChange={e => set('cgpa', e.target.value)} type="number" step="0.1" min="0" max="10" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Backlogs</label>
                                            <select className="input-nmims" value={data.backlog} onChange={e => set('backlog', e.target.value)}>
                                                {['0', '1', '2', '3', '4', '5+'].map(b => <option key={b}>{b}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-3">Previous Education</p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 12 Board *</label>
                                                <select className="input-nmims" value={data.class12Board} onChange={e => set('class12Board', e.target.value)}>
                                                    <option value="">Select Board</option>
                                                    {SCHOOL_BOARDS.map(b => <option key={b}>{b}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 12 % *</label>
                                                <input className="input-nmims" placeholder="e.g. 85.6" value={data.class12Percent}
                                                    onChange={e => set('class12Percent', e.target.value)} type="number" min="0" max="100" step="0.1" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 10 Board *</label>
                                                <select className="input-nmims" value={data.class10Board} onChange={e => set('class10Board', e.target.value)}>
                                                    <option value="">Select Board</option>
                                                    {SCHOOL_BOARDS.map(b => <option key={b}>{b}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Class 10 % *</label>
                                                <input className="input-nmims" placeholder="e.g. 90.2" value={data.class10Percent}
                                                    onChange={e => set('class10Percent', e.target.value)} type="number" min="0" max="100" step="0.1" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                                        <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                            <span className="font-black">Data Privacy:</span> Academic data is only visible to your faculty mentor and placement coordinator. Never shared externally.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Online Presence ── */}
                            {step === 2 && (
                                <div className="space-y-5">
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-2">
                                        <p className="text-xs text-amber-700 font-bold">These 4 profiles are <span className="text-primary font-black uppercase">Strictly Mandatory</span> to proceed. If you haven't created an account yet, click the link to create one!</p>
                                    </div>

                                    {[
                                        { label: 'GitHub Profile', key: 'githubUrl', icon: Github, placeholder: 'https://github.com/yourusername', color: 'text-slate-800', url: 'https://github.com/signup', desc: 'Version control platform. Essential for showcasing your code and open-source contributions to recruiters.' },
                                        { label: 'LinkedIn Profile', key: 'linkedinUrl', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourprofile', color: 'text-blue-700', url: 'https://www.linkedin.com/signup', desc: 'Professional networking. Used by recruiters to scout talent and check background.' },
                                        { label: 'LeetCode Profile', key: 'leetcodeUrl', icon: Code2, placeholder: 'https://leetcode.com/yourusername', color: 'text-orange-600', url: 'https://leetcode.com/accounts/login/', desc: 'Coding practice platform. High solving stats help in cracking technical rounds.' },
                                        { label: 'Portfolio / Website', key: 'portfolioUrl', icon: LinkIcon, placeholder: 'https://yourportfolio.com (or N/A)', color: 'text-violet-600', url: 'https://app.netlify.com/signup', desc: 'Your personal website to host your projects, resume, and contact details.' },
                                    ].map(({ label, key, icon: Icon, placeholder, color, url, desc }) => (
                                        <div key={key} className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className={`text-sm font-black uppercase tracking-wider flex items-center gap-1.5 ${color}`}>
                                                    <Icon className="h-4 w-4" /> {label} *
                                                </label>
                                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:text-primary-dark underline cursor-pointer">
                                                    Create account →
                                                </a>
                                            </div>
                                            {((user?.currentYear || 1) === 1) && (
                                                <p className="text-[11px] text-slate-500 font-medium mb-3">{desc}</p>
                                            )}
                                            <input
                                                className="input-nmims"
                                                type={key === 'portfolioUrl' ? "text" : "url"}
                                                placeholder={placeholder}
                                                value={(data as any)[key]}
                                                onChange={e => set(key as any, e.target.value)}
                                            />
                                            {key === 'githubUrl' && (data as any)[key] && !(data as any)[key].includes('github.com') && (
                                                <p className="text-[10px] text-red-500 font-bold px-1 mt-1">Must contain 'github.com'</p>
                                            )}
                                            {key === 'linkedinUrl' && (data as any)[key] && !(data as any)[key].includes('linkedin.com') && (
                                                <p className="text-[10px] text-red-500 font-bold px-1 mt-1">Must contain 'linkedin.com'</p>
                                            )}
                                            {key === 'leetcodeUrl' && (data as any)[key] && !(data as any)[key].includes('leetcode.com') && (
                                                <p className="text-[10px] text-red-500 font-bold px-1 mt-1">Must contain 'leetcode.com'</p>
                                            )}
                                        </div>
                                    ))}

                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                                        <Upload className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            <span className="font-black">Resume Upload</span> is available in your My Profile section after setup. You can skip this for now.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 3: Skills & Experience ── */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <TagInput
                                        label="Tools & Technologies You Know"
                                        icon={Laptop}
                                        tags={data.knownTools}
                                        suggestions={TOOLS_SUGGESTIONS}
                                        onAdd={v => addTag('knownTools', v)}
                                        onRemove={v => removeTag('knownTools', v)}
                                        placeholder="Type a tool name..."
                                    />

                                    <TagInput
                                        label="Hobbies & Passions"
                                        icon={Heart}
                                        tags={data.hobbies}
                                        suggestions={HOBBY_SUGGESTIONS}
                                        onAdd={v => addTag('hobbies', v)}
                                        onRemove={v => removeTag('hobbies', v)}
                                        placeholder="Type a hobby..."
                                    />

                                    <TagInput
                                        label="Clubs & Committees (or planning to join)"
                                        icon={Trophy}
                                        tags={data.clubs}
                                        suggestions={CLUB_SUGGESTIONS}
                                        onAdd={v => addTag('clubs', v)}
                                        onRemove={v => removeTag('clubs', v)}
                                        placeholder="Type a club name..."
                                    />

                                    {/* ── Year-Based Dynamic Experience Sections ── */}
                                    {((user?.currentYear || 1) >= 2) && (
                                        <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="h-4 w-4 text-indigo-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-indigo-900">Project Portfolio</p>
                                                    <p className="text-xs text-indigo-700 mt-1">Since you are past your 1st year, Placecom requires you to list at least one project. You can add this later in your dashboard.</p>
                                                </div>
                                            </div>

                                            {/* Render existing projects */}
                                            {data.projects.length > 0 && (
                                                <div className="space-y-2 mt-3">
                                                    {data.projects.map((proj, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-800">{proj.title}</p>
                                                                <p className="text-[10px] font-medium text-slate-500 line-clamp-1">{proj.description}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => set('projects', data.projects.filter((_, i) => i !== idx))}
                                                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => setIsProjectModalOpen(true)}
                                                className="w-full py-2.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            >
                                                + Add Major Project
                                            </button>
                                        </div>
                                    )}

                                    {((user?.currentYear || 1) >= 3) && (
                                        <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Briefcase className="h-4 w-4 text-teal-500 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-teal-900">Internship Record</p>
                                                    <p className="text-xs text-teal-700 mt-1">3rd and 4th-year students must log any official internships. You can also log this via the main dashboard.</p>
                                                </div>
                                            </div>

                                            {/* Render existing internships */}
                                            {data.internships.length > 0 && (
                                                <div className="space-y-2 mt-3">
                                                    {data.internships.map((intern, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-teal-100 shadow-sm">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-800">{intern.role} @ {intern.company}</p>
                                                                <p className="text-[10px] font-medium text-slate-500">{intern.period}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => set('internships', data.internships.filter((_, i) => i !== idx))}
                                                                className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => setIsInternshipModalOpen(true)}
                                                className="w-full py-2.5 bg-white border border-teal-200 rounded-xl text-xs font-bold text-teal-600 hover:bg-teal-50 transition-colors"
                                            >
                                                + Log Internship
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Step 4: Career Goals ── */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Star className="h-3.5 w-3.5" /> Short-Term Goal (by end of 2nd year) *
                                        </label>
                                        <div className="grid gap-2">
                                            {SHORT_TERM_GOALS.map(goal => (
                                                <button
                                                    key={goal} type="button"
                                                    onClick={() => set('shortTermGoal', goal)}
                                                    className={`p-3.5 rounded-xl text-left text-sm font-medium border-2 transition-all flex items-center justify-between gap-3
                                                        ${data.shortTermGoal === goal
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                                                >
                                                    <span>{goal}</span>
                                                    {data.shortTermGoal === goal && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <GraduationCap className="h-3.5 w-3.5" /> Long-Term Goal (after graduation) *
                                        </label>
                                        <div className="grid gap-2">
                                            {LONG_TERM_GOALS.map(goal => (
                                                <button
                                                    key={goal} type="button"
                                                    onClick={() => set('longTermGoal', goal)}
                                                    className={`p-3.5 rounded-xl text-left text-sm font-medium border-2 transition-all flex items-center justify-between gap-3
                                                        ${data.longTermGoal === goal
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'}`}
                                                >
                                                    <span>{goal}</span>
                                                    {data.longTermGoal === goal && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* ── Footer Navigation ── */}
                        <div className="px-6 sm:px-8 pb-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                            <button
                                type="button"
                                onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {step === 0 ? 'Back' : 'Previous'}
                            </button>

                            <div className="flex-1 flex justify-center">
                                <div className="flex gap-1.5">
                                    {STEPS.map(s => (
                                        <div key={s.id} className={`h-1.5 rounded-full transition-all duration-300 ${step === s.id ? 'w-6 bg-primary' : step > s.id ? 'w-3 bg-green-400' : 'w-3 bg-slate-200'}`} />
                                    ))}
                                </div>
                            </div>

                            {step < STEPS.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => s + 1)}
                                    disabled={!canProceed()}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleComplete}
                                    disabled={!canProceed() || isSaving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                    ) : (
                                        <><Sparkles className="h-4 w-4" /> Go to Dashboard</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 font-medium mt-4">
                        NMIMS Hyderabad • Campus2Career • 2026
                    </p>
                </div>
            </main >

            {/* Modals */}
            < AddProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)
                }
                onSave={(project) => set('projects', [...data.projects, project])}
            />

            < AddInternshipModal
                isOpen={isInternshipModalOpen}
                onClose={() => setIsInternshipModalOpen(false)}
                onSave={(internship) => set('internships', [...data.internships, internship])}
            />

        </div >
    );
}
