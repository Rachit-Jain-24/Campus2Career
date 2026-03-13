import React from 'react';
import { ChevronUp, ChevronDown, CalendarDays, Clock, MapPin, Video, Eye, CalendarClock } from 'lucide-react';
import type { AdminInterview, InterviewSortConfig, InterviewSortField } from '../../../types/interviewAdmin';
import { useAuth } from '../../../contexts/AuthContext';

interface InterviewTableProps {
    interviews: AdminInterview[];
    sortConfig: InterviewSortConfig;
    onSort: (field: InterviewSortField) => void;
    onViewInterview: (interview: AdminInterview) => void;
    onEditInterview: (interview: AdminInterview) => void;
    isLoading: boolean;
}

export const InterviewTable: React.FC<InterviewTableProps> = ({
    interviews,
    sortConfig,
    onSort,
    onViewInterview,
    onEditInterview,
    isLoading
}) => {
    const { user } = useAuth();
    const canManage = ['system_admin', 'placement_officer', 'program_chair'].includes(user?.role || '');

    const SortIcon = ({ field }: { field: InterviewSortField }) => {
        if (sortConfig.field !== field) return <ChevronDown className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.order === 'asc'
            ? <ChevronUp className="w-3.5 h-3.5 text-brand-400" />
            : <ChevronDown className="w-3.5 h-3.5 text-brand-400" />;
    };

    const getStatusChip = (status: AdminInterview['status']) => {
        const configs: Record<string, { bg: string, text: string, border: string, label: string }> = {
            scheduled: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Scheduled' },
            rescheduled: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Rescheduled' },
            completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Completed' },
            cancelled: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Cancelled' },
            no_show: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'No Show' }
        };
        const conf = configs[status] || configs['scheduled'];
        return (
            <span className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md border ${conf.bg} ${conf.text} ${conf.border}`}>
                {conf.label}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 text-center text-slate-400 animate-pulse">Loading scheduling data...</div>
            </div>
        );
    }

    if (interviews.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col items-center justify-center p-12">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <CalendarDays className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Interviews Found</h3>
                <p className="text-slate-400 text-sm max-w-sm text-center">
                    Adjust your filters or schedule a new interview to see it listed here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">

                            <th className="p-4 font-semibold w-1/4">
                                <button onClick={() => onSort('studentName')} className="flex items-center gap-1.5 hover:text-white transition-colors group">
                                    Student & Company
                                    <SortIcon field="studentName" />
                                </button>
                            </th>

                            <th className="p-4 font-semibold">
                                <button onClick={() => onSort('scheduledDate')} className="flex items-center gap-1.5 hover:text-white transition-colors group">
                                    Date & Mode
                                    <SortIcon field="scheduledDate" />
                                </button>
                            </th>

                            <th className="p-4 font-semibold">Round Details</th>

                            <th className="p-4 font-semibold text-center mt-[2px]">
                                <button onClick={() => onSort('status')} className="flex items-center justify-center w-full gap-1.5 hover:text-white transition-colors group">
                                    Status
                                    <SortIcon field="status" />
                                </button>
                            </th>

                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {interviews.map(interview => (
                            <tr key={interview.id} className="hover:bg-slate-800/20 transition-colors group/row">

                                <td className="p-4">
                                    <div className="font-bold text-white mb-1 group-hover/row:text-brand-400 transition-colors">
                                        {interview.studentName}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        {interview.companyName}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider line-clamp-1">
                                        {interview.driveTitle}
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium mb-1.5">
                                        <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
                                        {interview.scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex flex-col gap-1 text-xs text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" />
                                            {interview.scheduledTime}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {interview.mode === 'online' ? <Video className="w-3 h-3 text-indigo-400" /> : <MapPin className="w-3 h-3 text-emerald-400" />}
                                            <span className="capitalize">{interview.mode}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="text-sm font-medium text-white mb-1 capitalize">
                                        {interview.roundType.replace('_', ' ')}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        Panel: <span className="text-slate-300">{interview.panelName || 'Unassigned'}</span>
                                    </div>
                                    {interview.resultStatus && interview.resultStatus !== 'pending' && (
                                        <div className="mt-2 text-[10px] px-2 py-0.5 rounded-full inline-block bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                                            Result: {interview.resultStatus.replace('_', ' ')}
                                        </div>
                                    )}
                                </td>

                                <td className="p-4 text-center align-middle">
                                    {getStatusChip(interview.status)}
                                </td>

                                <td className="p-4 align-middle">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewInterview(interview);
                                            }}
                                            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {canManage && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditInterview(interview);
                                                }}
                                                className="p-2 bg-slate-800 hover:bg-amber-600/20 border border-slate-700 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 rounded-lg transition-all"
                                                title="Reschedule / Edit"
                                            >
                                                <CalendarClock className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
