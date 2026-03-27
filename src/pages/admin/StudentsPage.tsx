import React, { useState } from 'react';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStudents } from '../../hooks/admin/useStudents';
import { StudentFiltersBar } from '../../components/admin/students/StudentFiltersBar';
import { StudentTable } from '../../components/admin/students/StudentTable';
import { StudentDetailDrawer } from '../../components/admin/students/StudentDetailDrawer';
import type { AdminStudentProfile } from '../../types/studentAdmin';

export const StudentsPage: React.FC = () => {
    const {
        students,
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
        exportToCSV
    } = useStudents();

    const [selectedStudent, setSelectedStudent] = useState<AdminStudentProfile | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleViewStudent = (student: AdminStudentProfile) => {
        setSelectedStudent(student);
        setIsDrawerOpen(true);
    };

    const handleSort = (field: import('../../types/studentAdmin').SortField) => {
        setSortConfig((prev: import('../../types/studentAdmin').SortConfig) => ({
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
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        Student Directory
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage, filter, and review student placement readiness profiles.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
                    <span className="font-semibold">Error:</span> {error}
                </div>
            )}

            {/* Filters Bar */}
            <StudentFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onExport={exportToCSV}
                totalResults={totalItems}
            />

            {/* Main Data Table */}
            <StudentTable
                students={students}
                sortConfig={sortConfig}
                onSort={handleSort}
                onViewStudent={handleViewStudent}
                isLoading={isLoading}
            />

            {/* Pagination */}
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
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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

            {/* Slide-over Profile Detail */}
            <StudentDetailDrawer
                student={selectedStudent}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />

        </div>
    );
};
