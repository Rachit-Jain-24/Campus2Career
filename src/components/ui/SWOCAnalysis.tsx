import React, { useState, useEffect } from 'react';
import { 
    Zap, AlertTriangle, Target, ShieldAlert, 
    RefreshCw, Sparkles, BrainCircuit, Lightbulb
} from 'lucide-react';
import { generateSWOC } from '../../lib/aiService';
import { Card } from './Card';

interface SWOCData {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    challenges: string[];
    summary: string;
}

interface SWOCAnalysisProps {
    studentData: any;
    onUpdate?: (newSWOC: any) => void;
    editable?: boolean;
}

export const SWOCAnalysis: React.FC<SWOCAnalysisProps> = ({ studentData, onUpdate, editable = false }) => {
    const [swoc, setSwoc] = useState<SWOCData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (studentData?.assessmentResults?.swoc && !swoc) {
            setSwoc(studentData.assessmentResults.swoc);
        }
    }, [studentData]);

    const handleRefresh = async () => {
        setLoading(true);
        const newSWOC = await generateSWOC(studentData);
        setSwoc(newSWOC);
        if (onUpdate) {
            onUpdate(newSWOC);
        }
        setLoading(false);
    };

    if (!swoc && !loading) {
        return (
            <Card className="p-8 text-center bg-slate-50 border-dashed border-2">
                <BrainCircuit className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No SWOC Analysis Yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                    Generate a personalized SWOC analysis based on your current profile.
                </p>
                <button
                    onClick={handleRefresh}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-2 mx-auto hover:scale-105 transition-transform"
                >
                    <Sparkles className="h-4 w-4" /> Generate Insights
                </button>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                        <Target className="h-6 w-6 text-primary" />
                        Career SWOC Insights
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Personalized assessment of your career profile</p>
                </div>
                {editable && (
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 disabled:opacity-50"
                        title="Refresh Insights"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : swoc && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-[2.5rem] p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-black text-emerald-900">Strengths</h3>
                            </div>
                            <ul className="space-y-3">
                                {swoc.strengths.map((s, i) => (
                                    <li key={i} className="flex gap-2 text-sm font-bold text-emerald-800">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-amber-50/50 border border-amber-100/50 rounded-[2.5rem] p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-black text-amber-900">Weaknesses</h3>
                            </div>
                            <ul className="space-y-3">
                                {swoc.weaknesses.map((w, i) => (
                                    <li key={i} className="flex gap-2 text-sm font-bold text-amber-800">
                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                        {w}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Opportunities */}
                        <div className="bg-sky-50/50 border border-sky-100/50 rounded-[2.5rem] p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-sky-500 rounded-2xl flex items-center justify-center text-white">
                                    <Lightbulb className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-black text-sky-900">Opportunities</h3>
                            </div>
                            <ul className="space-y-3">
                                {swoc.opportunities.map((o, i) => (
                                    <li key={i} className="flex gap-2 text-sm font-bold text-sky-800">
                                        <div className="h-1.5 w-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                        {o}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Challenges */}
                        <div className="bg-rose-50/50 border border-rose-100/50 rounded-[2.5rem] p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-black text-rose-900">Challenges</h3>
                            </div>
                            <ul className="space-y-3">
                                {swoc.challenges.map((c, i) => (
                                    <li key={i} className="flex gap-2 text-sm font-bold text-rose-800">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="relative group p-1 rounded-[2.5rem] bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5 border border-slate-100">
                        <div className="bg-white p-6 rounded-[2.2rem]">
                            <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                <Sparkles className="h-3 w-3 text-primary" />
                                Strategic Career Summary
                            </h4>
                            <p className="text-slate-700 font-bold leading-relaxed italic">
                                "{swoc.summary}"
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
