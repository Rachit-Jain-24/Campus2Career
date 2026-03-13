import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Briefcase, FileText, Clock } from 'lucide-react';
import type { AdminDriveProfile } from '../../../types/driveAdmin';

interface DriveDetailDrawerProps {
    drive: AdminDriveProfile | null;
    isOpen: boolean;
    onClose: () => void;
}

export const DriveDetailDrawer: React.FC<DriveDetailDrawerProps> = ({
    drive,
    isOpen,
    onClose
}) => {

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !drive) return null;

    const isRegOpen = new Date() >= drive.registrationStart && new Date() <= drive.registrationEnd;

    return (
        <>
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 overflow-y-auto animate-slide-in-right custom-scrollbar">

                {/* Header Section */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                    ${drive.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        drive.status === 'ongoing' ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' :
                                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}
                                >
                                    {drive.status.replace('_', ' ')}
                                </span>
                                {isRegOpen && (
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span> Registration Active
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{drive.title}</h2>
                            <p className="text-brand-400 font-medium flex items-center gap-2">
                                {drive.companyName} <span className="text-slate-600">•</span> {drive.jobRole}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 ml-4"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8 pb-12">

                    {/* Quick Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Package</span>
                            <span className="text-sm font-bold text-emerald-400">{drive.packageRange}</span>
                        </div>
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Mode</span>
                            <span className="text-sm font-bold text-white capitalize">{drive.mode.replace('-', ' ')}</span>
                        </div>
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Applicants</span>
                            <span className="text-sm font-bold text-white">{drive.applicantCount}</span>
                        </div>
                        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-center">
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Shortlisted</span>
                            <span className="text-sm font-bold text-brand-400">{drive.shortlistedCount}</span>
                        </div>
                    </div>

                    {/* Descriptions & Base rules */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Briefcase className="w-4 h-4 text-brand-500" /> Drive Overview
                        </h3>
                        {drive.description && (
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-800/20 p-4 rounded-xl border border-slate-700/30">
                                {drive.description}
                            </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span>Location: <span className="text-white font-medium">{drive.location}</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>Registration: <span className="text-white font-medium">{drive.registrationStart.toLocaleDateString()}</span> to <span className="text-white font-medium">{drive.registrationEnd.toLocaleDateString()}</span></span>
                        </div>
                    </div>

                    {/* Eligibility Rules */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                            <FileText className="w-4 h-4 text-brand-500" /> Exact Eligibility Criteria
                        </h3>
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">

                            <div>
                                <span className="text-xs text-slate-500 block mb-1">Min CGPA</span>
                                <span className="text-sm font-bold text-white">{drive.eligibilityRules.minCGPA || 'No minimum'}</span>
                            </div>

                            <div>
                                <span className="text-xs text-slate-500 block mb-1">Backlog Rule</span>
                                <span className="text-sm font-medium text-white">
                                    {drive.eligibilityRules.maxActiveBacklogs === 0 ? 'No Active Backlogs' : `Max ${drive.eligibilityRules.maxActiveBacklogs} Active`}
                                    <span className="text-slate-500 ml-1">({drive.eligibilityRules.maxHistoryBacklogs} History allowed)</span>
                                </span>
                            </div>

                            <div className="md:col-span-2">
                                <span className="text-xs text-slate-500 block mb-2">Allowed Programs & Years</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {drive.eligibilityRules.allowedDepartments.map(d => (
                                        <span key={d} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded shadow-sm">{d}</span>
                                    ))}
                                    {drive.eligibilityRules.allowedYears.map(y => (
                                        <span key={y} className="px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs rounded shadow-sm">{y}</span>
                                    ))}
                                </div>
                            </div>

                            {drive.eligibilityRules.requiredSkills && drive.eligibilityRules.requiredSkills.length > 0 && (
                                <div className="md:col-span-2 pt-2 border-t border-slate-700/50">
                                    <span className="text-xs text-slate-500 block mb-2">Mandatory Skills</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {drive.eligibilityRules.requiredSkills.map(s => (
                                            <span key={s} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded shadow-sm">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Timeline Stages View */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                            <Clock className="w-4 h-4 text-brand-500" /> Drive Timeline & Stages
                        </h3>

                        <div className="relative pl-6 space-y-6 pt-2">
                            {/* Vertical Line */}
                            <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-slate-800"></div>

                            {drive.stages.length === 0 ? (
                                <p className="text-sm text-slate-500 italic py-4">No specific stages configured</p>
                            ) : (
                                drive.stages.map((stage, idx) => {
                                    const isComplete = stage.status === 'completed';
                                    const isActive = stage.status === 'active';

                                    return (
                                        <div key={stage.id} className="relative z-10 group">
                                            {/* Node Marker */}
                                            <div className={`absolute -left-[30px] w-5 h-5 rounded-full border-4 border-slate-900 flex items-center justify-center transition-colors
                                                ${isComplete ? 'bg-emerald-500' :
                                                    isActive ? 'bg-brand-500 shadow-[0_0_10px_rgba(var(--brand-500-rgb),0.5)]' :
                                                        'bg-slate-700'}`}
                                            ></div>

                                            <div className={`bg-slate-800/30 border rounded-xl p-4 transition-all
                                                ${isActive ? 'border-brand-500/50 shadow-lg shadow-black/20' : 'border-slate-700/50'}`}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <h4 className={`text-sm font-bold mb-1 ${isComplete ? 'text-slate-300' : isActive ? 'text-brand-400' : 'text-slate-400'}`}>
                                                            Round {idx + 1}: {stage.name}
                                                        </h4>
                                                        {stage.description && (
                                                            <p className="text-xs text-slate-500 mt-1">{stage.description}</p>
                                                        )}
                                                    </div>
                                                    {stage.date && (
                                                        <div className="text-right flex-shrink-0">
                                                            <span className="block text-xs font-medium text-slate-400">
                                                                {stage.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};
