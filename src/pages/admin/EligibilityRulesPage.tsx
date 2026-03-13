import React from 'react';
import { FileSignature, ChevronLeft, ChevronRight, Link2, X } from 'lucide-react';
import { useEligibilityRules } from '../../hooks/admin/useEligibilityRules';
import { EligibilityFiltersBar } from '../../components/admin/eligibility/EligibilityFiltersBar';
import { EligibilityTable } from '../../components/admin/eligibility/EligibilityTable';
import { EligibilityDetailDrawer } from '../../components/admin/eligibility/EligibilityDetailDrawer';
import { EligibilityFormModal } from '../../components/admin/eligibility/EligibilityFormModal';
import type { AdminEligibilityRule } from '../../types/eligibilityAdmin';

export const EligibilityRulesPage: React.FC = () => {

    const {
        rules,
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
        selectedRule,
        setSelectedRule,
        isDrawerViewOpen,
        setIsDrawerViewOpen,
        formState,
        setFormState,
        isSaving,
        handleSaveRule,
        previewState,
        triggerPreviewEvaluation,
        attachModalState,
        openAttachModal,
        closeAttachModal
    } = useEligibilityRules();

    const handleViewRule = (rule: AdminEligibilityRule) => {
        setSelectedRule(rule);
        setIsDrawerViewOpen(true);
    };

    const handleEditRule = (rule: AdminEligibilityRule) => {
        setFormState({ mode: 'edit', initialData: rule });
    };

    const handleAddRule = () => {
        setFormState({ mode: 'add' });
    };

    const handleSort = (field: import('../../types/eligibilityAdmin').EligibilitySortField) => {
        setSortConfig((prev: import('../../types/eligibilityAdmin').EligibilitySortConfig) => ({
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
                            <FileSignature className="w-6 h-6 text-brand-400" />
                        </div>
                        Eligibility Configurations
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Manage global student exclusion/inclusion templates. Preview logic instantly against current database entries.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium">
                    <span className="font-bold">System Connection:</span> {error}
                </div>
            )}

            {/* Config & Search */}
            <EligibilityFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onAddRule={handleAddRule}
                totalResults={totalItems}
            />

            {/* Main Table View */}
            <EligibilityTable
                rules={rules}
                sortConfig={sortConfig}
                onSort={handleSort}
                onViewRule={handleViewRule}
                onEditRule={handleEditRule}
                onAttachRule={openAttachModal}
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
            <EligibilityDetailDrawer
                rule={selectedRule}
                isOpen={isDrawerViewOpen}
                onClose={() => setIsDrawerViewOpen(false)}
                previewState={previewState}
                onTriggerEvaluation={triggerPreviewEvaluation}
            />

            <EligibilityFormModal
                isOpen={formState !== null}
                onClose={() => setFormState(null)}
                onSave={handleSaveRule}
                initialData={formState?.initialData}
                isSaving={isSaving}
            />

            {/* Simple Attach to Drive placeholder modal */}
            {attachModalState.isOpen && attachModalState.ruleToAttach && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={closeAttachModal} />
                    <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-brand-500" />
                                Attach to Drive
                            </h3>
                            <button onClick={closeAttachModal} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-slate-300 mb-6 text-sm">
                            Select an upcoming placement drive to directly apply the <span className="font-bold text-white">{attachModalState.ruleToAttach.ruleName}</span> criteria.
                        </p>
                        <div className="text-center p-4 border border-slate-700 border-dashed rounded-lg bg-slate-800/50 mb-6">
                            <p className="text-slate-400 text-sm italic">Drive selector integration placeholder...</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={closeAttachModal} className="px-4 py-2 text-sm text-slate-300 hover:text-white">Cancel</button>
                            <button onClick={closeAttachModal} className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg shadow-md transition-colors">
                                Confirm Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
