import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LogoutButton } from '../../components/ui/LogoutButton';
import {
    GraduationCap, Code2, Target,
    Briefcase, Sparkles, ArrowRight, ArrowLeft, Brain, UploadCloud
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

    const [step, setStep] = useState(0); // Max 3 steps (0, 1, 2)
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
    const [preferredJobRoles, setPreferredJobRoles] = useState<string[]>(user?.goals || []);
    const [targetCompanies, setTargetCompanies] = useState('');
    const [interviewPrepStatus, setInterviewPrepStatus] = useState('');

    const currentYear = user?.currentYear || 1;
    const yearLabel = currentYear === 1 ? '1st Year' : currentYear === 2 ? '2nd Year' : currentYear === 3 ? '3rd Year' : '4th Year';

    // Shared list data
    const interestOptions = ['Web Development', 'Artificial Intelligence', 'Data Science', 'Cloud Computing', 'Cyber Security', 'BlockChain', 'UI/UX Design', 'System Design'];
    const goalOptionsOptions = ['Learn Basics', 'Build Projects', 'Get Internship', 'Freelancing'];
    const langOptions = ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Ruby'];
    const jobRoleOptions = ['Software Engineer', 'Data Analyst', 'Product Manager', 'ML Engineer', 'DevOps / SRE', 'Cloud Architect'];

    const toggleSelection = (item: string, stateUpdate: any, currentList: string[]) => {
        stateUpdate(currentList.includes(item) ? currentList.filter(i => i !== item) : [...currentList, item]);
    };

    const handleComplete = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            // Build the typed data payload based on the year to keep the db clean
            const careerData: CareerDiscoveryData = {
                year: currentYear,
                interests: interests,
            };
            if (currentYear === 1) {
                careerData.codingExperience = codingExperience;
                careerData.learningGoals = learningGoals;
            } else if (currentYear === 2) {
                careerData.programmingLanguages = programmingLanguages;
                careerData.projectExperience = projectExperience;
                careerData.codingUsernames = codingUsernames;
            } else if (currentYear === 3) {
                careerData.hasResumeList = hasResumeList;
                careerData.internshipExp = internshipExp;
            } else if (currentYear === 4) {
                careerData.targetCompanies = targetCompanies;
                careerData.interviewPrepStatus = interviewPrepStatus;
            }

            const leetcodeFinal = (leetcodeStatsURL || user.leetcode || '').trim();

            const updatedUserData = {
                ...user,
                // Ensure legacy logic uses what we just populated
                leetcode: currentYear === 3 ? leetcodeFinal : user.leetcode,
                interests,
                goals: currentYear === 4 ? preferredJobRoles : user.goals,
                careerDiscoveryData: careerData,
                careerDiscoveryCompleted: true,
                profileCompleted: false,
                assessmentCompleted: false,
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

    // Render Steps logic based on year
    const renderStepContent = () => {
        if (currentYear === 1) {
            if (step === 0) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">What are your career interests?</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {interestOptions.map((opt) => (
                            <button key={opt} onClick={() => toggleSelection(opt, setInterests, interests)} className={`p-4 rounded-xl border-2 text-left text-sm font-bold ${interests.includes(opt) ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <Button className="w-full mt-6" onClick={() => setStep(1)} disabled={interests.length === 0}>Next Step <ArrowRight className="w-4 h-4" /></Button>
                </div>
            );
            if (step === 1) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Your coding experience</h2>
                    <div className="grid gap-3">
                        {['Complete Beginner', 'Know a bit of coding', 'Intermediate / Built small apps'].map((opt) => (
                            <button key={opt} onClick={() => setCodingExperience(opt)} className={`p-4 rounded-xl border-2 text-left font-bold ${codingExperience === opt ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        <Button className="flex-1" onClick={() => setStep(2)} disabled={!codingExperience}>Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </div>
                </div>
            );
            if (step === 2) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Primary Learning Goals</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {goalOptionsOptions.map((opt) => (
                            <button key={opt} onClick={() => toggleSelection(opt, setLearningGoals, learningGoals)} className={`p-4 rounded-xl border-2 text-left text-sm font-bold ${learningGoals.includes(opt) ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        <Button className="flex-1" onClick={handleComplete} isLoading={isSaving} disabled={learningGoals.length === 0}>Let's Begin <Sparkles className="w-4 h-4 ml-2" /></Button>
                    </div>
                </div>
            );
        }

        if (currentYear === 2) {
            if (step === 0) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Programming Languages Known</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {langOptions.map((opt) => (
                            <button key={opt} onClick={() => toggleSelection(opt, setProgrammingLanguages, programmingLanguages)} className={`p-3 rounded-xl border-2 text-center text-sm font-bold ${programmingLanguages.includes(opt) ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <Button className="w-full mt-6" onClick={() => setStep(1)} disabled={programmingLanguages.length === 0}>Next Step <ArrowRight className="w-4 h-4" /></Button>
                </div>
            );
            if (step === 1) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Project Experience</h2>
                    <div className="grid gap-3">
                        {['None yet', '1-2 small projects', 'Multiple complex projects'].map((opt) => (
                            <button key={opt} onClick={() => setProjectExperience(opt)} className={`p-4 rounded-xl border-2 text-left font-bold ${projectExperience === opt ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        <Button className="flex-1" onClick={() => setStep(2)} disabled={!projectExperience}>Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </div>
                </div>
            );
            if (step === 2) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Coding Platform IDs</h2>
                    <p className="text-center text-slate-500 mb-4">Enter your handles (LeetCode, HackerRank, Codeforces, etc.)</p>
                    <Input placeholder="e.g. RachitJ (Leetcode), Rachit_Code (HackerRank)" value={codingUsernames} onChange={(e) => setCodingUsernames(e.target.value)} icon={<Code2 className="w-5 h-5" />} />
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        <Button className="flex-1" onClick={handleComplete} isLoading={isSaving} disabled={!codingUsernames.trim()}>Let's Begin <Sparkles className="w-4 h-4 ml-2" /></Button>
                    </div>
                </div>
            );
        }

        if (currentYear === 3) {
            if (step === 0) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Resume Check</h2>
                    <div className="grid gap-3">
                        {['I have a prepared Resume', 'I need help making one'].map((opt) => (
                            <button key={opt} onClick={() => setHasResumeList(opt)} className={`p-4 rounded-xl border-2 text-left font-bold ${hasResumeList === opt ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                <UploadCloud className="w-5 h-5 inline-block mr-2 -mt-1 opacity-70" /> {opt}
                            </button>
                        ))}
                    </div>
                    <Button className="w-full mt-6" onClick={() => setStep(1)} disabled={!hasResumeList}>Next Step <ArrowRight className="w-4 h-4" /></Button>
                </div>
            );
            if (step === 1) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Internship Experience</h2>
                    <div className="grid gap-3">
                        {['No Internships yet', 'Done 1 Internship', 'Multiple Internships Done'].map((opt) => (
                            <button key={opt} onClick={() => setInternshipExp(opt)} className={`p-4 rounded-xl border-2 text-left font-bold ${internshipExp === opt ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                                <Briefcase className="w-5 h-5 inline-block mr-2 -mt-1 opacity-70" /> {opt}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        <Button className="flex-1" onClick={() => setStep(2)} disabled={!internshipExp}>Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </div>
                </div>
            );
            if (step === 2) return (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-slate-900 text-center">Coding Platform Stats</h2>
                    <p className="text-center text-slate-500 mb-4">Enter your primary LeetCode Username</p>
                    <Input placeholder="LeetCode Username (e.g. rachit_jain)" value={leetcodeStatsURL} onChange={(e) => setLeetcodeStatsURL(e.target.value)} icon={<Target className="w-5 h-5" />} />
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                        <Button className="flex-1" onClick={handleComplete} isLoading={isSaving} disabled={!leetcodeStatsURL.trim() && !user?.leetcode}>Let's Begin <Sparkles className="w-4 h-4 ml-2" /></Button>
                    </div>
                </div>
            );
        }

        // Year 4
        if (step === 0) return (
            <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 text-center">Preferred Job Roles</h2>
                <div className="grid grid-cols-2 gap-3">
                    {jobRoleOptions.map((opt) => (
                        <button key={opt} onClick={() => toggleSelection(opt, setPreferredJobRoles, preferredJobRoles)} className={`p-4 rounded-xl border-2 text-left text-sm font-bold ${preferredJobRoles.includes(opt) ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
                <Button className="w-full mt-6" onClick={() => setStep(1)} disabled={preferredJobRoles.length === 0}>Next Step <ArrowRight className="w-4 h-4" /></Button>
            </div>
        );
        if (step === 1) return (
            <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 text-center">Target Companies</h2>
                <p className="text-center text-slate-500 mb-4">E.g. Microsoft, Google, Amazon, TCS (comma separated)</p>
                <Input placeholder="E.g. Microsoft, Google, Amazon, TCS" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} icon={<Target className="w-5 h-5" />} />
                <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(0)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button className="flex-1" onClick={() => setStep(2)} disabled={!targetCompanies.trim()}>Next Step <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
            </div>
        );
        if (step === 2) return (
            <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 text-center">Interview Preparation</h2>
                <div className="grid gap-3">
                    {['Just Started', 'Confident in Aptitude / Coding', 'Ready for Mock Interviews'].map((opt) => (
                        <button key={opt} onClick={() => setInterviewPrepStatus(opt)} className={`p-4 rounded-xl border-2 text-left font-bold ${interviewPrepStatus === opt ? 'border-primary bg-primary text-white' : 'border-slate-100 hover:border-slate-300'}`}>
                            <Brain className="w-5 h-5 inline-block mr-2 -mt-1 opacity-70" /> {opt}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 mt-6">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button className="flex-1" onClick={handleComplete} isLoading={isSaving} disabled={!interviewPrepStatus}>Finalize & Prepare <Sparkles className="w-4 h-4 ml-2" /></Button>
                </div>
            </div>
        );

        return null;
    };

    return (
        <div className="min-h-screen bg-secondary flex flex-col">
            <div className="bg-white border-b border-slate-200 py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="font-black text-primary tracking-tighter">CAMPUS2CAREER</span>
                    <span className="hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        Career Discovery · {yearLabel}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        {[0, 1, 2].map((s) => (
                            <div key={s} className={`h-2 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-slate-200'}`} />
                        ))}
                    </div>
                    <LogoutButton />
                </div>
            </div>

            <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sm:p-12 animate-in fade-in zoom-in duration-500">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                            <Sparkles className="h-3 w-3" /> Step {step + 1} of 3
                        </div>
                    </div>

                    {renderStepContent()}
                </div>
            </main>

            <footer className="py-8 text-center text-slate-400 text-xs font-bold tracking-widest uppercase">
                NMIMS HYDERABAD • CAMPUS2CAREER 2026
            </footer>
        </div>
    );
}
