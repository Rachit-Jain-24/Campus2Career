import React from 'react';
import { Search, Filter, RotateCcw, Plus, Calendar } from 'lucide-react';
import type { InterviewFilters, InterviewStatus, InterviewRoundType, InterviewMode } from '../../../types/interviewAdmin';
import { useAuth } from '../../../contexts/AuthContext';

interface InterviewFiltersBarProps {
    filters: InterviewFilters;
    updateFilter: <K extends keyof InterviewFilters>(key: K, value: InterviewFilters[K]) => void;
    resetFilters: () => void;
    onScheduleInterview: () => void;
    totalResults: number;
}

export const InterviewFiltersBar: React.FC<InterviewFiltersBarProps> = ({
    filters,
    updateFilter,
    resetFilters,
    onScheduleInterview,
    totalResults
}) => {
    const { user } = useAuth();
    const canSchedule = ['system_admin', 'placement_officer', 'program_chair'].includes(user?.role || '');

    const ROUND_TYPES: { value: InterviewRoundType | 'all', label: string }[] = [
        { value: 'all', label: 'All Rounds' },
        { value: 'aptitude_test', label: 'Aptitude Test' },
        { value: 'gd', label: 'Group Discussion' },
        { value: 'technical_interview', label: 'Technical Interview' },
        { value: 'hr_interview', label: 'HR Interview' },
        { value: 'final_round', label: 'Final Round' }
    ];

    const STATUS_TYPES: { value: InterviewStatus | 'all', label: string }[] = [
        { value: 'all', label: 'All Statuses' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'rescheduled', label: 'Rescheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no_show', label: 'No Show' }
    ];

    const MODE_TYPES: { value: InterviewMode | 'all', label: string }[] = [
        { value: 'all', label: 'All Modes' },
        { value: 'online', label: 'Online / Virtual' },
        { value: 'offline', label: 'Offline / In-Person' }
    ];

    return (
        <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">

                {/* Search - Primary focus */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search student, company, drive or panel..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap md:flex-nowrap gap-3">

                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <input
                            type="date"
                            value={filters.date ? filters.date.toISOString().split('T')[0] : ''}
                            onChange={(e) => updateFilter('date', e.target.value ? new Date(e.target.value) : null)}
                            className="pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-primary transition-colors cursor-pointer appearance-none min-w-[140px]"
                        />
                    </div>

                    <div className="relative group min-w-[140px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <select
                            value={filters.roundType}
                            onChange={(e) => updateFilter('roundType', e.target.value as any)}
                            className="w-full pl-9 pr-8 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-primary appearance-none cursor-pointer"
                        >
                            {ROUND_TYPES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group min-w-[140px]">
                        <select
                            value={filters.status}
                            onChange={(e) => updateFilter('status', e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-primary appearance-none cursor-pointer"
                        >
                            {STATUS_TYPES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative group min-w-[140px]">
                        <select
                            value={filters.mode}
                            onChange={(e) => updateFilter('mode', e.target.value as any)}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:border-primary appearance-none cursor-pointer"
                        >
                            {MODE_TYPES.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={resetFilters}
                        className="px-4 py-2.5 bg-secondary hover:bg-secondary border border-border text-foreground hover:text-foreground rounded-lg transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
                        title="Reset Filters"
                    >
                        <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                        <span className="hidden xl:inline">Reset</span>
                    </button>

                    {canSchedule && (
                        <button
                            onClick={onScheduleInterview}
                            className="px-4 py-2.5 bg-primary hover:bg-brand-500 text-foreground rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 whitespace-nowrap font-medium border border-brand-500"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Schedule Interview</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                Showing {totalResults} active schedules based on applied filters
            </div>
        </div>
    );
};
