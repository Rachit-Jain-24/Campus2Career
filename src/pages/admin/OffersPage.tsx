import React from 'react';
import { OfferFiltersBar } from '../../components/admin/offers/OfferFiltersBar';
import { OfferTable } from '../../components/admin/offers/OfferTable';
import { OfferFormModal } from '../../components/admin/offers/OfferFormModal';
import { OfferDetailDrawer } from '../../components/admin/offers/OfferDetailDrawer';
import { OfferComparisonModal } from '../../components/admin/offers/OfferComparisonModal';
import { useOffers } from '../../hooks/admin/useOffers';
import { IndianRupee, Scale } from 'lucide-react';

export const OffersPage: React.FC = () => {
    const {
        offers,
        totalItems,
        isLoading,
        error,

        filters,
        updateFilter,
        resetFilters,

        sortConfig,
        setSortConfig,

        page,
        totalPages,
        setPage,

        selectedOffer,
        setSelectedOffer,
        isDrawerViewOpen,
        setIsDrawerViewOpen,

        compareOffers,
        isCompareModalOpen,
        setIsCompareModalOpen,
        toggleCompareOffer,

        formState,
        setFormState,
        isSaving,
        handleSaveOffer
    } = useOffers();

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30">
                            <IndianRupee className="w-6 h-6 text-brand-400" />
                        </div>
                        Offer Management
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Track, record, and verify placement offers and compensation packages.
                    </p>
                </div>

                {compareOffers.length > 0 && (
                    <button
                        onClick={() => setIsCompareModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 animate-fade-in"
                    >
                        <Scale className="w-4 h-4" />
                        Compare Selected ({compareOffers.length})
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <OfferFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onCreateOffer={() => setFormState({ mode: 'add' })}
                totalResults={totalItems}
            />

            <OfferTable
                offers={offers}
                sortConfig={sortConfig}
                onSort={(field) => {
                    setSortConfig(prev => ({
                        field,
                        order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
                    }));
                }}
                onViewOffer={(offer) => {
                    setSelectedOffer(offer);
                    setIsDrawerViewOpen(true);
                }}
                onEditOffer={(offer) => {
                    setFormState({ mode: 'edit', initialData: offer });
                }}
                onCompareOffer={toggleCompareOffer}
                compareListIds={compareOffers.map(o => o.id)}
                isLoading={isLoading}
            />

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                    <div className="text-sm text-slate-400 font-medium">
                        Showing page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <OfferFormModal
                isOpen={formState !== null}
                onClose={() => setFormState(null)}
                onSave={handleSaveOffer}
                initialData={formState?.initialData}
                isSaving={isSaving}
            />

            <OfferDetailDrawer
                isOpen={isDrawerViewOpen}
                onClose={() => setIsDrawerViewOpen(false)}
                offer={selectedOffer}
            />

            <OfferComparisonModal
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                offers={compareOffers}
            />

        </div>
    );
};
