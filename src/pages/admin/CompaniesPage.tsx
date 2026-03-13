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
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30">
                            <Building2 className="w-6 h-6 text-brand-400" />
                        </div>
                        Company Management
                    </h1>
                    <p className="text-slate-400 mt-2">
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
