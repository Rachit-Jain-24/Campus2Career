import React, { useState } from 'react';
import { 
    Zap, AlertTriangle, ShieldAlert, 
    RefreshCw, Sparkles, BrainCircuit, Lightbulb, TrendingUp
} from 'lucide-react';
import { generateBatchSWOC } from '../../../lib/aiService';

interface BatchSWOCData {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    challenges: string[];
    strategicAdvice: string;
}

interface BatchSWOCSectionProps {
    batchData: {
        total: number;
        avgCgpa: number;
        topSkills: string[];
        placementRate: string | number;
        internshipRate?: number;
        careerTracks: string[];
    };
}

export const BatchSWOCSection: React.FC<BatchSWOCSectionProps> = ({ batchData }) => {
    const [swoc, setSwoc] = useState<BatchSWOCData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        const result = await generateBatchSWOC(batchData);
        setSwoc(result);
        setLoading(false);
    };

    return (
        <div className="card-nmims p-6 bg-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 -mr-10 -mt-10 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Batch Performance Analysis
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">Strategic insights for the current batch</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-black uppercase rounded-xl shadow-lg hover:bg-primary-dark transition-all disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {swoc ? 'Re-analyze' : 'Analyze Batch'}
                </button>
            </div>

            {!swoc && !loading && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                    <BrainCircuit className="h-12 w-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold text-sm text-center max-w-xs px-4">
                        Click 'Analyze' to perform a strategic analysis of the current batch metrics.
                    </p>
                </div>
            )}

            {loading && (
                <div className="space-y-4 py-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                        <div className="h-32 bg-slate-50 rounded-3xl animate-pulse" />
                    </div>
                    <div className="h-24 bg-slate-50 rounded-3xl animate-pulse" />
                </div>
            )}

            {swoc && !loading && (
                <div className="space-y-6 relative z-10 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                            <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Zap className="h-3 w-3" /> Strengths
                            </h4>
                            <ul className="space-y-2">
                                {swoc.strengths.slice(0, 3).map((s, i) => (
                                    <li key={i} className="text-xs font-bold text-emerald-900 flex gap-2">
                                        <div className="h-1 w-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                            <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-3 w-3" /> Weaknesses
                            </h4>
                            <ul className="space-y-2">
                                {swoc.weaknesses.slice(0, 3).map((w, i) => (
                                    <li key={i} className="text-xs font-bold text-amber-900 flex gap-2">
                                        <div className="h-1 w-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100/50">
                            <h4 className="text-xs font-black text-sky-700 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Lightbulb className="h-3 w-3" /> Opportunities
                            </h4>
                            <ul className="space-y-2">
                                {swoc.opportunities.slice(0, 3).map((o, i) => (
                                    <li key={i} className="text-xs font-bold text-sky-900 flex gap-2">
                                        <div className="h-1 w-1 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                                        {o}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Challenges */}
                        <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100/50">
                            <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <ShieldAlert className="h-3 w-3" /> Challenges
                            </h4>
                            <ul className="space-y-2">
                                {swoc.challenges.slice(0, 3).map((c, i) => (
                                    <li key={i} className="text-xs font-bold text-rose-900 flex gap-2">
                                        <div className="h-1 w-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="p-5 rounded-[2rem] bg-slate-900 text-white shadow-xl shadow-slate-200">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" /> Strategic Advice
                        </h4>
                        <p className="text-sm font-medium leading-relaxed italic text-white/90">
                            "{swoc.strategicAdvice}"
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
