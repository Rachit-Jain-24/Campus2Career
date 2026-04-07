import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Code2, Compass, Target, CheckCircle2, Zap,
    Briefcase, GraduationCap, LayoutGrid, BookOpen, Sparkles, Server,
    Upload, RefreshCw, Info, FileText, X, Clock,
    TrendingUp, Award, Layers, Brain, FileQuestion, Sparkle, Search, Book,
    Map, ChevronRight, Lock, Play, Flag
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { generateIntelligentRoadmap, type IntelligentRoadmap } from '../../lib/roadmapGenerator';
import { generateLongitudinalRoadmap, type LongitudinalRoadmap, type SemesterPlan } from '../../lib/longitudinalRoadmap';
import { generateSyllabusRoadmap } from '../../lib/gemini';
import { uploadSyllabusPDF, getSyllabusRecord, type SyllabusRecord } from '../../services/student/syllabus.service';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';
import { copilotEngine } from '../../lib/ai/copilotEngine';
import type { AcademicNote, AcademicQuiz } from '../../types/copilot';
import { curriculumDb } from '../../services/db/database.service';

const ICON_MAP: Record<string, React.ElementType> = {
    Code2, LayoutGrid, Briefcase, Target, Compass, GraduationCap, Server, BookOpen
};

const PRIORITY_CONFIG = {
    critical: { color: 'bg-red-500', light: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
    high:     { color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200 text-orange-700', dot: 'bg-orange-500' },
    medium:   { color: 'bg-blue-500', light: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' },
};

const ROLES = ["Full-Stack Developer", "Data Scientist", "Backend Engineer", "AI/ML Engineer", "Frontend Developer", "DevOps Engineer"];

export default function RoadmapPage() {
    const { user } = useAuth();
    const u = user as any;

    const currentYear = u?.currentYear || 1;
    const yearLabel = ['', '1st Year', '2nd Year', '3rd Year', '4th Year'][currentYear] || '1st Year';

    const [targetRole, setTargetRole] = useState(u?.careerTrack || 'Full-Stack Developer');
    const [roadmap, setRoadmap] = useState<IntelligentRoadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [semester, setSemester] = useState<number>(() => (currentYear - 1) * 2 + 1);
    const [syllabusText, setSyllabusText] = useState<string | null>(null);
    const [syllabusRecord, setSyllabusRecord] = useState<SyllabusRecord | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [storageError, setStorageError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [checkedMilestones, setCheckedMilestones] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<'roadmap' | 'syllabus' | 'skills' | 'planning' | 'journey'>('journey');
    const [masterCurriculum, setMasterCurriculum] = useState<any | null>(null);
    const [selectedStudySubject, setSelectedStudySubject] = useState<string | null>(null);
    const [studyKits, setStudyKits] = useState<Record<string, { notes: AcademicNote; quiz: AcademicQuiz }>>({});
    const [isGeneratingStudyKit, setIsGeneratingStudyKit] = useState(false);
    const { showToast } = useToast();
    const [showStudyModal, setShowStudyModal] = useState(false);
    const [isAiGenerated, setIsAiGenerated] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    
    // Longitudinal roadmap state
    const [longitudinalRoadmap, setLongitudinalRoadmap] = useState<LongitudinalRoadmap | null>(null);
    const [selectedSemesterView, setSelectedSemesterView] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'current' | 'longitudinal'>('longitudinal');
    
    // Collapsible upload section
    const [isUploadExpanded, setIsUploadExpanded] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevRoleRef = useRef(targetRole);

    useEffect(() => {
        const fetchMasterCurriculum = async () => {
            const branch = u?.branch || 'B.Tech CSE';
            const batch = u?.batch || '2022-2026';
            try {
                const data = await curriculumDb.getCurriculum(branch, batch);
                if (data) setMasterCurriculum(data);
            } catch (err) {
                console.error("Failed to fetch curriculum:", err);
            }
        };
        if (u) fetchMasterCurriculum();
    }, [u]);

    useEffect(() => {
        const saved = localStorage.getItem(`c2c_roadmap_milestones_${u?.sapId}`);
        if (saved) setCheckedMilestones(JSON.parse(saved));
    }, [u?.sapId]);

    useEffect(() => {
        const sapId = u?.sapId;
        if (!sapId) return;
        getSyllabusRecord(sapId, semester)
            .then(r => setSyllabusRecord(r))
            .catch(() => setSyllabusRecord(null));
    }, [u?.sapId, semester]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!user || syllabusText) return;
        setIsLoading(true);
        
        // Generate traditional roadmap
        const result = generateIntelligentRoadmap(
            currentYear, targetRole,
            u.techSkills || [], u.leetcodeStats?.totalSolved || 0,
            u.projects?.length || 0, u.internships?.length || 0,
            parseFloat(u.cgpa || u.assessmentResults?.cgpa || '0')
        );
        setRoadmap(result);
        
        // Generate longitudinal 4-year semester-wise roadmap
        const currentSemester = (currentYear - 1) * 2 + 1;
        const longResult = generateLongitudinalRoadmap(
            targetRole,
            currentSemester,
            u.leetcodeStats?.totalSolved || 0,
            u.projects?.length || 0,
            u.techSkills || []
        );
        setLongitudinalRoadmap(longResult);
        setSelectedSemesterView(currentSemester);
        
        setIsAiGenerated(false);
        setTimeout(() => setIsLoading(false), 300);
    }, [user, targetRole]); // eslint-disable-line react-hooks/exhaustive-deps

    const runSyllabusGeneration = useCallback(async (text: string, role: string) => {
        if (!user) return;
        setIsGenerating(true);
        try {
            const result = await generateSyllabusRoadmap(text, u, role);
            setRoadmap(result);
            setIsAiGenerated(!!(result.subjectIndustryMap?.length));
            if (result.subjectIndustryMap?.length) setActiveTab('syllabus');
        } catch {
            const fallback = generateIntelligentRoadmap(
                currentYear, role, u.techSkills || [],
                u.leetcodeStats?.totalSolved || 0, u.projects?.length || 0,
                u.internships?.length || 0, parseFloat(u.cgpa || '0')
            );
            setRoadmap(fallback);
            setIsAiGenerated(false);
        } finally {
            setIsGenerating(false);
        }
    }, [user, currentYear, u]);

    useEffect(() => {
        if (!syllabusText) return;
        runSyllabusGeneration(syllabusText, targetRole);
    }, [syllabusText]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (prevRoleRef.current === targetRole) return;
        prevRoleRef.current = targetRole;
        if (syllabusText) runSyllabusGeneration(syllabusText, targetRole);
    }, [targetRole, syllabusText, runSyllabusGeneration]);

    const toggleMilestone = (m: string) => {
        const next = { ...checkedMilestones, [m]: !checkedMilestones[m] };
        setCheckedMilestones(next);
        localStorage.setItem(`c2c_roadmap_milestones_${u?.sapId}`, JSON.stringify(next));
    };

    const completedCount = Object.values(checkedMilestones).filter(Boolean).length;
    const totalMilestones = roadmap?.milestones?.length || 0;
    const progress = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

    const handleFile = async (file: File) => {
        setUploadError(null);
        setStorageError(null);
        if (file.type !== 'application/pdf') { setUploadError('Please upload a valid PDF file.'); return; }
        if (file.size > 10 * 1024 * 1024) { setUploadError('File size must be under 10 MB.'); return; }
        let text: string;
        try { text = await extractTextFromLocalPDF(file); }
        catch { setUploadError('Could not read text from this PDF. Please upload a text-based PDF.'); return; }
        if (!text?.trim()) { setUploadError('Could not read text from this PDF. Please upload a text-based PDF.'); return; }
        setSyllabusText(text);
        const sapId = u?.sapId;
        if (sapId) {
            setUploadProgress(0);
            uploadSyllabusPDF(sapId, semester, file, pct => setUploadProgress(pct))
                .then(r => { setSyllabusRecord(r); setUploadProgress(null); })
                .catch(() => { setStorageError('Failed to save syllabus. Your roadmap was still generated.'); setUploadProgress(null); });
        }
    };

    const handleGenerateStudyKit = async (subject: string) => {
        if (studyKits[subject]) {
            setSelectedStudySubject(subject);
            setShowStudyModal(true);
            return;
        }

        setIsGeneratingStudyKit(true);
        setSelectedStudySubject(subject);
        showToast(`Generating study kit for ${subject}...`, 'info');
        
        try {
            const [notes, quiz] = await Promise.all([
                copilotEngine.generateNotesDirect(subject, `Industry-relevant mastery of ${subject} for a ${targetRole} role.`),
                copilotEngine.generateQuizDirect(subject, 5)
            ]);

            setStudyKits(prev => ({ ...prev, [subject]: { notes, quiz } }));
            setShowStudyModal(true);
            showToast(`Study kit for ${subject} ready!`, 'success');
        } catch (err) {
            console.error("Failed to generate study kit:", err);
            showToast('Failed to generate study kit. Please try again.', 'error');
        } finally {
            setIsGeneratingStudyKit(false);
        }
    };

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return iso; }
    };

    return (
        <DashboardLayout role="student" userName={u?.name || 'Student'} userYear={yearLabel} userProgram={u?.branch || 'B.Tech CSE'}>
            <div className="space-y-6 pb-12 animate-in fade-in duration-500">

                {/* ── Header ── */}
                <div className="rounded-3xl gradient-primary p-8 text-white relative overflow-hidden shadow-xl">
                    <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute right-24 bottom-0 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-white/20 rounded-lg"><Zap className="h-4 w-4" /></div>
                                {isAiGenerated ? (
                                    <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"
                                        title="Generated from your uploaded syllabus using our internal analysis engine">
                                        <Sparkles className="h-3 w-3" /> System Analysis Powered
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Smart Algorithmic Roadmap</span>
                                )}
                            </div>
                            <h1 className="text-3xl font-black mb-1">Path to {targetRole}</h1>
                            <p className="text-white/70 text-sm">{yearLabel} · {u?.branch || 'B.Tech CSE'}</p>
                        </div>
                        {roadmap && (
                            <div className="flex gap-4 shrink-0">
                                {[
                                    { label: 'Progress', value: `${roadmap.overallProgress}%` },
                                    { label: 'Steps', value: roadmap.roadmapSteps.length },
                                    { label: 'Ready In', value: roadmap.estimatedTimeToReady },
                                ].map(s => (
                                    <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center border border-white/20">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">{s.label}</p>
                                        <p className="text-xl font-black">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Role Selector ── */}
                <div className="flex flex-wrap gap-2">
                    {ROLES.map(role => (
                        <button key={role} onClick={() => setTargetRole(role)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${targetRole === role
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-white text-slate-500 border-slate-200 hover:border-primary/40'}`}>
                            {role}
                        </button>
                    ))}
                </div>

                {/* ── Syllabus Upload Card (Collapsible) ── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <button 
                        onClick={() => setIsUploadExpanded(!isUploadExpanded)}
                        className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-slate-800">Upload Semester Syllabus</p>
                                <p className="text-xs text-slate-400">AI-powered analysis of your actual subjects (Optional)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {syllabusText && (
                                <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle2 className="h-3 w-3" /> Analyzed
                                </span>
                            )}
                            <div className={`h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform ${isUploadExpanded ? 'rotate-180' : ''}`}>
                                <ChevronRight className="h-4 w-4 text-slate-500 rotate-90" />
                            </div>
                        </div>
                    </button>

                    {isUploadExpanded && (
                    <div className="p-5 space-y-4 border-t border-slate-100">
                        {/* Regenerate button if already analyzed */}
                        {syllabusText && (
                            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                                    <span className="text-xs font-bold text-blue-800">Syllabus analyzed! Regenerate for {targetRole}?</span>
                                </div>
                                <button onClick={() => runSyllabusGeneration(syllabusText, targetRole)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all">
                                    <RefreshCw className="h-3 w-3" /> Regenerate
                                </button>
                            </div>
                        )}

                        {/* Semester pills */}
                        <div className="flex flex-wrap gap-2">
                            {[1,2,3,4,5,6,7,8].map(s => (
                                <button key={s} onClick={() => setSemester(s)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${semester === s
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    Sem {s}
                                </button>
                            ))}
                        </div>

                        {/* Existing record */}
                        {syllabusRecord && (
                            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-green-800">{syllabusRecord.fileName}</p>
                                        <p className="text-[10px] text-green-600">Uploaded {formatDate(syllabusRecord.uploadedAt)}</p>
                                    </div>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-green-700 underline">Re-upload</button>
                            </div>
                        )}

                        {/* Drop zone */}
                        <div
                            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-6 flex items-center gap-4 cursor-pointer transition-all ${isDragging ? 'border-primary/40 bg-primary/5' : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'}`}>
                            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">Drop your syllabus PDF here</p>
                                <p className="text-xs text-slate-400">PDF only · Max 10 MB · System will read your subjects</p>
                            </div>
                        </div>

                        {uploadProgress !== null && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-500">
                                    <span>Saving to cloud…</span><span>{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            </div>
                        )}
                        {uploadError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                                <Info className="h-4 w-4 shrink-0" />{uploadError}
                            </div>
                        )}
                        {storageError && (
                            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 font-medium">
                                <div className="flex items-center gap-2"><Info className="h-4 w-4 shrink-0" />{storageError}</div>
                                <button onClick={() => setStorageError(null)}><X className="h-4 w-4 text-yellow-600" /></button>
                            </div>
                        )}
                    </div>
                    )}
                </div>

                {/* ── Loading States ── */}
                {isGenerating && (
                    <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center border border-slate-100 shadow-sm">
                        <div className="relative mb-5">
                            <div className="h-14 w-14 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 mb-1">System is analyzing your syllabus…</h3>
                        <p className="text-sm text-slate-400">Mapping your subjects to industry skills for {targetRole}</p>
                    </div>
                )}

                {isLoading && !isGenerating && (
                    <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center border border-slate-100 shadow-sm">
                        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-sm font-bold text-slate-500">Building your roadmap…</p>
                    </div>
                )}

                {/* ── Main Content ── */}
                {!isGenerating && !isLoading && roadmap && (
                    <div className="space-y-6">

                        {/* ── Tab Bar ── */}
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                            {([
                                { id: 'roadmap', label: 'Career Roadmap', icon: TrendingUp },
                                { id: 'journey', label: '8-Semester Journey', icon: Map },
                                { id: 'planning', label: '4-Year Academic Plan', icon: Layers },
                                ...(isAiGenerated && roadmap.subjectIndustryMap?.length ? [{ id: 'syllabus', label: 'Semester Analysis', icon: Search }] : []),
                                { id: 'skills', label: 'Skills & Certs', icon: Award },
                            ] as { id: string; label: string; icon: React.ElementType }[]).map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'}`}>
                                    <tab.icon className="h-3.5 w-3.5" />{tab.label}
                                </button>
                            ))}
                        </div>

                        {/* ══ TAB: ROADMAP ══ */}
                        {activeTab === 'roadmap' && (
                            <div className="grid lg:grid-cols-3 gap-6">

                                {/* Timeline — main column */}
                                <div className="lg:col-span-2 space-y-0">
                                    <div className="flex items-center gap-3 mb-6">
                                        <h2 className="text-xl font-black text-slate-800">Your Action Plan</h2>
                                        {isAiGenerated && (
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                Syllabus-Based
                                            </span>
                                        )}
                                    </div>

                                    {/* Vertical timeline */}
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/40 to-transparent" />

                                        <div className="space-y-0">
                                            {roadmap.roadmapSteps.map((step, idx) => {
                                                const StepIcon = ICON_MAP[step.iconKey] || Code2;
                                                const pc = PRIORITY_CONFIG[step.priority] || PRIORITY_CONFIG.medium;
                                                const isLast = idx === roadmap.roadmapSteps.length - 1;
                                                return (
                                                    <div key={idx} className="relative flex gap-5 pb-8">
                                                        {/* Node */}
                                                        <div className="relative z-10 shrink-0">
                                                            <div className={`h-10 w-10 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-white border-2 border-primary/30'} flex items-center justify-center shadow-md`}>
                                                                {idx === 0
                                                                    ? <StepIcon className="h-5 w-5 text-white" />
                                                                    : <span className="text-xs font-black text-primary">{idx + 1}</span>
                                                                }
                                                            </div>
                                                            {!isLast && <div className="absolute left-1/2 top-10 -translate-x-1/2 w-0.5 h-full bg-primary/20" />}
                                                        </div>

                                                        {/* Card */}
                                                        <div className={`flex-1 bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all group ${idx === 0 ? 'border-primary/30 shadow-primary/10' : 'border-slate-100'}`}>
                                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                                <h3 className={`font-black text-slate-800 group-hover:text-primary transition-colors ${idx === 0 ? 'text-base' : 'text-sm'}`}>
                                                                    {step.title}
                                                                </h3>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${pc.light}`}>
                                                                        {step.priority}
                                                                    </span>
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                                        <Clock className="h-3 w-3" />{step.timeframe}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* End node */}
                                        <div className="relative flex gap-5">
                                            <div className="relative z-10 shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shadow-md">
                                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-green-50 rounded-2xl p-5 border border-green-200">
                                                <p className="text-sm font-black text-green-800">Placement Ready 🎉</p>
                                                <p className="text-xs text-green-600 mt-0.5">Estimated: {roadmap.estimatedTimeToReady}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-5">
                                    {/* Progress ring card */}
                                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Milestone Progress</p>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="relative h-16 w-16 shrink-0">
                                                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                                                    <circle cx="32" cy="32" r="26" fill="none" stroke="#f1f5f9" strokeWidth="6" />
                                                    <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-primary, #6366f1)" strokeWidth="6"
                                                        strokeDasharray={`${2 * Math.PI * 26}`}
                                                        strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                                                        strokeLinecap="round" className="transition-all duration-700" />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-primary">{progress}%</span>
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-800">{completedCount}/{totalMilestones}</p>
                                                <p className="text-xs text-slate-400">milestones done</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {roadmap.milestones.map((m, idx) => {
                                                const done = checkedMilestones[m];
                                                return (
                                                    <button key={idx} onClick={() => toggleMilestone(m)}
                                                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all text-xs font-bold ${done ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${done ? 'bg-green-500' : 'border-2 border-slate-300'}`}>
                                                            {done && <CheckCircle2 className="h-3 w-3 text-white" />}
                                                        </div>
                                                        <span className={done ? 'line-through opacity-60' : ''}>{m}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {progress === 100 && (
                                            <div className="mt-4 p-3 bg-green-500 rounded-xl text-white text-center text-xs font-black">
                                                🔥 All milestones complete!
                                            </div>
                                        )}
                                    </div>

                                    {/* Goals */}
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">This Year's Goals</p>
                                        <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                                            <Target className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                                            <p className="text-xs font-bold text-orange-800">{roadmap.academicFocus[0] || 'Maintain consistency'}</p>
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                            <Briefcase className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                            <p className="text-xs font-bold text-blue-800">{roadmap.internshipGoals}</p>
                                        </div>
                                    </div>

                                    {/* Projects */}
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Projects to Build</p>
                                        <div className="space-y-2">
                                            {roadmap.projectsToBuild.map((p, idx) => (
                                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                                                    <div className="h-5 w-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</div>
                                                    <p className="text-xs font-bold text-slate-700">{p}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: SYLLABUS ANALYSIS ══ */}
                        {activeTab === 'syllabus' && isAiGenerated && roadmap.subjectIndustryMap && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-black text-slate-800">Syllabus Analysis</h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        VPA System
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500">Each subject from your uploaded syllabus mapped to industry relevance for <strong>{targetRole}</strong>.</p>

                                {/* Legend */}
                                <div className="flex gap-3 flex-wrap">
                                    {[
                                        { label: 'High Relevance', cls: 'bg-green-100 text-green-700 border-green-200' },
                                        { label: 'Medium Relevance', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                                        { label: 'Low Relevance', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
                                    ].map(l => (
                                        <span key={l.label} className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${l.cls}`}>{l.label}</span>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {roadmap.subjectIndustryMap.map((entry, idx) => {
                                        const badge = entry.industryRelevance === 'high'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : entry.industryRelevance === 'medium'
                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                : 'bg-slate-100 text-slate-500 border-slate-200';
                                        const bar = entry.industryRelevance === 'high' ? 'bg-green-500 w-full'
                                            : entry.industryRelevance === 'medium' ? 'bg-yellow-500 w-2/3'
                                                : 'bg-slate-300 w-1/3';
                                        return (
                                            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <p className="text-sm font-black text-slate-800 leading-snug">{entry.subject}</p>
                                                    <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge}`}>
                                                        {entry.industryRelevance}
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-slate-100 rounded-full mb-3 overflow-hidden">
                                                    <div className={`h-full rounded-full ${bar}`} />
                                                </div>
                                                
                                                <div className="mb-4">
                                                    <button 
                                                        onClick={() => handleGenerateStudyKit(entry.subject)}
                                                        disabled={isGeneratingStudyKit}
                                                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            studyKits[entry.subject] 
                                                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                                                        }`}
                                                    >
                                                        {isGeneratingStudyKit && selectedStudySubject === entry.subject ? (
                                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                                        ) : studyKits[entry.subject] ? (
                                                            <Brain className="h-3 w-3" />
                                                        ) : (
                                                            <Sparkle className="h-3 w-3" />
                                                        )}
                                                        {studyKits[entry.subject] ? 'View Study Kit' : 'Generate Study Kit'}
                                                    </button>
                                                </div>

                                                {entry.supplementarySkills.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Learn alongside</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {entry.supplementarySkills.map((s, si) => (
                                                                <span key={si} className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: SKILLS & CERTS ══ */}
                        {activeTab === 'skills' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                                    <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-4">Skills to Master</p>
                                    <div className="flex flex-wrap gap-2">
                                        {roadmap.skillsToMaster.map((s, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold rounded-xl transition-colors">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Recommended Certifications</p>
                                    <div className="space-y-3">
                                        {roadmap.certifications.map((c, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                                <div className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
                                                <p className="text-xs font-bold text-slate-700">{c}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Curriculum map */}
                                <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">4-Year Academic Map</p>
                                    <div className="flex gap-0 overflow-x-auto pb-2">
                                        {roadmap.curriculumMapping.map((m, idx) => (
                                            <div key={idx} className="flex items-start gap-0 min-w-0 flex-1">
                                                <div className="flex flex-col items-center">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${m.year <= currentYear ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        {m.year <= currentYear ? <CheckCircle2 className="h-4 w-4" /> : m.year}
                                                    </div>
                                                    {idx < roadmap.curriculumMapping.length - 1 && (
                                                        <div className={`w-full h-0.5 mt-4 ${m.year < currentYear ? 'bg-primary' : 'bg-slate-200'}`} style={{ width: '100%' }} />
                                                    )}
                                                </div>
                                                <div className="ml-3 mr-6 min-w-[120px]">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">{m.focus}</p>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5">{m.subject}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{m.reason}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: 4-YEAR PLANNING ══ */}
                        {activeTab === 'planning' && longitudinalRoadmap && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-200 flex items-center justify-center shrink-0">
                                        <Layers className="h-6 w-6 text-amber-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-amber-900">4-Year Academic Blueprint</h3>
                                        <p className="text-sm text-amber-700 font-medium">NMIMS CSE (DS) - Full 8-semester course structure with {targetRole} focus</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {longitudinalRoadmap.semesters.map((sem, sIdx) => (
                                        <div key={sIdx} className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col ${
                                            sem.status === 'current' ? 'ring-2 ring-primary border-primary' : 'border-slate-100'
                                        }`}>
                                            <div className={`p-5 border-b border-slate-50 flex items-center justify-between ${
                                                sem.status === 'current' ? 'bg-primary text-white' : 'bg-slate-50/50'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black italic ${
                                                        sem.status === 'current' ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'
                                                    }`}>
                                                        S{sem.semester}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-black ${sem.status === 'current' ? 'text-white' : 'text-slate-800'}`}>
                                                            Semester {sem.semester}
                                                        </h4>
                                                        <p className={`text-xs ${sem.status === 'current' ? 'text-white/80' : 'text-slate-500'}`}>
                                                            {sem.focus}
                                                        </p>
                                                    </div>
                                                </div>
                                                {sem.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                                {sem.status === 'current' && <Play className="h-5 w-5 text-white" />}
                                                {sem.status === 'upcoming' && <Lock className="h-5 w-5 text-slate-400" />}
                                            </div>
                                            <div className="p-4 space-y-3 flex-1">
                                                {sem.academicSubjects.map((subject, subIdx) => (
                                                    <div key={subIdx} className="group p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-amber-200">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800">{subject}</p>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                                    {subIdx < 3 ? 'HIGH' : 'MEDIUM'} RELEVANCE
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleGenerateStudyKit(subject)}
                                                                disabled={isGeneratingStudyKit}
                                                                className={`shrink-0 h-8 w-8 rounded-lg border flex items-center justify-center transition-all shadow-sm ${
                                                                    isGeneratingStudyKit && selectedStudySubject === subject
                                                                        ? 'bg-amber-100 border-amber-200 text-amber-600'
                                                                        : 'bg-white border-slate-100 text-primary hover:bg-primary hover:text-white'
                                                                }`}
                                                                title={isGeneratingStudyKit && selectedStudySubject === subject ? 'Generating...' : 'Generate Study Kit'}
                                                            >
                                                                {isGeneratingStudyKit && selectedStudySubject === subject ? (
                                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Brain className="h-4 w-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-100 rounded text-slate-500">AI Notes</span>
                                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-100 rounded text-slate-500">Practice Quiz</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {/* Technical Skills for this semester */}
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                        Technical Focus
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {sem.technicalGoals.slice(0, 3).map((skill, idx) => (
                                                            <span key={idx} className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ══ TAB: 8-SEMESTER JOURNEY ══ */}
                        {activeTab === 'journey' && !longitudinalRoadmap && (
                            <div className="bg-white rounded-2xl p-12 flex flex-col items-center text-center border border-slate-100 shadow-sm">
                                <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                                <p className="text-sm font-bold text-slate-500">Loading your 8-semester journey…</p>
                            </div>
                        )}
                        {activeTab === 'journey' && longitudinalRoadmap && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Journey Header */}
                                <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-black mb-1">Your 8-Semester Journey to {targetRole}</h3>
                                            <p className="text-white/80 text-sm">Longitudinal roadmap from foundation to placement</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black">{longitudinalRoadmap.overallProgress}%</p>
                                            <p className="text-xs text-white/70">Journey Complete</p>
                                        </div>
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-white rounded-full transition-all duration-1000"
                                            style={{ width: `${longitudinalRoadmap.overallProgress}%` }}
                                        />
                                    </div>
                                    
                                    {/* Critical Path */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {longitudinalRoadmap.criticalPath.map((path, idx) => (
                                            <span key={idx} className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">
                                                {idx + 1}. {path}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Semester Selector */}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {longitudinalRoadmap.semesters.map((sem) => (
                                        <button
                                            key={sem.semester}
                                            onClick={() => setSelectedSemesterView(sem.semester)}
                                            className={`flex-shrink-0 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                                                selectedSemesterView === sem.semester
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : sem.status === 'completed'
                                                    ? 'bg-green-100 text-green-700'
                                                    : sem.status === 'current'
                                                    ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {sem.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                                                {sem.status === 'current' && <Play className="h-3 w-3" />}
                                                {sem.status === 'upcoming' && <Lock className="h-3 w-3" />}
                                                <span>Sem {sem.semester}</span>
                                            </div>
                                            <div className="text-[9px] opacity-70 mt-0.5">{sem.focus}</div>
                                        </button>
                                    ))}
                                </div>

                                {/* Selected Semester Detail */}
                                {selectedSemesterView && longitudinalRoadmap.semesters.find(s => s.semester === selectedSemesterView) && (
                                    <SemesterDetail 
                                        semester={longitudinalRoadmap.semesters.find(s => s.semester === selectedSemesterView)!}
                                        isCurrent={selectedSemesterView === ((currentYear - 1) * 2 + 1)}
                                    />
                                )}

                                {/* Journey Overview Cards */}
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                                            <Target className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">450</p>
                                        <p className="text-xs text-slate-500">LeetCode Target</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                        <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                                            <LayoutGrid className="h-5 w-5 text-green-600" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">16+</p>
                                        <p className="text-xs text-slate-500">Projects to Build</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
                                            <Award className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">6</p>
                                        <p className="text-xs text-slate-500">Certifications</p>
                                    </div>
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                        <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                                            <Briefcase className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">2-3</p>
                                        <p className="text-xs text-slate-500">Internships</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Study Kit Modal ── */}
            {showStudyModal && selectedStudySubject && studyKits[selectedStudySubject] && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between gradient-primary text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">{selectedStudySubject}</h2>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">AI Academic Copilot • Study Kit</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowStudyModal(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-12">
                            {/* AI Notes Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Smart Study Notes</h3>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {studyKits[selectedStudySubject].notes.modules.map((mod, i) => (
                                        <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            <h4 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                                                <span className="h-5 w-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center">{i + 1}</span>
                                                {mod.title}
                                            </h4>
                                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{mod.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Practice Quiz Section */}
                            <section className="pb-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                        <FileQuestion className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800">Knowledge Check</h3>
                                </div>
                                <div className="space-y-6">
                                    {studyKits[selectedStudySubject]?.quiz?.questions?.map((q, i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                            <p className="font-bold text-slate-800 mb-4">{i + 1}. {q.question}</p>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {q.options?.map((opt, oi) => {
                                                    const isCorrect = oi === q.correctAnswer;
                                                    return (
                                                        <div key={oi} className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                                                            isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-600'
                                                        }`}>
                                                            {opt}
                                                            {isCorrect && <CheckCircle2 className="h-3 w-3 inline ml-2" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {q.explanation && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Explanation</p>
                                                    <p className="text-xs text-blue-800">{q.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    )) || (
                                        <div className="text-center py-8 text-slate-500">
                                            <p className="text-sm">No quiz questions available. Try generating again.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setShowStudyModal(false)}
                                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-all"
                            >
                                Done Studying
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

// Semester Detail Component
function SemesterDetail({ semester, isCurrent }: { semester: SemesterPlan; isCurrent: boolean }) {
    return (
        <div className={`bg-white rounded-2xl border-2 ${isCurrent ? 'border-primary shadow-lg shadow-primary/10' : 'border-slate-100'} overflow-hidden`}>
            {/* Header */}
            <div className={`p-6 ${isCurrent ? 'bg-primary text-white' : 'bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`h-14 w-14 rounded-2xl ${isCurrent ? 'bg-white/20' : 'bg-white'} flex items-center justify-center text-xl font-black`}>
                            {semester.semester}
                        </div>
                        <div>
                            <h4 className={`text-lg font-black ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                                {semester.title}
                            </h4>
                            <p className={`text-sm ${isCurrent ? 'text-white/80' : 'text-slate-500'}`}>
                                Year {semester.year} · {semester.focus}
                            </p>
                        </div>
                    </div>
                    {isCurrent && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                            CURRENT SEMESTER
                        </span>
                    )}
                    {semester.status === 'completed' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> COMPLETED
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 grid lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Academic Subjects */}
                    <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" /> Academic Subjects
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {semester.academicSubjects.map((subject, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Technical Goals */}
                    <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Code2 className="h-4 w-4" /> Technical Skills to Master
                        </h5>
                        <div className="space-y-2">
                            {semester.technicalGoals.map((skill, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                                    <div className="h-6 w-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center">
                                        {idx + 1}
                                    </div>
                                    <span className="text-sm font-bold text-blue-800">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projects */}
                    <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <LayoutGrid className="h-4 w-4" /> Projects to Build
                        </h5>
                        <div className="space-y-2">
                            {semester.projects.map((project, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                                    <div className="h-6 w-6 rounded-full bg-green-500 text-white text-[10px] font-black flex items-center justify-center">
                                        {idx + 1}
                                    </div>
                                    <span className="text-sm font-bold text-green-800">{project}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* LeetCode Target */}
                    <div className="p-4 bg-slate-900 rounded-2xl text-white">
                        <div className="flex items-center justify-between mb-3">
                            <h5 className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                                <Target className="h-4 w-4" /> LeetCode Target
                            </h5>
                            <span className="text-2xl font-black">{semester.leetcodeTarget}</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                                style={{ width: `${Math.min(100, (semester.leetcodeTarget / 450) * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-white/60 mt-2">Cumulative target by end of semester</p>
                    </div>

                    {/* Internship Goal */}
                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                        <h5 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Internship Goal
                        </h5>
                        <p className="text-sm font-bold text-purple-800">{semester.internshipGoal}</p>
                    </div>

                    {/* Certifications */}
                    {semester.certifications.length > 0 && (
                        <div>
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Award className="h-4 w-4" /> Certifications
                            </h5>
                            <div className="space-y-2">
                                {semester.certifications.map((cert, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                        <div className="h-6 w-6 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                                            🏆
                                        </div>
                                        <span className="text-sm font-bold text-amber-800">{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Milestones */}
                    <div>
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Flag className="h-4 w-4" /> Key Milestones
                        </h5>
                        <div className="space-y-2">
                            {semester.milestones.map((milestone, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-xs font-bold text-slate-700">{milestone}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interview Prep */}
                    {semester.interviewPrep.length > 0 && (
                        <div>
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Compass className="h-4 w-4" /> Interview Preparation
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {semester.interviewPrep.map((prep, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg">
                                        {prep}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
