import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogoutButton } from '../../components/ui/LogoutButton';
import { 
    Compass, 
    Sparkles, 
    Code, 
    Database, 
    Shield, 
    Cloud, 
    ArrowRight, 
    ArrowLeft, 
    Check, 
    ChevronRight, 
    Target, 
    Zap,
    User,
    Flag,
    Terminal,
    GraduationCap,
    Briefcase,
    Brain,
    UploadCloud,
    Code2
} from 'lucide-react';

interface CareerDiscoveryData {
    year: number;
    interests: string[];
    codingExperience?: string;
    learningGoals?: string[];
    programmingLanguages?: string[];
    projectExperience?: string;
    codingUsernames?: string;
    internshipExp?: string;
    hasResumeList?: string;
    targetCompanies?: string;
    interviewPrepStatus?: string;
}

export default function CareerDiscoveryPage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(0); 
    const [isSaving, setIsSaving] = useState(false);

    // Common State
    const [interests, setInterests] = useState<string[]>(user?.interests || []);

    // 1st Year Specific
    const [codingExperience, setCodingExperience] = useState('');
    const [learningGoals, setLearningGoals] = useState<string[]>([]);

    // 2nd Year Specific
    const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([]);
    const [projectExperience, setProjectExperience] = useState('');
    const [codingUsernames, setCodingUsernames] = useState('');

    // 3rd Year Specific
    const [internshipExp, setInternshipExp] = useState('');
    const [hasResumeList, setHasResumeList] = useState('');
    const [leetcodeStatsURL, setLeetcodeStatsURL] = useState(user?.leetcode || '');

    // 4th Year Specific
    const [targetCompanies, setTargetCompanies] = useState('');
    const [interviewPrepStatus, setInterviewPrepStatus] = useState('');

    const currentYear = user?.currentYear || 1;
    const yearLabel = currentYear === 1 ? '1st Year' : currentYear === 2 ? '2nd Year' : currentYear === 3 ? '3rd Year' : '4th Year';

    // Shared list data
    const goalOptionsOptions = ['Learn Basics', 'Build Projects', 'Get Internship', 'Freelancing'];
    const langOptions = ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Ruby'];

    // Mini Quiz State for 1st Years
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizResponses, setQuizResponses] = useState<Record<string, 'yes' | 'no' | null>>({
        visual: null,
        logical: null,
        security: null,
        systems: null,
    });
    const [quizScores, setQuizScores] = useState<Record<string, number>>({
        'Web Development': 0,
        'AI & Machine Learning': 0,
        'Data Science': 0,
        'Cybersecurity': 0,
        'Cloud & DevOps': 0,
        'UI/UX Design': 0
    });
    const [recommendedTrack, setRecommendedTrack] = useState<string | null>(null);

    const QUIZ_QUESTIONS = [
        {
            id: 'visual',
            q: 'Do you enjoy creating things that people can see and interact with?',
            points: { 'Web Development': 2, 'UI/UX Design': 2 } as Record<string, number>
        },
        {
            id: 'logical',
            q: 'Are you fascinated by how data can be used to predict patterns or outcomes?',
            points: { 'AI & Machine Learning': 2, 'Data Science': 2 } as Record<string, number>
        },
        {
            id: 'security',
            q: 'Do you like solving puzzles and finding hidden vulnerabilities in systems?',
            points: { 'Cybersecurity': 2 } as Record<string, number>
        },
        {
            id: 'systems',
            q: 'Do you prefer building the underlying foundation that keeps things running reliably?',
            points: { 'Cloud & DevOps': 2 } as Record<string, number>
        }
    ];

    const handleQuizResponse = (qId: string, type: 'yes' | 'no', pointsMap: Record<string, number>) => {
        const previous = quizResponses[qId];
        
        if (previous === type) {
            setQuizResponses(prev => ({ ...prev, [qId]: null }));
            if (type === 'yes') {
                setQuizScores(prev => {
                    const next = { ...prev };
                    Object.entries(pointsMap).forEach(([track, pts]) => {
                        next[track] = Math.max(0, (next[track] || 0) - pts);
                    });
                    return next;
                });
            }
            return;
        }

        setQuizResponses(prev => ({ ...prev, [qId]: type }));
        
        if (type === 'yes') {
            setQuizScores(prev => {
                const next = { ...prev };
                Object.entries(pointsMap).forEach(([track, pts]) => {
                    next[track] = (next[track] || 0) + pts;
                });
                return next;
            });
        } else if (previous === 'yes') {
            setQuizScores(prev => {
                const next = { ...prev };
                Object.entries(pointsMap).forEach(([track, pts]) => {
                    next[track] = Math.max(0, (next[track] || 0) - pts);
                });
                return next;
            });
        }
    };

    const processQuizRecommendation = () => {
        setShowQuiz(false);
        const sorted = Object.entries(quizScores).sort((a, b) => b[1] - a[1]);
        if (sorted[0][1] > 0) {
            setRecommendedTrack(sorted[0][0]);
        } else {
            setRecommendedTrack('Web Development'); 
        }
    };

    const CAREER_TRACKS = [
        {
            id: 'web-dev',
            title: 'Full-Stack Developer',
            icon: <Code className="w-6 h-6" />,
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            description: 'The architects of the digital interface. You build what people see and touch on the internet.',
            dayInLife: 'Morning stand-up, coding new UI components, debugging responsive layouts, and collaborating with designers.',
            demand: 'High (9.5/10)',
            skills: ['React/Next.js', 'TypeScript', 'Tailwind CSS']
        },
        {
            id: 'ai-ml',
            title: 'AI/ML Engineer',
            icon: <Brain className="w-6 h-6" />,
            color: 'from-purple-500 to-pink-600',
            bg: 'bg-purple-50',
            description: 'The brain builders. You teach machines to think, predict, and solve complex problems autonomously.',
            dayInLife: 'Cleaning datasets, training neural networks, optimizing model accuracy, and researching new AI papers.',
            demand: 'Very High (9.8/10)',
            skills: ['Python', 'TensorFlow', 'Linear Algebra']
        },
        {
            id: 'cyber',
            title: 'Cybersecurity Engineer',
            icon: <Target className="w-6 h-6" />,
            color: 'from-red-500 to-orange-600',
            bg: 'bg-red-50',
            description: 'The digital guardians. You protect global systems from hackers and ensure data privacy.',
            dayInLife: 'Running penetration tests, monitoring for threats, patch management, and security audits.',
            demand: 'High (9.2/10)',
            skills: ['Networking', 'Ethical Hacking', 'Linux']
        },
        {
            id: 'cloud',
            title: 'DevOps Engineer',
            icon: <Cloud className="w-6 h-6" />,
            color: 'from-cyan-500 to-blue-600',
            bg: 'bg-cyan-50',
            description: 'The infrastructure masters. You scale applications to millions of users with rock-solid stability.',
            dayInLife: 'Managing AWS/Azure clusters, automated deployments (CI/CD), and monitoring system health.',
            demand: 'High (9.4/10)',
            skills: ['AWS', 'Docker', 'Kubernetes']
        },
        {
            id: 'data-science',
            title: 'Data Scientist',
            icon: <Database className="w-6 h-6" />,
            color: 'from-emerald-500 to-teal-600',
            bg: 'bg-emerald-50',
            description: 'The insight finders. You turn raw data into strategic decisions for business growth.',
            dayInLife: 'SQL querying, creating dashboards, statistical analysis, and presenting findings to stakeholders.',
            demand: 'High (9.0/10)',
            skills: ['SQL', 'Tableau', 'Statistics']
        },
        {
            id: 'ui-ux',
            title: 'Product / UX Designer',
            icon: <Sparkles className="w-6 h-6" />,
            color: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50',
            description: 'The users advocates. You make technology intuitive, beautiful, and a joy to use.',
            dayInLife: 'User research, wireframing in Figma, prototyping, and testing designs with real users.',
            demand: 'Moderate-High (8.5/10)',
            skills: ['Figma', 'User Research', 'Prototyping']
        }
    ];

    const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

    const toggleSelection = (item: string, stateUpdate: any, currentList: string[]) => {
        stateUpdate(currentList.includes(item) ? currentList.filter(i => i !== item) : [...currentList, item]);
    };

    const handleComplete = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const careerData: CareerDiscoveryData = {
                year: currentYear,
                interests: interests || [],
            };
            
            if (currentYear === 1) {
                careerData.codingExperience = codingExperience || '';
                careerData.learningGoals = learningGoals || [];
            } else if (currentYear === 2) {
                careerData.programmingLanguages = programmingLanguages || [];
                careerData.projectExperience = projectExperience || '';
                careerData.codingUsernames = codingUsernames || '';
            } else if (currentYear === 3) {
                careerData.hasResumeList = hasResumeList || '';
                careerData.internshipExp = internshipExp || '';
            } else if (currentYear === 4) {
                careerData.targetCompanies = targetCompanies || '';
                careerData.interviewPrepStatus = interviewPrepStatus || '';
            }

            const leetcodeFinal = (leetcodeStatsURL || (user as any)?.leetcode || codingUsernames || '').toString().trim();

            const updatedUserData = {
                ...user,
                leetcode: leetcodeFinal || (user as any)?.leetcode || '',
                interests: interests || [],
                goals: currentYear === 4 ? [...(interests || []), ...(learningGoals || [])] : (user as any)?.goals || [],
                careerDiscoveryData: careerData,
                careerDiscoveryCompleted: true,
                profileCompleted: false,
                assessmentCompleted: false,
                careerTrack: interests[0] || 'Software Engineer',
            };

            await updateUser(updatedUserData);
            navigate('/student/profile-setup');
        } catch (error: any) {
            console.error('Error during onboarding completion:', error);
            alert(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderProgressBar = () => {
        const steps = [
            { id: 0, label: 'Profile', icon: <User className="w-4 h-4" /> },
            { id: 1, label: 'Discovery', icon: <Compass className="w-4 h-4" /> },
            { id: 2, label: 'Goals', icon: <Flag className="w-4 h-4" /> }
        ];

        return (
            <div className="flex items-center justify-between mb-12 px-2 relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                {steps.map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm border-2 ${
                            step === s.id ? 'bg-primary border-primary text-white scale-110' : 
                            step > s.id ? 'bg-green-500 border-green-500 text-white' : 
                            'bg-white border-slate-200 text-slate-400'
                        }`}>
                            {step > s.id ? <Check className="w-5 h-5" /> : s.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                            step === s.id ? 'text-primary' : 'text-slate-400'
                        }`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const renderStepContent = () => {
        if (step === 0) {
            if (currentYear === 1) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Where do you stand currently?</h2>
                    <p className="text-center text-slate-500 mb-4 text-sm">Be honest, this helps us tailor your foundation.</p>
                    <div className="grid gap-3">
                        {['Complete Beginner', 'Know a bit of coding', 'Intermediate / Built small apps'].map((opt) => (
                            <button key={opt} onClick={() => setCodingExperience(opt)} className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${codingExperience === opt ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'border-slate-100 hover:border-slate-300'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <Button className="w-full mt-6 py-6" onClick={() => setStep(1)} disabled={!codingExperience}>Next: Explore Tracks <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
            );

            if (currentYear === 2) return (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 text-center">Your Skill Baseline</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-black uppercase text-slate-400 mb-2">Languages you know</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {langOptions.map((opt) => (
                                    <button key={opt} onClick={() => toggleSelection(opt, setProgrammingLanguages, programmingLanguages)} className={`p-2 rounded-xl border-2 text-center text-xs font-bold transition-all ${programmingLanguages.includes(opt) ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase text-slate-400 mb-2">Project Exposure</p>
                            <div className="grid gap-2">
                                {['No projects yet', '1-2 small projects', 'Multiple complex projects'].map((opt) => (
                                    <button key={opt} onClick={() => setProjectExperience(opt)} className={`p-3 rounded-xl border-2 text-left text-sm font-bold transition-all ${projectExperience === opt ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Button className="w-full mt-6 py-4" onClick={() => setStep(1)} disabled={programmingLanguages.length === 0 || !projectExperience}>Next: Choose Your Track <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
            );

            if (currentYear === 3) return (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 text-center">Industry Readiness</h2>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase text-slate-400">Resume Status</p>
                            {['I have a prepared Resume', 'I need help making one'].map((opt) => (
                                <button key={opt} onClick={() => setHasResumeList(opt)} className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${hasResumeList === opt ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <UploadCloud className="w-5 h-5 inline-block mr-2 opacity-70" /> {opt}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase text-slate-400">Internship Experience</p>
                            {['No Internships yet', 'Done 1 Internship', 'Multiple Internships Done'].map((opt) => (
                                <button key={opt} onClick={() => setInternshipExp(opt)} className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${internshipExp === opt ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <Briefcase className="w-5 h-5 inline-block mr-2 opacity-70" /> {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Button className="w-full mt-6 py-4" onClick={() => setStep(1)} disabled={!hasResumeList || !internshipExp}>Next: Choose Track <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
            );

            return (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 text-center">Placement Season Prep</h2>
                    <div className="space-y-4">
                        <Input placeholder="Target Companies (e.g. Google, TCS, Microsoft)" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} icon={<Target className="w-5 h-5" />} />
                        <div className="space-y-2">
                            <p className="text-xs font-black uppercase text-slate-400">Current Prep Level</p>
                            {['Just Started', 'Confident in Coding', 'Ready for Mock Interviews'].map((opt) => (
                                <button key={opt} onClick={() => setInterviewPrepStatus(opt)} className={`w-full p-4 rounded-xl border-2 text-left font-bold transition-all ${interviewPrepStatus === opt ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <Brain className="w-5 h-5 inline-block mr-2 opacity-70" /> {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Button className="w-full mt-6 py-4" onClick={() => setStep(1)} disabled={!targetCompanies.trim() || !interviewPrepStatus}>Next: Select Track <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
            );
        }

        if (step === 1) return (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">Discover Your Path</h2>
                    <p className="text-slate-500 text-sm">Select one or more tracks that excite you.</p>
                </div>

                {currentYear === 1 && !showQuiz && !recommendedTrack && (
                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between group hover:bg-primary/10 transition-all cursor-pointer" onClick={() => setShowQuiz(true)}>
                        <div className="flex gap-4 items-center">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <Sparkles className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Not sure what to choose?</h4>
                                <p className="text-xs text-slate-500">Take our 1-minute Interest Matcher quiz</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                )}

                {showQuiz ? (
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="space-y-2 text-center">
                            <h3 className="text-2xl font-black text-slate-900">Interest Matcher</h3>
                            <p className="text-sm text-slate-500">Answer these to find your top career fit!</p>
                        </div>
                        <div className="space-y-4">
                            {QUIZ_QUESTIONS.map((q) => (
                                <div key={q.id} className={`p-4 rounded-xl border-2 transition-all ${quizResponses[q.id] === 'yes' ? 'border-primary bg-primary/5' : quizResponses[q.id] === 'no' ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-50/50'}`}>
                                    <p className="text-sm font-semibold text-slate-700">{q.q}</p>
                                    <div className="flex gap-2 mt-3">
                                        <button 
                                            onClick={() => handleQuizResponse(q.id, 'yes', q.points)} 
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                                quizResponses[q.id] === 'yes' ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            {quizResponses[q.id] === 'yes' && <Check className="w-4 h-4" />} Yes, Definitely
                                        </button>
                                        <button 
                                            onClick={() => handleQuizResponse(q.id, 'no', q.points)}
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 text-xs font-bold transition-all ${
                                                quizResponses[q.id] === 'no' ? 'bg-slate-400 border-slate-400 text-white' : 'bg-white border-slate-200 text-slate-600'
                                            }`}
                                        >
                                            Not Really
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full py-4 rounded-2xl" onClick={processQuizRecommendation} disabled={!Object.values(quizResponses).some(v => v !== null)}>Get My Recommendation</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CAREER_TRACKS.map((track) => (
                            <div
                                key={track.id}
                                className={`group relative rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer ${
                                    interests.includes(track.title) ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-300'
                                }`}
                                onClick={() => toggleSelection(track.title, setInterests, interests)}
                            >
                                {recommendedTrack === track.title && (
                                    <div className="absolute -top-1 -right-1 bg-yellow-400 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl z-20 animate-bounce mt-2 mr-2">
                                        ⭐ Top Match
                                    </div>
                                )}
                                <div className="flex items-start justify-between">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${track.color} text-white shadow-md`}>
                                        {track.icon}
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setSelectedDetail(selectedDetail === track.id ? null : track.id); }} className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                        Details {selectedDetail === track.id ? '↑' : '↓'}
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <h3 className="font-bold text-slate-800">{track.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{track.description}</p>
                                </div>
                                {selectedDetail === track.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-in fade-in transition-all">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-slate-400">📅 Day in Life</p>
                                            <p className="text-[11px] text-slate-600 italic">"{track.dayInLife}"</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase text-slate-400">📈 Demand</p>
                                                <p className="text-xs font-bold text-slate-800">{track.demand}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase text-slate-400">⚡ Skills</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {track.skills.slice(0, 2).map(s => <span key={s} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!showQuiz && (
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 py-6" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        <Button className="flex-[2] py-6 text-lg" onClick={() => setStep(2)} disabled={interests.length === 0}>Confirm Interests <ArrowRight className="w-5 h-5 ml-2" /></Button>
                    </div>
                )}
            </div>
        );

        if (step === 2) return (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">Personalize Your Path</h2>
                    <p className="text-slate-500 text-sm">Add your handles to sync with our AI engine.</p>
                </div>

                {recommendedTrack && (
                    <div className="bg-gradient-to-br from-primary/10 to-indigo-50 border border-primary/20 rounded-3xl p-6 space-y-4 animate-in zoom-in-95">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <h4 className="font-black text-slate-800 text-sm uppercase">AI Fit Analysis</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Based on your interest in <span className="text-primary font-bold">{recommendedTrack}</span>:
                            {quizResponses.visual === 'yes' && " Your eye for design will be a huge asset in creating stunning user experiences."}
                            {quizResponses.logical === 'yes' && " Your logical problem-solving skills align perfectly with technical complexity here."}
                            {quizResponses.security === 'yes' && " Your focus on vulnerability makes you a natural fit for this domain."}
                        </p>
                    </div>
                )}

                <div className="grid gap-6">
                    {currentYear === 1 ? (
                         <div className="space-y-4">
                            <p className="text-xs font-black uppercase text-slate-400">Learning Goals</p>
                            <div className="grid grid-cols-2 gap-2">
                                {goalOptionsOptions.map(opt => (
                                    <button key={opt} onClick={() => toggleSelection(opt, setLearningGoals, learningGoals)} className={`p-4 rounded-xl border-2 text-center text-xs font-bold transition-all ${learningGoals.includes(opt) ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-100 hover:border-slate-300'}`}>{opt}</button>
                                ))}
                            </div>
                         </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase text-slate-400">Platform Sync</p>
                            <Input placeholder="LeetCode Username" value={currentYear === 2 ? codingUsernames : leetcodeStatsURL} onChange={(e) => currentYear === 2 ? setCodingUsernames(e.target.value) : setLeetcodeStatsURL(e.target.value)} icon={<Code2 className="w-5 h-5" />} />
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 py-4" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button className="flex-1 py-4" onClick={handleComplete} isLoading={isSaving}>Complete Setup <Sparkles className="w-4 h-4 ml-2" /></Button>
                </div>
            </div>
        );

        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 py-4 px-6 fixed top-0 w-full z-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-black text-primary tracking-tighter text-xl">CAMPUS2CAREER</span>
                </div>
                <LogoutButton />
            </header>

            <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6">
                <div className="w-full max-w-xl">
                    {renderProgressBar()}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 sm:p-12 relative overflow-hidden transition-all duration-700">
                        {renderStepContent()}
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                NMIMS HYDERABAD • FUTURE READY 2026
            </footer>
        </div>
    );
}
