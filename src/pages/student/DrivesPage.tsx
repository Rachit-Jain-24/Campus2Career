import { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Target,
  Upload,
  BarChart3,
  Brain,
  ShieldCheck
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { drivesDb, applicationsDb } from '../../services/db/database.service';
import type { AdminDriveProfile } from '../../types/driveAdmin';
import type { DriveApplication } from '../../services/db/types';
import { analyzeResumeWithAI, type AtsAnalysisResult } from '../../lib/gemini';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';

export default function StudentDrivesPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [drives, setDrives] = useState<AdminDriveProfile[]>([]);
    const [applications, setApplications] = useState<DriveApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing'>('all');
    
    const [selectedDrive, setSelectedDrive] = useState<AdminDriveProfile | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    
    // Resume Analysis state for application
    const [resumeText, setResumeText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AtsAnalysisResult | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.id) return;
            try {
                const [allDrives, userApps] = await Promise.all([
                    drivesDb.fetchAllDrives(),
                    applicationsDb.getStudentApplications(user.id)
                ]);
                setDrives(allDrives);
                setApplications(userApps);
            } catch (error) {
                console.error("Failed to load drives:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        // Real-time updates
        const unsubDrives = drivesDb.onDrivesChange((newDrives) => setDrives(newDrives));
        const unsubApps = applicationsDb.onApplicationsChange(() => {
             if (user?.id) applicationsDb.getStudentApplications(user.id).then(setApplications);
        });

        return () => {
            unsubDrives();
            unsubApps();
        };
    }, [user?.id]);

    const filteredDrives = drives.filter(drive => {
        const matchesSearch = drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             drive.jobRole.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || drive.status === filter;
        return matchesSearch && matchesFilter;
    });

    const isApplied = (driveId: string) => applications.some(app => app.driveId === driveId);
    const getAppStatus = (driveId: string) => applications.find(app => app.driveId === driveId)?.status;

    const handleApply = async (drive: AdminDriveProfile) => {
        if (!user?.id) return;
        
        setIsApplying(true);
        try {
            await applicationsDb.applyForDrive({
                driveId: drive.id,
                studentId: user.id,
                matchScore: analysisResult?.score || 0,
                resumeUrl: user.resumeUrl || ''
            });
            
            // Refresh applications
            const updatedApps = await applicationsDb.getStudentApplications(user.id);
            setApplications(updatedApps);
            setSelectedDrive(null);
            setAnalysisResult(null);
            setResumeText("");
            showToast(`Application submitted for ${drive.companyName}!`, 'success');
        } catch (error) {
            showToast("Failed to apply for drive. Please try again.", 'error');
        } finally {
            setIsApplying(false);
        }
    };

    const handleRunAnalysis = async () => {
        if (!resumeText || !selectedDrive?.description) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeResumeWithAI(resumeText, selectedDrive.description);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <DashboardLayout 
            role="student" 
            userName={user?.name || "Student"} 
            userYear={user?.currentYear ? `${user.currentYear} Year` : "Student"} 
            userProgram={user?.branch || "B.Tech CSE"}
        >
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Placement Drives 🏢</h1>
                        <p className="text-slate-500 font-medium">Browse and apply for active recruitment opportunities</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search roles or companies..."
                                className="input-nmims pl-10 w-full md:w-64"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="input-nmims w-auto"
                            value={filter}
                            onChange={e => setFilter(e.target.value as any)}
                        >
                            <option value="all">All Drives</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="upcoming">Upcoming</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card-nmims h-64 animate-pulse bg-slate-50" />
                        ))}
                    </div>
                ) : filteredDrives.length === 0 ? (
                    <div className="card-nmims p-12 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No matching drives found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mt-2">Check back later or adjust your filters to see more opportunities.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredDrives.map((drive) => (
                            <div key={drive.id} className="card-nmims overflow-hidden flex flex-col group hover:border-primary/30 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                            <Briefcase className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 leading-tight">{drive.companyName}</h3>
                                            <p className="text-sm font-bold text-primary truncate max-w-[150px]">{drive.jobRole}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        drive.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {drive.status}
                                    </div>
                                </div>
                                
                                <div className="p-5 flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Package</p>
                                            <p className="text-sm font-bold text-slate-700">{drive.packageRange || 'As per norms'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</p>
                                            <p className="text-sm font-bold text-slate-700 capitalize">{drive.mode}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Starts: {new Date(drive.registrationStart).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="p-5 bg-slate-50/50 border-t border-slate-100">
                                    {isApplied(drive.id) ? (
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-sm font-black uppercase tracking-tight">Applied</span>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {getAppStatus(drive.id)}
                                            </span>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setSelectedDrive(drive)}
                                            className="w-full py-2.5 bg-white border-2 border-primary/20 text-primary font-black rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                                        >
                                            View & Apply <ArrowRight className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Application Modal */}
                {selectedDrive && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-primary/10 flex items-center justify-center">
                                        <Briefcase className="h-7 w-7 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedDrive.companyName}</h2>
                                        <p className="text-sm font-bold text-primary">{selectedDrive.jobRole} Role</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setSelectedDrive(null); setAnalysisResult(null); }}
                                    className="h-10 w-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors"
                                >
                                    <ChevronRight className="h-6 w-6 rotate-90 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid gap-8 lg:grid-cols-5">
                                    {/* JD Section */}
                                    <div className="lg:col-span-3 space-y-6">
                                        <section>
                                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Target className="h-4 w-4" /> Job Description
                                            </h3>
                                            <div className="prose prose-sm max-w-none text-slate-600 font-medium whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                {selectedDrive.description || "No detailed description provided."}
                                            </div>
                                        </section>

                                        <section className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Package</p>
                                                <p className="text-base font-black text-slate-800">{selectedDrive.packageRange || 'Not disclosed'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                                <p className="text-base font-black text-slate-800 capitalize">{selectedDrive.mode}</p>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Application Tools Section */}
                                    <div className="lg:col-span-2 space-y-6 border-l border-slate-100 lg:pl-8">
                                        <div className="card-nmims p-6 bg-gradient-to-br from-primary/5 to-white border-primary/10">
                                            <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                                                <Sparkles className="h-5 w-5 text-primary" /> Apply with AI Check
                                            </h3>
                                            
                                            <div className="space-y-4">
                                                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                                                    Our AI analyzes your resume against this specific JD to give you an ATS match score before you apply.
                                                </p>

                                                {!analysisResult ? (
                                                    <div className="space-y-3">
                                                        <button 
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={isParsing || isAnalyzing}
                                                            className="w-full py-3 bg-white border-2 border-dashed border-primary/30 rounded-xl text-primary font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
                                                        >
                                                            <Upload className="h-4 w-4" /> {isParsing ? "Parsing PDF..." : "Upload Resume (PDF)"}
                                                        </button>
                                                        <input 
                                                            type="file" 
                                                            ref={fileInputRef} 
                                                            className="hidden" 
                                                            accept=".pdf" 
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (!file) return;
                                                                setIsParsing(true);
                                                                try {
                                                                    const text = await extractTextFromLocalPDF(file);
                                                                    setResumeText(text);
                                                                } catch (err) {
                                                                    showToast("Failed to read PDF. Ensure it is a text-based PDF.", 'error');
                                                                } finally {
                                                                    setIsParsing(false);
                                                                }
                                                            }}
                                                        />
                                                        
                                                        {resumeText && (
                                                            <button 
                                                                onClick={handleRunAnalysis}
                                                                disabled={isAnalyzing}
                                                                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                                            >
                                                                {isAnalyzing ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Brain className="h-4 w-4" />}
                                                                Run Compatibility Scan
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                                                        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-primary/10 shadow-sm">
                                                            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-black mb-1 ${
                                                                analysisResult.score > 75 ? 'text-green-600' : 'text-primary'
                                                            }`}>
                                                                {analysisResult.score}%
                                                            </div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <p className="text-xs font-bold text-slate-700">Quick Feedback:</p>
                                                            <p className="text-xs text-slate-500 italic">"{analysisResult.summary}"</p>
                                                        </div>

                                                        <button 
                                                            onClick={() => setAnalysisResult(null)}
                                                            className="text-[10px] font-bold text-primary hover:underline uppercase"
                                                        >
                                                            Re-run Scan
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => handleApply(selectedDrive)}
                                            disabled={isApplying}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-base shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isApplying ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ShieldCheck className="h-5 w-5" /> Submit Application</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
