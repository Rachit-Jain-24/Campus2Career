import React from 'react';
import { Users, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useUsers } from '../../hooks/admin/useUsers';

import { UserFiltersBar } from '../../components/admin/users/UserFiltersBar';
import { UserTable } from '../../components/admin/users/UserTable';
import { UserFormModal } from '../../components/admin/users/UserFormModal';
import { UserDetailDrawer } from '../../components/admin/users/UserDetailDrawer';
import { ConfirmStatusModal } from '../../components/admin/users/ConfirmStatusModal';

export const UsersPage: React.FC = () => {
    const {
        isLoading,
        error,
        successMessage,
        users,
        totalUsers,
        departments,
        filters,
        updateFilter,
        resetFilters,
        sort,
        toggleSort,
        currentPage,
        totalPages,
        setCurrentPage,
        selectedUser,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        isFormOpen,
        editingUser,
        openAddForm,
        openEditForm,
        closeForm,
        handleSaveUser,
        confirmAction,
        requestStatusChange,
        confirmStatusChange,
        cancelStatusChange,
        refresh,
    } = useUsers();

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30">
                            <Users className="w-6 h-6 text-brand-400" />
                        </div>
                        User Management
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Manage admin, staff, and faculty accounts across the platform.
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 font-medium">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMessage}
                </div>
            )}

            {/* Filters */}
            <UserFiltersBar
                filters={filters}
                updateFilter={updateFilter}
                resetFilters={resetFilters}
                onAddUser={openAddForm}
                totalUsers={totalUsers}
                departments={departments}
            />

            {/* Content */}
            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3 border border-slate-800 border-dashed rounded-xl">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p>Loading users…</p>
                </div>
            ) : (
                <UserTable
                    users={users}
                    sort={sort}
                    toggleSort={toggleSort}
                    onViewDetails={openDrawer}
                    onEdit={openEditForm}
                    onStatusChange={requestStatusChange}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* Modals & Drawers */}
            <UserDetailDrawer
                user={selectedUser}
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                onEdit={openEditForm}
            />

            <UserFormModal
                isOpen={isFormOpen}
                editingUser={editingUser}
                onSave={handleSaveUser}
                onClose={closeForm}
                departments={departments}
            />

            <ConfirmStatusModal
                action={confirmAction}
                onConfirm={confirmStatusChange}
                onCancel={cancelStatusChange}
            />
        </div>
    );
};
