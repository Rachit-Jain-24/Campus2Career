import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, UserCheck, UserX, Calculator } from 'lucide-react';
import type { AdminEligibilityRule } from '../../../types/eligibilityAdmin';
import { useStudents } from '../../../hooks/admin/useStudents';
import type { RuleEvaluationResult } from '../../../utils/admin/eligibilityEvaluator';

interface EligibilityDetailDrawerProps {
    rule: AdminEligibilityRule | null;
    isOpen: boolean;
    onClose: () => void;
    // Injecting explicit preview states matching useEligibilityRules
    previewState: {
        isEvaluating: boolean;
        results: RuleEvaluationResult | null;
        evaluatedRuleId: string | null;
    };
    onTriggerEvaluation: (rule: AdminEligibilityRule, students: any[]) => void;
}

export const EligibilityDetailDrawer: React.FC<EligibilityDetailDrawerProps> = ({
    rule,
    isOpen,
    onClose,
    previewState,
    onTriggerEvaluation
}) => {

    // Explicitly reusing standard students hook for realistic cross-evaluation
    const { students: allStudents, isLoading: isStudentsLoading } = useStudents();

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Ensure evaluation triggers implicitly whenever rule loads entirely independently of hook fetch times
    useEffect(() => {
        if (isOpen && rule && !isStudentsLoading && allStudents.length > 0) {
            // Check if we already evaluated this specific rule to prevent rapid looping
            if (previewState.evaluatedRuleId !== rule.id) {
                onTriggerEvaluation(rule, allStudents);
            }
        }
    }, [isOpen, rule, isStudentsLoading, allStudents, previewState.evaluatedRuleId, onTriggerEvaluation]);

    if (!isOpen || !rule) return null;

    const evaluationResults = previewState.results;
    const isEvaluating = previewState.isEvaluating || isStudentsLoading;

    return (
        <>
            <div
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 w-full md:w-[650px] bg-card border-l border-border/50 shadow-2xl z-50 overflow-y-auto animate-slide-in-right custom-scrollbar">

                {/* Header Section */}
                <div className="sticky top-0 z-20 bg-card/95 backdrop-blur-xl border-b border-border p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rule.active
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-slate-500/20 text-muted-foreground border border-slate-500/30'
                                    }`}>
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    {rule.active ? 'System Active' : 'System Disabled'}
                                </span>
                                <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                    Global Template
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-1 leading-tight">{rule.ruleName}</h2>
                            <p className="text-muted-foreground text-sm">{rule.description}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors flex-shrink-0 ml-4"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8 pb-12">

                    {/* Explicit Rules View */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                            <FileText className="w-4 h-4 text-brand-500" /> Computed Logic Outline
                        </h3>
                        <div className="bg-secondary/30 rounded-xl border border-border/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">

                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Min CGPA</span>
                                <span className="text-sm font-bold text-foreground">{rule.minCGPA || 'No minimum'}</span>
                            </div>

                            <div>
                                <span className="text-xs text-muted-foreground block mb-1">Backlog Rule</span>
                                <span className="text-sm font-medium text-foreground">
                                    {rule.maxActiveBacklogs === 0 ? 'No Active Backlogs' : `Max ${rule.maxActiveBacklogs} Active`}
                                    <span className="text-muted-foreground ml-1">({rule.maxHistoryBacklogs} Historic)</span>
                                </span>
                            </div>

                            <div className="md:col-span-2">
                                <span className="text-xs text-muted-foreground block mb-2">Scope of Departments</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {rule.allowedDepartments.length > 0 ? rule.allowedDepartments.map(d => (
                                        <span key={d} className="px-2 py-0.5 bg-secondary border border-border text-foreground text-xs rounded shadow-sm">{d}</span>
                                    )) : <span className="text-muted-foreground text-sm italic">Open to all</span>}
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-3 border-t border-border/50 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-2">Target Years</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {rule.allowedYears.length > 0 ? rule.allowedYears.map((y, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-primary/10 border border-brand-500/20 text-brand-300 text-xs rounded shadow-sm">{y}</span>
                                        )) : <span className="text-muted-foreground text-sm italic">Any</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {rule.requiresResumeApproval ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-600" />}
                                        <span className="text-xs text-foreground">Resume Approval</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {rule.mandatoryInternship ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-slate-600" />}
                                        <span className="text-xs text-foreground">Prior Internship</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Pre-computation Preview */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-brand-500" /> Database Live Preview
                            </h3>
                            {isEvaluating && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <div className="w-3 h-3 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                    Evaluating Matrix...
                                </span>
                            )}
                        </div>

                        {!isEvaluating && evaluationResults && (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <UserCheck className="w-8 h-8 text-emerald-500 mb-2 opacity-80" />
                                    <span className="text-2xl font-bold text-emerald-400">{evaluationResults.eligible.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-emerald-500/70 tracking-wider">Eligible Students</span>
                                </div>
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <UserX className="w-8 h-8 text-rose-500 mb-2 opacity-80" />
                                    <span className="text-2xl font-bold text-rose-400">{evaluationResults.ineligible.length}</span>
                                    <span className="text-[10px] uppercase font-bold text-rose-500/70 tracking-wider">Failed Criteria</span>
                                </div>
                            </div>
                        )}

                        {!isEvaluating && evaluationResults && evaluationResults.ineligible.length > 0 && (
                            <div className="mt-4 bg-card border border-border/50 rounded-xl overflow-hidden">
                                <div className="px-4 py-3 bg-secondary/50 border-b border-border/50 text-xs font-semibold text-foreground">
                                    Sample Ineligibility Report (Top 5)
                                </div>
                                <div className="divide-y divide-slate-700/50">
                                    {evaluationResults.ineligible.slice(0, 5).map(({ student, reasons }) => (
                                        <div key={student.id} className="p-3 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="text-sm font-medium text-foreground mb-1">
                                                    {student.fullName} <span className="text-muted-foreground text-xs font-normal">({student.department})</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {reasons.map((r, i) => (
                                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </>
    );
};
