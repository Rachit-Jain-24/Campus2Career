import React from 'react';
import { ChevronUp, ChevronDown, CheckCircle2, XCircle, AlertCircle, Eye, Search } from 'lucide-react';
import type { AdminStudentProfile, SortConfig, SortField } from '../../../types/studentAdmin';

interface StudentTableProps {
    students: AdminStudentProfile[];
    sortConfig: SortConfig;
    onSort: (field: SortField) => void;
    onViewStudent: (student: AdminStudentProfile) => void;
    isLoading: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
    students,
    sortConfig,
    onSort,
    onViewStudent,
    isLoading
}) => {

    const handleSort = (field: SortField) => {
        onSort(field);
    };

    const getSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) {
            return <ChevronDown className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100" />;
        }
        return sortConfig.order === 'asc'
            ? <ChevronUp className="w-4 h-4 text-primary" />
            : <ChevronDown className="w-4 h-4 text-primary" />;
    };

    const getStatusChip = (status: string, type: 'placement' | 'eligibility' | 'resume') => {
        let bg = 'bg-slate-500/10';
        let text = 'text-muted-foreground';
        let border = 'border-slate-500/20';
        let Icon = AlertCircle;
        const label = status.replace('_', ' ').toUpperCase();

        if (type === 'placement') {
            switch (status) {
                case 'placed':
                    bg = 'bg-emerald-500/10'; text = 'text-emerald-400'; border = 'border-emerald-500/20'; Icon = CheckCircle2;
                    break;
                case 'higher_studies':
                    bg = 'bg-blue-500/10'; text = 'text-blue-400'; border = 'border-blue-500/20'; Icon = CheckCircle2;
                    break;
                case 'opted_out':
                    bg = 'bg-slate-500/10'; text = 'text-muted-foreground'; border = 'border-slate-500/20'; Icon = XCircle;
                    break;
                case 'not_eligible':
                    bg = 'bg-rose-500/10'; text = 'text-rose-400'; border = 'border-rose-500/20'; Icon = XCircle;
                    break;
                case 'unplaced':
                default:
                    bg = 'bg-amber-500/10'; text = 'text-amber-400'; border = 'border-amber-500/20'; Icon = AlertCircle;
                    break;
            }
        } else if (type === 'eligibility') {
            switch (status) {
                case 'eligible':
                    bg = 'bg-emerald-500/10'; text = 'text-emerald-400'; border = 'border-emerald-500/20'; Icon = CheckCircle2;
                    break;
                case 'not_eligible':
                    bg = 'bg-rose-500/10'; text = 'text-rose-400'; border = 'border-rose-500/20'; Icon = XCircle;
                    break;
                case 'pending_review':
                default:
                    bg = 'bg-amber-500/10'; text = 'text-amber-400'; border = 'border-amber-500/20'; Icon = AlertCircle;
                    break;
            }
        }

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${bg} ${text} ${border}`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="w-full bg-secondary/50 border border-border/50 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground font-medium">Loading directory data...</p>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="w-full bg-secondary/50 border border-border/50 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Students Found</h3>
                <p className="text-muted-foreground max-w-sm">
                    No directory records matched your current filters and search query. Try adjusting your parameters.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full bg-secondary/50 border border-border/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-card/50 border-b border-border/50 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                            <th
                                className="px-6 py-4 cursor-pointer group hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort('fullName')}
                            >
                                <div className="flex items-center gap-2">Student <br /><span className="text-[10px] text-muted-foreground">Name & ID</span> {getSortIcon('fullName')}</div>
                            </th>
                            <th className="px-6 py-4">Department & Year</th>
                            <th
                                className="px-6 py-4 cursor-pointer group hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort('cgpa')}
                            >
                                <div className="flex items-center gap-2">Academics <br /><span className="text-[10px] text-muted-foreground">CGPA & Score</span> {getSortIcon('cgpa')}</div>
                            </th>
                            <th
                                className="px-6 py-4 cursor-pointer group hover:bg-secondary/50 transition-colors"
                                onClick={() => handleSort('placementStatus')}
                            >
                                <div className="flex items-center gap-2">Status <br /><span className="text-[10px] text-muted-foreground">Placement & Elig</span> {getSortIcon('placementStatus')}</div>
                            </th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {students.map((student) => (
                            <tr
                                key={student.id}
                                className="hover:bg-secondary/80 transition-colors group cursor-pointer"
                                onClick={() => onViewStudent(student)}
                            >
                                {/* Name and Identifier */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-brand-300 font-bold tracking-wider">
                                                {student.fullName.charAt(0)}{student.fullName.split(' ')[1]?.[0] || ''}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-foreground group-hover:text-brand-300 transition-colors">
                                                {student.fullName}
                                            </div>
                                            <div className="text-sm text-muted-foreground font-mono mt-0.5">
                                                {student.sapId}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Dept and Year */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-foreground font-medium">{student.department}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{student.currentYear}</div>
                                </td>

                                {/* Academics */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">CGPA</div>
                                            <div className="text-xl font-bold text-primary">{typeof student.cgpa === 'number' ? student.cgpa.toFixed(2) : (Number(student.cgpa) || 0).toFixed(2)}</div>
                                        </div>
                                        <div className="w-px h-8 bg-secondary/70"></div>
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-1">Readiness</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-card rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${student.readinessScore >= 75 ? 'bg-emerald-500' : student.readinessScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${student.readinessScore}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{student.readinessScore}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Status Arrays */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-2 items-start">
                                        {getStatusChip(student.placementStatus, 'placement')}
                                        {getStatusChip(student.eligibilityStatus, 'eligibility')}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onViewStudent(student);
                                        }}
                                        className="inline-flex items-center justify-center p-2 bg-secondary hover:bg-primary border border-border hover:border-brand-500 text-foreground hover:text-foreground rounded-lg transition-all"
                                        title="View Full Profile"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Desktop Pagination Hint (Actual pagination controls handled by parent page) */}
            <div className="p-4 bg-card/30 border-t border-border/50 text-xs text-muted-foreground flex justify-between items-center sm:hidden">
                Swipe left to view more columns
            </div>
        </div>
    );
};
