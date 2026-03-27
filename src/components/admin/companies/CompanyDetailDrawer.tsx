import React, { useEffect } from 'react';
import { X, Mail, Phone, Globe, MapPin, ExternalLink, CalendarDays } from 'lucide-react';
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
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-card border-l border-border/50 shadow-2xl z-50 overflow-y-auto animate-slide-in-right custom-scrollbar">

                {/* Visual Header */}
                <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                                {company.logoUrl ? (
                                    <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="text-2xl font-black text-primary">
                                        {company.companyName.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-1 group flex items-center gap-2">
                                    {company.companyName}
                                    {company.status === 'blacklisted' && (
                                        <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-rose-100 text-rose-600 border border-rose-200 rounded">Blacklisted</span>
                                    )}
                                </h2>
                                <p className="text-muted-foreground font-medium">{company.industry}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8 pb-12">

                    {/* Quick Package Card */}
                    <div className="bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent border border-primary/10 rounded-2xl p-5 flex justify-between items-center shadow-sm">
                        <div>
                            <span className="block text-xs text-primary font-black uppercase tracking-widest mb-1">Standard Package Range</span>
                            <span className="text-2xl font-black text-slate-800">{company.packageRange}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-xs text-muted-foreground font-black uppercase tracking-widest mb-1">Hiring Mode</span>
                            <span className="text-sm font-bold capitalize text-primary bg-primary/10 px-3 py-1 rounded-lg inline-block mt-1">{company.hiringMode.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Contact */}
                        <div className="bg-secondary/30 border border-border/30 rounded-xl p-5 space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/50 pb-2">HR & Contact</h3>

                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 p-1.5 bg-white rounded border border-border text-muted-foreground shadow-sm">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{company.hrName}</p>
                                    <a href={`mailto:${company.hrEmail}`} className="text-xs text-primary hover:underline truncate block mt-0.5 font-medium">{company.hrEmail}</a>
                                </div>
                            </div>

                            {company.hrPhone && (
                                <div className="flex items-center gap-3 text-foreground text-sm font-medium">
                                    <div className="p-1.5 bg-white rounded border border-border text-muted-foreground shadow-sm">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span>{company.hrPhone}</span>
                                </div>
                            )}

                            {company.website && (
                                <div className="flex items-center gap-3 text-sm font-medium">
                                    <div className="p-1.5 bg-white rounded border border-border text-muted-foreground shadow-sm">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1.5 truncate">
                                        Visit Website <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            )}

                            <div className="flex items-center gap-3 text-foreground text-sm font-medium">
                                <div className="p-1.5 bg-white rounded border border-border text-muted-foreground shadow-sm">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span>{company.location}</span>
                            </div>
                        </div>

                        {/* Rules and Roles */}
                        <div className="bg-secondary/30 border border-border/30 rounded-xl p-5 space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 border-b border-border/50 pb-2">Placement Scope</h3>

                            <div>
                                <span className="text-xs text-muted-foreground font-bold block mb-2 uppercase tracking-tighter">Eligible Departments</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {company.eligibleDepartments.length > 0 ? company.eligibleDepartments.map(d => (
                                        <span key={d} className="px-2 py-1 bg-white border border-border text-foreground text-[10px] font-bold rounded shadow-sm uppercase">{d}</span>
                                    )) : <span className="text-muted-foreground text-xs italic">Not specified</span>}
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="text-xs text-muted-foreground font-bold block mb-2 uppercase tracking-tighter">Offered Job Roles</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {company.jobRoles.length > 0 ? company.jobRoles.map(r => (
                                        <span key={r} className="px-2 py-1 bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold rounded shadow-sm uppercase">{r}</span>
                                    )) : <span className="text-muted-foreground text-xs italic">Not specified</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    {company.notes && (
                        <div className={`p-5 rounded-2xl border ${company.status === 'blacklisted' ? 'bg-rose-50 border-rose-200' : 'bg-white border-border shadow-sm'}`}>
                            <h4 className={`text-xs font-black uppercase tracking-widest mb-3 ${company.status === 'blacklisted' ? 'text-rose-600' : 'text-primary'}`}>Internal Admin Notes</h4>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{company.notes}</p>
                        </div>
                    )}

                    {/* Drive History Placeholder */}
                    <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-secondary/10">
                        <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                        <h4 className="text-slate-800 font-bold mb-1">Drive History & Metrics</h4>
                        <p className="text-xs text-muted-foreground">Recent interview history and drive performance will appear here.</p>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <span>Record Created: {company.createdAt.toLocaleDateString()}</span>
                        <span>Last Update: {company.updatedAt.toLocaleDateString()}</span>
                    </div>

                </div>
            </div>
        </>
    );
};
