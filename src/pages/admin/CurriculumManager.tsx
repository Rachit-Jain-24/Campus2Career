import { useState, useRef } from 'react';
import { 
    Upload, CheckCircle2, AlertCircle, RefreshCw, 
    BookOpen, Layers, X
} from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { extractTextFromLocalPDF } from '../../lib/pdfParser';
import { copilotEngine } from '../../lib/ai/copilotEngine';
import { curriculumDb } from '../../services/db/database.service';

interface CurriculumSubject {
    name: string;
    industryRelevance: 'high' | 'medium' | 'low';
    description: string;
}

interface SemesterData {
    semester: number;
    subjects: CurriculumSubject[];
}

export const CurriculumManager = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [curriculum, setCurriculum] = useState<SemesterData[] | null>(null);
    const [branch, setBranch] = useState('B.Tech CSE');
    const [batch, setBatch] = useState('2022-2026');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        setCurriculum(null);

        try {
            // 1. Extract Text
            const text = await extractTextFromLocalPDF(file);
            if (!text.trim()) throw new Error("Could not extract text from PDF.");

            // 2. Parse with AI into 4-year plan
            setIsParsing(true);
            const prompt = `
                Analyze this 4-year (8 semesters) curriculum master syllabus.
                Break it down by semester.
                For each semester, list the subjects and their industry relevance for a student aiming for high-track tech roles.
                
                SYLLABUS TEXT:
                ${text.slice(0, 10000)}
                
                Return ONLY valid JSON in this format:
                {
                    "semesters": [
                        {
                            "semester": 1,
                            "subjects": [
                                { "name": "Subject Name", "industryRelevance": "high/medium/low", "description": "Brief description" }
                            ]
                        }
                    ]
                }
            `;

            const aiResponse = await copilotEngine.callLLM(prompt, { json: true });
            const parsed = JSON.parse(aiResponse);

            if (!parsed.semesters) throw new Error("Invalid format returned from AI.");

            // 3. Save to Firebase Storage (Keeping for now)
            const storageRef = ref(storage, `curriculum/${branch}/${batch}/master_syllabus.pdf`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            const curriculumDoc = {
                branch,
                batch,
                downloadUrl,
                semesters: parsed.semesters,
                updatedAt: new Date().toISOString(),
                uploadedBy: 'Program Chair'
            };

            // Use the database-agnostic service layer
            await curriculumDb.saveCurriculum(curriculumDoc);
            
            setCurriculum(parsed.semesters);
        } catch (err: any) {
            setError(err.message || "An error occurred during upload.");
        } finally {
            setIsUploading(false);
            setIsParsing(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm shadow-blue-500/5">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-amber-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Curriculum Manager</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Define the 4-year academic roadmap for your batch</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch</label>
                        <select 
                            value={branch} 
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                        >
                            <option>B.Tech CSE</option>
                            <option>B.Tech IT</option>
                            <option>B.Tech Mech</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Batch</label>
                        <select 
                            value={batch} 
                            onChange={(e) => setBatch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                        >
                            <option>2022-2026</option>
                            <option>2023-2027</option>
                            <option>2024-2028</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            {!curriculum && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer flex flex-col items-center justify-center bg-white ${isUploading ? 'border-amber-300 bg-amber-50' : 'border-slate-200 hover:border-amber-400 hover:bg-amber-50/30'}`}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                    
                    {isUploading ? (
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="relative">
                                <div className="h-20 w-20 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin" />
                                <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-amber-600 animate-pulse" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xl font-black text-slate-800">{isParsing ? 'AI Parsing Curriculum...' : 'Uploading PDF...'}</p>
                                <p className="text-sm text-slate-500 font-medium">Breaking down 48 months of academic planning...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="h-20 w-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                                <Upload className="h-10 w-10 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-black text-slate-800">Upload Master Syllabus</p>
                                <p className="text-sm text-slate-500 font-medium">Upload the 4-year curriculum PDF to generate student roadmaps automatically</p>
                            </div>
                            <div className="pt-4 flex items-center justify-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> 8 Semesters Breakdown
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" /> AI-Subject Mapping
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-4">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto p-1.5 hover:bg-red-100 rounded-lg"><X className="h-4 w-4" /></button>
                </div>
            )}

            {/* Curriculum Preview */}
            {curriculum && (
                <div className="grid lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {curriculum.map((sem, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-black italic">
                                        S{sem.semester}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">Semester {sem.semester}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Academic Period</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                                    {sem.subjects.length} Subjects
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {sem.subjects.map((sub, sIdx) => (
                                    <div key={sIdx} className="group p-4 rounded-2xl border border-slate-50 bg-white hover:border-amber-200 hover:bg-amber-50/30 transition-all flex items-center justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                                                <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{sub.name}</p>
                                                <p className="text-xs text-slate-400 line-clamp-1">{sub.description}</p>
                                            </div>
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                            sub.industryRelevance === 'high' ? 'bg-green-50 text-green-700 border-green-200' :
                                            sub.industryRelevance === 'medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                            {sub.industryRelevance}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Actions bar */}
                    <div className="lg:col-span-2 flex items-center justify-between bg-slate-900 p-6 rounded-[2.5rem] mt-4">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                            <div>
                                <p className="text-white font-bold">Plan Finalized</p>
                                <p className="text-white/50 text-xs">Curriculum is now active for all {branch} students.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setCurriculum(null)}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-black transition-all"
                        >
                            <RefreshCw className="h-4 w-4" /> Re-upload Syllabus
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
