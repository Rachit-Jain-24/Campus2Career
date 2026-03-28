import React from 'react';
import { Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCompanies } from '../../hooks/admin/useCompanies';
import { CompanyFiltersBar } from '../../components/admin/companies/CompanyFiltersBar';
import { CompanyTable } from '../../components/admin/companies/CompanyTable';
import { CompanyDetailDrawer } from '../../components/admin/companies/CompanyDetailDrawer';
import { CompanyFormModal } from '../../components/admin/companies/CompanyFormModal';
import type { AdminCompanyProfile } from '../../types/companyAdmin';

export const CompaniesPage: React.FC = () => {

    const {
        companies,
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
        selectedCompany,
        setSelectedCompany,
        isDrawerViewOpen,
        setIsDrawerViewOpen,
        formState,
        setFormState,
        isSaving,
        handleSaveCompany
    } = useCompanies();

    const handleViewCompany = (company: AdminCompanyProfile) => {
        setSelectedCompany(company);
        setIsDrawerViewOpen(true);
    };

    const handleEditCompany = (company: AdminCompanyProfile) => {
        setFormState({ mode: 'edit', initialData: company });
    };

    const handleAddCompany = () => {
        setFormState({ mode: 'add' });
    };

    const handleSort = (field: import('../../types/companyAdmin').CompanySortField) => {
        setSortConfig(prev => ({
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
                            <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        Company Management
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage placement partners, onboarding status, and drive eligibility criteria.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {/* Config & Search */}
            <CompanyFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onAddCompany={handleAddCompany}
                totalResults={totalItems}
            />

            {/* Main Table View */}
            <CompanyTable
                companies={companies}
                sortConfig={sortConfig}
                onSort={handleSort}
                onViewCompany={handleViewCompany}
                onEditCompany={handleEditCompany}
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
            <CompanyDetailDrawer
                company={selectedCompany}
                isOpen={isDrawerViewOpen}
                onClose={() => setIsDrawerViewOpen(false)}
            />

            <CompanyFormModal
                isOpen={formState !== null}
                onClose={() => setFormState(null)}
                onSave={handleSaveCompany}
                initialData={formState?.initialData}
                isSaving={isSaving}
            />

        </div>
    );
};
