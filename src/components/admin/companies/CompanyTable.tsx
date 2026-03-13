import React from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, XCircle, AlertCircle, Clock, Eye, Mail, Pencil, Building2 } from 'lucide-react';
import type { AdminCompanyProfile, CompanySortConfig, CompanySortField } from '../../../types/companyAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';

interface CompanyTableProps {
    companies: AdminCompanyProfile[];
    sortConfig: CompanySortConfig;
    onSort: (field: CompanySortField) => void;
    onViewCompany: (company: AdminCompanyProfile) => void;
    onEditCompany: (company: AdminCompanyProfile) => void;
    isLoading: boolean;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
    companies,
    sortConfig,
    onSort,
    onViewCompany,
    onEditCompany,
    isLoading
}) => {

    const { user } = useAuth();
    const canManageCompanies = hasPermission(user, 'manage_companies');

    const handleSort = (field: CompanySortField) => onSort(field);

    const getSortIcon = (field: CompanySortField) => {
        if (sortConfig.field !== field) return <ChevronDown className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.order === 'asc'
            ? <ChevronUp className="w-4 h-4 text-brand-400" />
            : <ChevronDown className="w-4 h-4 text-brand-400" />;
    };

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'active': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', Icon: CheckCircle2 };
            case 'upcoming': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', Icon: Clock };
            case 'blacklisted': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', Icon: XCircle };
            case 'inactive':
            default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', Icon: AlertCircle };
        }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400 font-medium">Loading partner network...</p>
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                    <Building2 className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Companies Found</h3>
                <p className="text-slate-400 max-w-sm">
                    No placement parters match your current filters. Try adjusting your search query.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700/50 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-slate-800/50 transition-colors w-1/4"
                                onClick={() => handleSort('companyName')}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Company Identity</span> {getSortIcon('companyName')}
                                </div>
                            </th>
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-slate-800/50 transition-colors"
                                onClick={() => handleSort('industry')}
                            >
                                <div className="flex items-center gap-2">Industry & Scope {getSortIcon('industry')}</div>
                            </th>
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-slate-800/50 transition-colors"
                                onClick={() => handleSort('packageRange')}
                            >
                                <div className="flex items-center gap-2">Compensation {getSortIcon('packageRange')}</div>
                            </th>
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-slate-800/50 transition-colors"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">Status {getSortIcon('status')}</div>
                            </th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {companies.map((company) => {
                            const theme = getStatusTheme(company.status);
                            const StatusIcon = theme.Icon;

                            return (
                                <tr
                                    key={company.id}
                                    className="hover:bg-slate-800/80 transition-colors group cursor-pointer"
                                    onClick={() => onViewCompany(company)}
                                >
                                    {/* Core Identity */}
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 flex-shrink-0 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center p-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                {company.logoUrl ? (
                                                    <img src={company.logoUrl} alt={company.companyName} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-xl font-bold text-slate-500 font-serif">
                                                        {company.companyName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                                                    {company.companyName}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{company.hrName} • {company.hrEmail}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Industry & Scope */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="text-slate-200 font-medium text-sm">{company.industry}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                            <span className="capitalize">{company.hiringMode.replace('-', ' ')}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[120px]">{company.location}</span>
                                        </div>
                                    </td>

                                    {/* Package & Eligibility */}
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <div className="text-emerald-400 font-semibold tracking-wide border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded inline-block">
                                            {company.packageRange}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
                                            <span>{company.eligibleDepartments.length} Depts Eligible</span>
                                        </div>
                                    </td>

                                    {/* Current Status */}
                                    <td className="px-5 py-4 whitespace-nowrap text-left">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            <span className="capitalize">{company.status === 'blacklisted' ? 'Blacklisted' : company.status}</span>
                                        </span>
                                    </td>

                                    {/* Contextual Actions */}
                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewCompany(company);
                                                }}
                                                className="p-2 bg-slate-800 hover:bg-brand-600 border border-slate-700 hover:border-brand-500 text-slate-400 hover:text-white rounded-lg transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {canManageCompanies && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditCompany(company);
                                                    }}
                                                    className="p-2 bg-slate-800 hover:bg-amber-600 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-white rounded-lg transition-all"
                                                    title="Edit Company"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-3 bg-slate-900/30 border-t border-slate-700/50 text-[11px] text-slate-500 flex justify-between items-center sm:hidden">
                Swipe left to view complete details
            </div>
        </div>
    );
};
