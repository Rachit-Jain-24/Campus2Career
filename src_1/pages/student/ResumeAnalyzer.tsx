import { useState } from 'react';
import { Target, Sparkles, Brain, CheckCircle, ChevronRight, Play, AlertCircle, Briefcase, FileText, BarChart3, Upload } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeResumeWithAI, type AtsAnalysisResult } from '../../lib/gemini';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';
import { useRef } from 'react';

export default function ResumeAnalyzer() {
    const { user } = useAuth();

    const [resumeText, setResumeText] = useState("");
    const [jdText, setJdText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AtsAnalysisResult | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isParsing, setIsParsing] = useState(false);

    const jdFileInputRef = useRef<HTMLInputElement>(null);
    const [isParsingJd, setIsParsingJd] = useState(false);

    const handleAnalyze = async () => {
        if (!resumeText.trim() || !jdText.trim()) return;

        setIsAnalyzing(true);
        try {
            const analysis = await analyzeResumeWithAI(resumeText, jdText);
            setResult(analysis);
        } catch (error) {
            console.error("Analysis Failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <DashboardLayout role="student" userName={user?.name || "Student"} userYear={user?.currentYear ? `${user.currentYear} Year` : "Student"} userProgram={user?.branch || "B.Tech CSE"}>
            <div className="space-y-6">

                {/* Header Banner */}
                <div className="rounded-2xl gradient-primary p-6 text-white overflow-hidden relative shadow-sm animate-fade-in-up">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-white/80" />
                            <span className="text-sm font-medium text-white/90">ATS Intelligence</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Resume Analyzer 📄</h1>
                        <p className="text-white/90 font-medium max-w-xl">
                            Simulate how corporate Applicant Tracking Systems (ATS) read and score your resume against real Job Descriptions.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Input Panel */}
                    <div className="card-nmims overflow-hidden animate-fade-in-up stagger-1 h-full flex flex-col">
                        <div className="p-5 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" /> Document Input
                            </h3>
                        </div>
                        <div className="p-6 flex-1 flex flex-col space-y-5">
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" /> Resume Content
                                    </label>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isParsing || isAnalyzing}
                                        className="text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1.5 transition-all"
                                    >
                                        <Upload className="h-3 w-3" /> {isParsing ? 'PARSING PDF...' : 'UPLOAD PDF RATHER THAN PASTE'}
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsParsing(true);
                                        try {
                                            const text = await extractTextFromLocalPDF(file);
                                            setResumeText(text);
                                        } catch (error) {
                                            alert("Failed to extract text from PDF. Ensure it's not scanned/image-based.");
                                        } finally {
                                            setIsParsing(false);
                                        }
                                    }}
                                />
                                <textarea
                                    className="flex-1 min-h-[150px] w-full p-4 text-sm border-2 border-slate-100 rounded-xl focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                                    placeholder="Paste your resume text here..."
                                    value={resumeText}
                                    onChange={e => setResumeText(e.target.value)}
                                    disabled={isAnalyzing}
                                />
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-slate-400" /> Target Job Description (JD)
                                    </label>
                                    <button
                                        onClick={() => jdFileInputRef.current?.click()}
                                        disabled={isParsingJd || isAnalyzing}
                                        className="text-xs font-black text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-1.5 transition-all"
                                    >
                                        <Upload className="h-3 w-3" /> {isParsingJd ? 'PARSING PDF...' : 'UPLOAD PDF RATHER THAN PASTE'}
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    ref={jdFileInputRef}
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setIsParsingJd(true);
                                        try {
                                            const text = await extractTextFromLocalPDF(file);
                                            setJdText(text);
                                        } catch (error) {
                                            alert("Failed to extract text from PDF. Ensure it's not scanned/image-based.");
                                        } finally {
                                            setIsParsingJd(false);
                                        }
                                    }}
                                />
                                <textarea
                                    className="flex-1 min-h-[150px] w-full p-4 text-sm border-2 border-slate-100 rounded-xl focus:border-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                                    placeholder="Paste the job description here..."
                                    value={jdText}
                                    onChange={e => setJdText(e.target.value)}
                                    disabled={isAnalyzing}
                                />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !resumeText.trim() || !jdText.trim()}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? <span className="flex items-center gap-2"><Sparkles className="h-5 w-5 animate-spin" /> Scanning Documents...</span> : <span className="flex items-center gap-2"><Play className="h-5 w-5" /> Run ATS Analysis</span>}
                            </button>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="card-nmims h-full flex flex-col animate-fade-in-up stagger-2">
                        <div className="p-5 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                            <h3 className="font-black text-slate-800 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" /> ATS Parse Results
                            </h3>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            {!result && !isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <Brain className="h-16 w-16 text-slate-200 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">Awaiting Documents</h3>
                                    <p className="text-sm text-slate-500 max-w-[250px]">To see how your profile aligns with market demands, paste both your resume and the target JD.</p>
                                </div>
                            ) : isAnalyzing ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <div className="h-20 w-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                                    <h2 className="text-xl font-bold text-slate-900">Comparing Ontology...</h2>
                                    <p className="text-slate-500 mt-2">Matching keywords, semantic structures, and hard skills constraints.</p>
                                </div>
                            ) : result ? (
                                <div className="space-y-6">
                                    {/* Score Section */}
                                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className={`h-24 w-24 rounded-full flex items-center justify-center shadow-lg border-4 ${result.score > 75 ? 'border-green-500 text-green-600 bg-green-50' : result.score > 50 ? 'border-primary text-primary bg-primary/5' : 'border-red-500 text-red-600 bg-red-50'} text-3xl font-black mb-3`}>
                                            {result.score}%
                                        </div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">ATS Match Probability</p>
                                        <p className="text-sm font-medium text-slate-700 mt-2 italic text-center">"{result.summary}"</p>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Exp Match</p>
                                            <p className="text-sm font-black text-slate-800">{result.matchDetails.experienceMatch}</p>
                                        </div>
                                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tech Stack</p>
                                            <p className="text-sm font-black text-slate-800">{result.matchDetails.techStackMatch}</p>
                                        </div>
                                        <div className="p-3 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Alignment</p>
                                            <p className="text-sm font-black text-slate-800 truncate" title={result.matchDetails.roleAlignment}>{result.matchDetails.roleAlignment}</p>
                                        </div>
                                    </div>

                                    {/* Skills Section */}
                                    <div>
                                        <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Extracted Match Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.extractedSkills.length > 0 ? result.extractedSkills.map(s => (
                                                <span key={s} className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-bold">{s}</span>
                                            )) : <span className="text-xs text-slate-400">No matching hard skills found.</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Missing Keywords (Critical)</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingKeywords.length > 0 ? result.missingKeywords.map(s => (
                                                <span key={s} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-bold">{s}</span>
                                            )) : <span className="text-xs text-green-600 font-bold">You hit all the key requirements!</span>}
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Optimization Plan</p>
                                        <ul className="space-y-2">
                                            {result.suggestions.map((s, i) => (
                                                <li key={i} className="text-sm font-medium text-slate-700 flex items-start gap-2">
                                                    <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
