import React from 'react';
import { X, Building2, User, IndianRupee, MapPin, Briefcase, CalendarClock, Link as LinkIcon, FileText, CheckCircle2, Clock, XCircle, AlertCircle, FileArchive, Info } from 'lucide-react';
import type { AdminOffer } from '../../../types/offerAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';

interface OfferDetailDrawerProps {
    offer: AdminOffer | null;
    isOpen: boolean;
    onClose: () => void;
}

export const OfferDetailDrawer: React.FC<OfferDetailDrawerProps> = ({ offer, isOpen, onClose }) => {
    const { user } = useAuth();
    const canManage = hasPermission(user, 'manage_offers');

    if (!isOpen || !offer) return null;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'issued': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'on_hold': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'expired': return 'bg-slate-500/10 text-muted-foreground border-slate-500/20';
            default: return 'bg-secondary text-foreground border-border';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
            case 'issued': return <FileText className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            case 'on_hold': return <Clock className="w-4 h-4" />;
            case 'expired': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'TBA / Unspecified';
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        }).format(date);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md xl:max-w-lg bg-card h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">

                {/* Header */}
                <div className="px-6 py-5 border-b border-border flex justify-between items-start bg-card/80">
                    <div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${getStatusStyle(offer.status)} uppercase tracking-wider mb-3`}>
                            {getStatusIcon(offer.status)}
                            {offer.status.replace('_', ' ')}
                        </div>
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            <IndianRupee className="w-5 h-5 text-emerald-500" />
                            {offer.ctc} LPA Offer
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2 font-medium">
                            <span className="text-primary">{offer.role}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                    {/* Parties involved */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/50 border border-border/50 rounded-xl">
                            <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider mb-2">
                                <User className="w-4 h-4" /> Recipient
                            </div>
                            <div className="text-sm font-bold text-foreground">{offer.studentName}</div>
                            <div className="text-xs text-muted-foreground mt-1">{offer.studentDepartment}</div>
                            <div className="text-xs text-brand-500 mt-0.5">{offer.studentYear}</div>
                        </div>
                        <div className="p-4 bg-secondary/50 border border-border/50 rounded-xl">
                            <div className="flex items-center gap-2 text-muted-foreground font-semibold text-xs uppercase tracking-wider mb-2">
                                <Building2 className="w-4 h-4" /> Provider
                            </div>
                            <div className="text-sm font-bold text-foreground">{offer.companyName}</div>
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{offer.driveTitle}</div>
                            <div className="text-xs text-brand-500 mt-0.5 cursor-pointer hover:underline">View Drive</div>
                        </div>
                    </div>

                    {/* Meta specifics */}
                    <section>
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-brand-500" /> Package & Logistics
                        </h3>
                        <div className="bg-background border border-border rounded-xl overflow-hidden divide-y divide-slate-800 text-sm">
                            <div className="flex py-3 px-4">
                                <span className="text-muted-foreground w-1/3">Job Role</span>
                                <span className="text-foreground font-medium flex-1">{offer.role}</span>
                            </div>
                            <div className="flex py-3 px-4">
                                <span className="text-muted-foreground w-1/3">Base CTC</span>
                                <span className="text-emerald-400 font-bold flex-1">{offer.ctc} LPA</span>
                            </div>
                            <div className="flex py-3 px-4">
                                <span className="text-muted-foreground w-1/3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</span>
                                <span className="text-foreground font-medium flex-1">{offer.location}</span>
                            </div>
                            <div className="flex py-3 px-4">
                                <span className="text-muted-foreground w-1/3 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> Joining Data</span>
                                <span className="text-foreground font-medium flex-1">{formatDate(offer.joiningDate)}</span>
                            </div>
                            <div className="flex py-3 px-4">
                                <span className="text-muted-foreground w-1/3 flex items-center gap-1.5"><FileArchive className="w-3.5 h-3.5" /> Bond Duration</span>
                                <span className="text-foreground font-medium flex-1">{offer.bondDuration || 'None'}</span>
                            </div>
                        </div>
                    </section>

                    {/* Resources */}
                    {canManage && (
                        <section>
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-brand-500" /> Documents & Notes
                            </h3>
                            <div className="space-y-3">
                                {offer.offerLetterUrl ? (
                                    <a href={offer.offerLetterUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/20 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-indigo-400 group-hover:text-indigo-300">Official Offer Letter</div>
                                                <div className="text-xs text-indigo-500/70">External Cloud Link</div>
                                            </div>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-card border border-border border-dashed rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-secondary rounded-lg text-muted-foreground">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-muted-foreground">No Document Linked</div>
                                                <div className="text-xs text-muted-foreground">Attach via edit mode</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {offer.notes && (
                                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500/70 uppercase tracking-wider mb-1.5">
                                            <Info className="w-3.5 h-3.5" /> Analyst Notes
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed text-wrap">
                                            {offer.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Timestamps */}
                    <div className="pt-4 mt-auto border-t border-border flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Created: {new Date(offer.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(offer.updatedAt).toLocaleDateString()}</span>
                    </div>

                </div>
            </div>
        </div>
    );
};
