import React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useInterviews } from '../../hooks/admin/useInterviews';
import { InterviewFiltersBar } from '../../components/admin/interviews/InterviewFiltersBar';
import { InterviewTable } from '../../components/admin/interviews/InterviewTable';
import { InterviewDetailDrawer } from '../../components/admin/interviews/InterviewDetailDrawer';
import { InterviewFormModal } from '../../components/admin/interviews/InterviewFormModal';
import type { AdminInterview } from '../../types/interviewAdmin';

export const InterviewsPage: React.FC = () => {

    const {
        interviews,
        totalItems,
        isLoading,
        error,
        filters,
        sortConfig,
        page,
        totalPages,
        updateFilter,
        resetFilters,
        setSortConfig,
        setPage,
        selectedInterview,
        setSelectedInterview,
        isDrawerViewOpen,
        setIsDrawerViewOpen,
        formState,
        setFormState,
        isSaving,
        handleSaveInterview
    } = useInterviews();

    const handleViewInterview = (interview: AdminInterview) => {
        setSelectedInterview(interview);
        setIsDrawerViewOpen(true);
    };

    const handleEditInterview = (interview: AdminInterview) => {
        setFormState({ mode: 'edit', initialData: interview });
    };

    const handleAddInterview = () => {
        setFormState({ mode: 'add' });
    };

    const handleSort = (field: import('../../types/interviewAdmin').InterviewSortField) => {
        setSortConfig((prev: import('../../types/interviewAdmin').InterviewSortConfig) => ({
            field,
            order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30">
                            <CalendarDays className="w-6 h-6 text-brand-400" />
                        </div>
                        Interview Scheduler
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Manage all placement interviews, track panels, and log final outcomes securely.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {/* Config & Search */}
            <InterviewFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onScheduleInterview={handleAddInterview}
                totalResults={totalItems}
            />

            {/* Main Table View */}
            <InterviewTable
                interviews={interviews}
                sortConfig={sortConfig}
                onSort={handleSort}
                onViewInterview={handleViewInterview}
                onEditInterview={handleEditInterview}
                isLoading={isLoading}
            />

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                    <div className="text-sm text-slate-400 font-medium">
                        Showing page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700 bg-slate-800/50 border border-slate-700/50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals & Overlays */}
            <InterviewDetailDrawer
                interview={selectedInterview}
                isOpen={isDrawerViewOpen}
                onClose={() => setIsDrawerViewOpen(false)}
            />

            <InterviewFormModal
                isOpen={formState !== null}
                onClose={() => setFormState(null)}
                onSave={handleSaveInterview}
                initialData={formState?.initialData}
                isSaving={isSaving}
            />

        </div>
    );
};
