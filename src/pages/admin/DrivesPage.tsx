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
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        Placement Drives
                    </h1>
                    <p className="text-muted-foreground mt-2">
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
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl">
                    <div className="text-sm text-muted-foreground font-medium">
                        Showing page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-secondary border border-border text-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === i + 1
                                        ? 'bg-primary text-foreground shadow-lg shadow-brand-500/20'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary bg-secondary/50 border border-border/50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-secondary border border-border text-foreground hover:text-foreground hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
