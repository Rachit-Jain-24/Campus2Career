import React, { useEffect } from 'react';
import { X, Mail, Phone, Globe, MapPin, ExternalLink, CalendarDays,} from 'lucide-react';
import type { AdminCompanyProfile } from '../../../types/companyAdmin';

interface CompanyDetailDrawerProps {
    company: AdminCompanyProfile | null;
    isOpen: boolean;
    onClose: () => void;
}

export const CompanyDetailDrawer: React.FC<CompanyDetailDrawerProps> = ({
    company,
    isOpen,
    onClose
}) => {

    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !company) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 overflow-y-auto animate-slide-in-right custom-scrollbar">

                {/* Visual Header */}
                <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                                {company.logoUrl ? (
                                    <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="text-2xl font-bold text-brand-300 font-serif">
                                        {company.companyName.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1 group flex items-center gap-2">
                                    {company.companyName}
                                    {company.status === 'blacklisted' && (
                                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded">Blacklisted</span>
                                    )}
                                </h2>
                                <p className="text-slate-400 font-medium">{company.industry}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8 pb-12">

                    {/* Quick Package Card */}
                    <div className="bg-gradient-to-r from-brand-900/40 to-slate-800/40 border border-brand-500/20 rounded-2xl p-5 flex justify-between items-center shadow-lg">
                        <div>
                            <span className="block text-xs text-brand-400/80 font-bold uppercase tracking-wider mb-1">Standard Package Range</span>
                            <span className="text-2xl font-black text-white">{company.packageRange}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Hiring Mode</span>
                            <span className="text-sm font-semibold capitalize text-brand-300">{company.hiringMode.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Contact */}
                        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-2">HR & Contact</h3>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-slate-800 rounded text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{company.hrName}</p>
                                    <a href={`mailto:${company.hrEmail}`} className="text-xs text-brand-400 hover:text-brand-300 truncate block mt-0.5">{company.hrEmail}</a>
                                </div>
                            </div>

                            {company.hrPhone && (
                                <div className="flex items-center gap-3 text-slate-300 text-sm">
                                    <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span>{company.hrPhone}</span>
                                </div>
                            )}

                            {company.website && (
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1.5 truncate">
                                        Visit Website <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <div className="p-1.5 bg-slate-800 rounded text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span>{company.location}</span>
                            </div>
                        </div>

                        {/* Rules and Roles */}
                        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-700/50 pb-2">Placement Scope</h3>

                            <div>
                                <span className="text-xs text-slate-500 font-medium block mb-2 text-wrap">Eligible Departments</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {company.eligibleDepartments.length > 0 ? company.eligibleDepartments.map(d => (
                                        <span key={d} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded shadow-sm">{d}</span>
                                    )) : <span className="text-slate-500 text-xs italic">Not specified</span>}
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="text-xs text-slate-500 font-medium block mb-2">Offered Job Roles</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {company.jobRoles.length > 0 ? company.jobRoles.map(r => (
                                        <span key={r} className="px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs rounded shadow-sm">{r}</span>
                                    )) : <span className="text-slate-500 text-xs italic">Not specified</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    {company.notes && (
                        <div className={`p-4 rounded-xl border ${company.status === 'blacklisted' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/50 border-slate-700/50'}`}>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${company.status === 'blacklisted' ? 'text-rose-400' : 'text-slate-400'}`}>Internal Admin Notes</h4>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{company.notes}</p>
                        </div>
                    )}

                    {/* Drive History Placeholder */}
                    <div className="border border-dashed border-slate-700 rounded-xl p-6 text-center opacity-70">
                        <CalendarDays className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                        <h4 className="text-slate-300 font-medium mb-1">Drive History & Metrics</h4>
                        <p className="text-xs text-slate-500">Integration with Placement Drives module pending.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-600 font-medium uppercase tracking-wider">
                        <span>Created: {company.createdAt.toLocaleDateString()}</span>
                        <span>Updated: {company.updatedAt.toLocaleDateString()}</span>
                    </div>

                </div>
            </div>
        </>
    );
};
