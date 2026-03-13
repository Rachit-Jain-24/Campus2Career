import React, { useState, useEffect } from 'react';
import {
    Code2, Compass, Target, CheckCircle2, Zap,
    Briefcase, GraduationCap, LayoutGrid, BookOpen, Sparkles, Server
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { generateIntelligentRoadmap, type IntelligentRoadmap } from '../../lib/roadmapGenerator';

// Map icon strings from Gemini to actual React components
const ICON_MAP: Record<string, any> = {
    "Code2": Code2,
    "LayoutGrid": LayoutGrid,
    "Briefcase": Briefcase,
    "Target": Target,
    "Compass": Compass,
    "GraduationCap": GraduationCap,
    "Server": Server,
    "BookOpen": BookOpen
};

export default function RoadmapPage() {
    const { user } = useAuth();

    const currentYear = user?.currentYear || 1;
    const yearLabel = currentYear === 1 ? '1st Year' : currentYear === 2 ? '2nd Year' : currentYear === 3 ? '3rd Year' : '4th Year';

    const [targetRole, setTargetRole] = useState((user as any)?.careerTrack || 'Full-Stack Developer');
    const [roadmap, setRoadmap] = useState<IntelligentRoadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            
            // Generate roadmap instantly using real-time algorithm
            const result = generateIntelligentRoadmap(
                currentYear,
                targetRole,
                user.techSkills || [],
                user.leetcodeStats?.totalSolved || 0,
                user.projects?.length || 0,
                user.internships?.length || 0,
                parseFloat(user.cgpa || user.assessmentResults?.cgpa || "0")
            );

            setRoadmap(result);
            
            // Simulate brief loading for smooth UX
            setTimeout(() => setIsLoading(false), 300);
        }
    }, [user, currentYear, targetRole]);

    const roles = ["Full-Stack Developer", "Data Scientist", "Backend Engineer", "AI/ML Engineer", "Frontend Developer", "DevOps Engineer"];

    const [curriculumAligned, setCurriculumAligned] = useState(true);
    const [checkedMilestones, setCheckedMilestones] = useState<Record<string, boolean>>({});

    // Load checked milestones from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`c2c_roadmap_milestones_${user?.sapId}`);
        if (saved) {
            setCheckedMilestones(JSON.parse(saved));
        }
    }, [user?.sapId]);

    const toggleMilestone = (milestone: string) => {
        const newState = { ...checkedMilestones, [milestone]: !checkedMilestones[milestone] };
        setCheckedMilestones(newState);
        localStorage.setItem(`c2c_roadmap_milestones_${user?.sapId}`, JSON.stringify(newState));
    };

    const totalMilestones = roadmap?.milestones?.length || 0;
    const completedMilestones = Object.values(checkedMilestones).filter(Boolean).length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    return (
        <DashboardLayout role="student" userName={user?.name || "Student"} userYear={yearLabel} userProgram={user?.branch || "B.Tech CSE"}>
            <div className="space-y-8 animate-in fade-in duration-700 pb-10">
                {/* Header Banner */}
                <div className="rounded-3xl gradient-primary p-8 text-white overflow-hidden relative shadow-lg">
                    <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute right-20 bottom-0 h-32 w-32 rounded-full bg-white/5 blur-xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
                                <Zap className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xs font-bold text-white/90 uppercase tracking-[0.2em]">AI-Powered Career Roadmap</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-3">Your Personalized Path to {targetRole}</h1>
                        <p className="text-white/80 font-medium max-w-2xl text-base leading-relaxed">
                            Real-time roadmap based on your current skills, projects, and industry benchmarks. Updates instantly as you progress.
                        </p>
                        
                        {roadmap && (
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Overall Progress</p>
                                    <p className="text-2xl font-black">{roadmap.overallProgress}%</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Skills to Learn</p>
                                    <p className="text-2xl font-black">{roadmap.skillsToMaster.length}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Action Steps</p>
                                    <p className="text-2xl font-black">{roadmap.roadmapSteps.length}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Time to Ready</p>
                                    <p className="text-2xl font-black">{roadmap.estimatedTimeToReady}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setTargetRole(role)}
                                    className={`whitespace-nowrap px-4 py-2 text-xs font-bold rounded-xl transition-all ${targetRole === role
                                        ? 'bg-primary text-white shadow-lg scale-[1.02]'
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        {/* Curriculum Toggle (Legacy Migration) */}
                        <button
                            onClick={() => setCurriculumAligned(!curriculumAligned)}
                            className={`flex items-center gap-2 rounded-2xl border-2 px-5 py-2 text-xs font-bold transition-all ${curriculumAligned
                                ? "border-primary/20 bg-primary/5 text-primary shadow-sm"
                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                                }`}
                        >
                            <BookOpen className={`h-4 w-4 transition-transform ${curriculumAligned ? 'scale-110' : 'scale-100'}`} />
                            Curriculum Aligned
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Year {currentYear} Progress</p>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-sm font-black text-primary">{progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-[2rem] p-20 flex flex-col items-center justify-center text-center w-full min-h-[500px] border border-slate-100 shadow-sm">
                        <div className="relative">
                            <div className="h-20 w-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin mb-8" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">Generating Your Roadmap...</h3>
                        <p className="text-slate-500 max-w-md font-medium">Analyzing your profile against industry benchmarks</p>
                    </div>
                ) : roadmap && (
                    <div className="grid gap-8 lg:grid-cols-12">
                        {/* Sidebar: Curriculum & Progress */}
                        <div className="lg:col-span-4 space-y-8">
                            {/* Academic Alignment Section */}
                            {curriculumAligned && (
                                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                            <GraduationCap className="h-6 w-6 text-primary" />
                                            Academic Map
                                        </h3>
                                        <div className="py-1 px-3 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">
                                            Year 1-4
                                        </div>
                                    </div>

                                    <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                        {roadmap.curriculumMapping.map((map, idx) => (
                                            <div key={idx} className="relative pl-10 group">
                                                <div className={`absolute left-0 top-0 h-6 w-6 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10 transition-all duration-500 ${map.year <= currentYear ? 'bg-primary scale-110' : 'bg-slate-100'}`}>
                                                    {map.year <= currentYear ? (
                                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-400">{map.year}</span>
                                                    )}
                                                </div>
                                                <div className="bg-slate-50/50 rounded-2xl p-4 border border-transparent group-hover:border-primary/10 group-hover:bg-white transition-all">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Year {map.year}: {map.focus}</h4>
                                                    <p className="text-sm font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{map.subject}</p>
                                                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                                        <p className="text-xs text-slate-500 leading-relaxed font-medium italic">"{map.reason}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills & Certs Summary */}
                            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                    Skill Inventory
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Core Technical Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {roadmap.skillsToMaster.map((skill, idx) => (
                                                <span key={idx} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold rounded-xl transition-colors">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Recommended Certifications</p>
                                        <div className="space-y-2">
                                            {roadmap.certifications.map((cert, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs font-bold text-white/80">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                                                    {cert}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content: Action Plan & Milestones */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Year Focus Bar */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-inner">
                                        <Target className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Target</p>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">{roadmap.academicFocus[0] || "Maintain consistency"}</p>
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center gap-5">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                        <Briefcase className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internship Goal</p>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">{roadmap.internshipGoals}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Execution Steps */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        </div>
                                        Year {currentYear} Personal Action Plan
                                    </h3>
                                </div>

                                <div className="grid md:grid-cols-1 gap-4">
                                    {roadmap.roadmapSteps.map((step, index) => {
                                        const StepIcon = ICON_MAP[step.iconKey] || Code2;
                                        const priorityColors = {
                                            critical: 'bg-red-50 border-red-200 text-red-700',
                                            high: 'bg-orange-50 border-orange-200 text-orange-700',
                                            medium: 'bg-blue-50 border-blue-200 text-blue-700'
                                        };
                                        return (
                                            <div key={index} className="group relative bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
                                                <div className="flex gap-6 relative z-10">
                                                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-500 shadow-inner">
                                                        <StepIcon className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                            <h4 className="text-lg font-black text-slate-800 group-hover:text-primary transition-colors">{step.title}</h4>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${priorityColors[step.priority]}`}>
                                                                    {step.priority}
                                                                </span>
                                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                                    {step.timeframe}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Projects & Milestone Checklist (Legacy Migration) */}
                            <div className="grid md:grid-cols-2 gap-8 pt-4">
                                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm h-full">
                                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5 text-indigo-500" />
                                        Projects to Build
                                    </h3>
                                    <div className="space-y-4">
                                        {roadmap.projectsToBuild.map((project, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white font-bold shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">{project}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] p-8 border border-indigo-100 shadow-xl shadow-indigo-100/20 h-full relative overflow-hidden">
                                    <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        Interactive Milestones
                                    </h3>
                                    <div className="space-y-3 relative z-10">
                                        {roadmap.milestones.map((milestone, idx) => {
                                            const isChecked = checkedMilestones[milestone];
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => toggleMilestone(milestone)}
                                                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${isChecked
                                                        ? "border-green-200 bg-green-50/50 shadow-inner"
                                                        : "border-slate-100 bg-slate-50/30 hover:bg-white hover:border-slate-200 hover:shadow-md"
                                                        }`}
                                                >
                                                    <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${isChecked ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-110' : 'bg-white border-2 border-slate-200'}`}>
                                                        {isChecked && <CheckCircle2 className="h-4 w-4" />}
                                                    </div>
                                                    <span className={`text-sm font-bold ${isChecked ? "line-through text-slate-400" : "text-slate-600"}`}>
                                                        {milestone}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {progress === 100 && (
                                        <div className="mt-6 p-4 bg-green-500 rounded-2xl text-white text-center animate-bounce shadow-lg shadow-green-200">
                                            <p className="text-xs font-black uppercase tracking-widest">🔥 Year Optimized!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
