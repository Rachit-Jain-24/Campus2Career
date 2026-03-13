import React from 'react';
import { ChevronUp, ChevronDown, FileText, Briefcase, Eye, Pencil, ShieldCheck, ShieldAlert, Link2 } from 'lucide-react';
import type { AdminEligibilityRule, EligibilitySortConfig, EligibilitySortField } from '../../../types/eligibilityAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';

interface EligibilityTableProps {
    rules: AdminEligibilityRule[];
    sortConfig: EligibilitySortConfig;
    onSort: (field: EligibilitySortField) => void;
    onViewRule: (rule: AdminEligibilityRule) => void;
    onEditRule: (rule: AdminEligibilityRule) => void;
    onAttachRule: (rule: AdminEligibilityRule) => void;
    isLoading: boolean;
}

export const EligibilityTable: React.FC<EligibilityTableProps> = ({
    rules,
    sortConfig,
    onSort,
    onViewRule,
    onEditRule,
    onAttachRule,
    isLoading
}) => {

    const { user } = useAuth();
    const canManageRules = hasPermission(user, 'manage_drives');

    const handleSort = (field: EligibilitySortField) => onSort(field);

    const getSortIcon = (field: EligibilitySortField) => {
        if (sortConfig.field !== field) return <ChevronDown className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.order === 'asc'
            ? <ChevronUp className="w-4 h-4 text-brand-400" />
            : <ChevronDown className="w-4 h-4 text-brand-400" />;
    };

    if (isLoading) {
        return (
            <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400 font-medium">Loading rules & criteria configurations...</p>
            </div>
        );
    }

    if (rules.length === 0) {
        return (
            <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                    <ShieldCheck className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Rules Configured</h3>
                <p className="text-slate-400 max-w-sm">
                    No active or passive template rules match your current selection.
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
                                className="px-5 py-4 cursor-pointer group hover:bg-slate-800/50 transition-colors w-1/3 min-w-[300px]"
                                onClick={() => handleSort('ruleName')}
                            >
                                <div className="flex items-center gap-2">Rule Identification {getSortIcon('ruleName')}</div>
                            </th>
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-slate-800/50 transition-colors"
                                onClick={() => handleSort('minCGPA')}
                            >
                                <div className="flex items-center gap-2">Core Criterion {getSortIcon('minCGPA')}</div>
                            </th>
                            <th className="px-5 py-4">Conditions</th>
                            <th
                                className="px-5 py-4 cursor-pointer group hover:bg-slate-800/50 transition-colors text-center"
                                onClick={() => handleSort('active')}
                            >
                                <div className="flex items-center justify-center gap-2">Status {getSortIcon('active')}</div>
                            </th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {rules.map((rule) => (
                            <tr
                                key={rule.id}
                                className="hover:bg-slate-800/80 transition-colors group cursor-pointer"
                                onClick={() => onViewRule(rule)}
                            >
                                {/* Core Identifier */}
                                <td className="px-5 py-5">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 flex-shrink-0 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center p-1.5 opacity-80 group-hover:opacity-100 transition-opacity mt-1">
                                            {rule.active ? (
                                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <ShieldAlert className="w-5 h-5 text-slate-500" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-white group-hover:text-brand-300 transition-colors text-sm mb-0.5 line-clamp-1">
                                                {rule.ruleName}
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium mb-1 line-clamp-1 pr-2">
                                                {rule.description}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <span>{rule.linkedDriveIds.length} Linked Drives</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                <span>Updated {rule.updatedAt.toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Criteria Details */}
                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase mr-2">Min CGPA</span>
                                            <span className="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                                {rule.minCGPA.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {rule.allowedDepartments.slice(0, 2).map(dep => (
                                                <span key={dep} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                    {dep}
                                                </span>
                                            ))}
                                            {rule.allowedDepartments.length > 2 && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                    +{rule.allowedDepartments.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Stringent Conditions */}
                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-start gap-4 text-xs font-medium">
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                                <span className="text-slate-300">Active Bt.: {rule.maxActiveBacklogs}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                                <span className="text-slate-400">Total Bk.: {rule.maxHistoryBacklogs}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {rule.requiresResumeApproval && (
                                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Resume Approval Mandatory">
                                                    <FileText className="w-3 h-3" /> Resume
                                                </span>
                                            )}
                                            {rule.mandatoryInternship && (
                                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20" title="Prior Internship Required">
                                                    <Briefcase className="w-3 h-3" /> Intern
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-5 py-4 text-center">
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${rule.active
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                        {rule.active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewRule(rule);
                                            }}
                                            className="p-2 bg-slate-800 hover:bg-brand-600 border border-slate-700 hover:border-brand-500 text-slate-400 hover:text-white rounded-lg transition-all"
                                            title="View Previews"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {canManageRules && (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAttachRule(rule);
                                                    }}
                                                    className="p-2 bg-slate-800 hover:bg-brand-600 border border-slate-700 hover:border-brand-500 text-slate-400 hover:text-white rounded-lg transition-all"
                                                    title="Attach to Drive"
                                                >
                                                    <Link2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditRule(rule);
                                                    }}
                                                    className="p-2 bg-slate-800 hover:bg-amber-600 border border-slate-700 hover:border-amber-500 text-slate-400 hover:text-white rounded-lg transition-all"
                                                    title="Edit Rule Baseline"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 bg-slate-900/30 border-t border-slate-700/50 text-[11px] text-slate-500 flex justify-between items-center sm:hidden">
                Swipe left to view full rules
            </div>
        </div>
    );
};
