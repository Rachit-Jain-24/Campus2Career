import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDrives } from '../../hooks/admin/useDrives';
import { DriveFiltersBar } from '../../components/admin/drives/DriveFiltersBar';
import { DriveTable } from '../../components/admin/drives/DriveTable';
import { DriveDetailDrawer } from '../../components/admin/drives/DriveDetailDrawer';
import { DriveFormModal } from '../../components/admin/drives/DriveFormModal';
import type { AdminDriveProfile } from '../../types/driveAdmin';

export const DrivesPage: React.FC = () => {

    const {
        drives,
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
        selectedDrive,
        setSelectedDrive,
        isDrawerViewOpen,
        setIsDrawerViewOpen,
        formState,
        setFormState,
        isSaving,
        handleSaveDrive
    } = useDrives();

    const handleViewDrive = (drive: AdminDriveProfile) => {
        setSelectedDrive(drive);
        setIsDrawerViewOpen(true);
    };

    const handleEditDrive = (drive: AdminDriveProfile) => {
        setFormState({ mode: 'edit', initialData: drive });
    };

    const handleAddDrive = () => {
        setFormState({ mode: 'add' });
    };

    const handleSort = (field: import('../../types/driveAdmin').DriveSortField) => {
        setSortConfig((prev: import('../../types/driveAdmin').DriveSortConfig) => ({
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
                            <Calendar className="w-6 h-6 text-brand-400" />
                        </div>
                        Placement Drives
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Manage ongoing recruitment campaigns, set eligibility rules, and track applicants.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {/* Config & Search */}
            <DriveFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onAddDrive={handleAddDrive}
                totalResults={totalItems}
            />

            {/* Main Table View */}
            <DriveTable
                drives={drives}
                sortConfig={sortConfig}
                onSort={handleSort}
                onViewDrive={handleViewDrive}
                onEditDrive={handleEditDrive}
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
            <DriveDetailDrawer
                drive={selectedDrive}
                isOpen={isDrawerViewOpen}
                onClose={() => setIsDrawerViewOpen(false)}
            />

            <DriveFormModal
                isOpen={formState !== null}
                onClose={() => setFormState(null)}
                onSave={handleSaveDrive}
                initialData={formState?.initialData}
                isSaving={isSaving}
            />

        </div>
    );
};
