import React from 'react';
import { IndianRupee, MapPin, Building2, User, ChevronUp, ChevronDown, CheckCircle2, Clock, XCircle, AlertCircle, FileText, ArrowLeftRight, Award } from 'lucide-react';
import type { AdminOffer, OfferSortField, OfferSortConfig } from '../../../types/offerAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';

interface OfferTableProps {
    offers: AdminOffer[];
    sortConfig: OfferSortConfig;
    onSort: (field: OfferSortField) => void;
    onViewOffer: (offer: AdminOffer) => void;
    onEditOffer: (offer: AdminOffer) => void;
    onCompareOffer: (offer: AdminOffer) => void;
    compareListIds: string[];
    isLoading: boolean;
}

export const OfferTable: React.FC<OfferTableProps> = ({
    offers,
    sortConfig,
    onSort,
    onViewOffer,
    onEditOffer,
    onCompareOffer,
    compareListIds,
    isLoading
}) => {
    const { user } = useAuth();
    const canManage = hasPermission(user, 'manage_offers');

    const SortIcon = ({ field }: { field: OfferSortField }) => {
        if (sortConfig.field !== field) return <ChevronDown className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.order === 'asc'
            ? <ChevronUp className="w-4 h-4 text-brand-500" />
            : <ChevronDown className="w-4 h-4 text-brand-500" />;
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'issued': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'on_hold': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'expired': return 'bg-slate-500/10 text-muted-foreground border-slate-500/20';
            default: return 'bg-secondary text-foreground border-border';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'accepted': return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'issued': return <FileText className="w-3.5 h-3.5" />;
            case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
            case 'on_hold': return <Clock className="w-3.5 h-3.5" />;
            case 'expired': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return null;
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'TBA';
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        }).format(date);
    };

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading offers...</p>
                </div>
            </div>
        );
    }

    if (offers.length === 0) {
        return (
            <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">No Offers Found</h3>
                <p className="text-muted-foreground max-w-sm">
                    No offers match your current filter criteria. Adjust your filters or record a new offer.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-xl overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr className="border-b border-border bg-card/50">
                        <th className="px-6 py-4 font-semibold text-foreground text-sm whitespace-nowrap cursor-pointer group" onClick={() => onSort('studentName')}>
                            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                                Student Details <SortIcon field="studentName" />
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold text-foreground text-sm whitespace-nowrap cursor-pointer group" onClick={() => onSort('companyName')}>
                            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                                Company & Role <SortIcon field="companyName" />
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold text-foreground text-sm whitespace-nowrap cursor-pointer group" onClick={() => onSort('ctc')}>
                            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                                Package (CTC) <SortIcon field="ctc" />
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold text-foreground text-sm whitespace-nowrap cursor-pointer group" onClick={() => onSort('status')}>
                            <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                                Offer Status <SortIcon field="status" />
                            </div>
                        </th>
                        <th className="px-6 py-4 font-semibold text-foreground text-sm text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {offers.map((offer) => {
                        const isCompared = compareListIds.includes(offer.id);

                        return (
                            <tr
                                key={offer.id}
                                className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                                onClick={(e) => {
                                    // Prevent double triggering if clicked on action buttons
                                    if ((e.target as HTMLElement).closest('button')) return;
                                    onViewOffer(offer);
                                }}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                {offer.studentName}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{offer.studentDepartment || 'Unknown Dept'}</div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div>
                                        <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                            {offer.companyName}
                                        </div>
                                        <div className="text-xs text-primary font-medium mt-1">{offer.role}</div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div>
                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-black rounded-lg">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            {offer.ctc} LPA
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {offer.location || 'TBA'}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start gap-1.5">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(offer.status)} uppercase tracking-wider`}>
                                            {getStatusIcon(offer.status)}
                                            {offer.status.replace('_', ' ')}
                                        </div>
                                        <div className="text-[11px] text-muted-foreground font-medium">
                                            Joining: {formatDate(offer.joiningDate)}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onCompareOffer(offer)}
                                            className={`p-2 rounded-lg transition-colors border ${isCompared ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary border-border'}`}
                                            title={isCompared ? "Remove from comparison" : "Add to comparison"}
                                        >
                                            <ArrowLeftRight className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => onViewOffer(offer)}
                                            className="px-3 py-1.5 text-xs font-bold bg-secondary hover:bg-secondary text-foreground hover:text-foreground rounded-lg transition-colors border border-border"
                                        >
                                            View
                                        </button>

                                        {canManage && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditOffer(offer);
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold bg-primary/10 hover:bg-primary/10 text-primary border border-brand-500/20 rounded-lg transition-colors"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};


