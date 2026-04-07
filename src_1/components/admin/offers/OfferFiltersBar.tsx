import React from 'react';
import { Search, Filter, RotateCcw, Plus, Download } from 'lucide-react';
import type { OfferFilters } from '../../../types/offerAdmin';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission } from '../../../utils/admin/rbac';

interface OfferFiltersBarProps {
    filters: OfferFilters;
    updateFilter: <K extends keyof OfferFilters>(key: K, value: OfferFilters[K]) => void;
    resetFilters: () => void;
    onCreateOffer: () => void;
    totalResults: number;
}

export const OfferFiltersBar: React.FC<OfferFiltersBarProps> = ({
    filters,
    updateFilter,
    resetFilters,
    onCreateOffer,
    totalResults
}) => {
    const { user } = useAuth();
    const canManageOffers = hasPermission(user, 'manage_offers');

    const handleExport = () => {
        // Feature stub
        alert("Exporting offers to CSV...");
    };

    return (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 space-y-4">

            <div className="flex flex-col sm:flex-row gap-4 justify-between">

                {/* Search */}
                <div className="relative flex-1 sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search student, company, role..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter('searchQuery', e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground border border-border hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    {canManageOffers && (
                        <button
                            onClick={onCreateOffer}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-brand-500 text-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Record Offer</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>

                <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value as any)}
                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                >
                    <option value="all">All Statuses</option>
                    <option value="issued">Issued</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="on_hold">On Hold</option>
                    <option value="expired">Expired</option>
                </select>

                <select
                    value={filters.department}
                    onChange={(e) => updateFilter('department', e.target.value)}
                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                >
                    <option value="all">All Departments</option>
                    <option value="Computer Engineering">Computer Engineering</option>
                    <option value="Information Technology">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                </select>

                <select
                    value={filters.year}
                    onChange={(e) => updateFilter('year', e.target.value)}
                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                >
                    <option value="all">All Years</option>
                    <option value="Final Year">Final Year</option>
                    <option value="3rd Year">3rd Year</option>
                </select>

                <div className="flex-1" />

                <button
                    onClick={resetFilters}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                </button>

                <div className="px-3 py-1.5 bg-primary/10 border border-brand-500/20 text-primary rounded-lg text-sm font-bold ml-2">
                    {totalResults} {totalResults === 1 ? 'Offer' : 'Offers'}
                </div>
            </div>

        </div>
    );
};
