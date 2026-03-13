import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { AdminUserProfile, UserStatus } from '../../../types/userAdmin';

interface ConfirmStatusModalProps {
    action: { user: AdminUserProfile; newStatus: UserStatus } | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const statusLabel: Record<UserStatus, string> = {
    active: 'Activate',
    inactive: 'Deactivate',
    suspended: 'Suspend',
};

const statusDescription: Record<UserStatus, string> = {
    active: 'This will restore their access to the admin panel.',
    inactive: 'This will remove their access to the admin panel. They can be reactivated later.',
    suspended: 'This will immediately revoke access. Only a system admin can unsuspend this account.',
};

export const ConfirmStatusModal: React.FC<ConfirmStatusModalProps> = ({ action, onConfirm, onCancel }) => {
    if (!action) return null;

    const isCritical = action.newStatus === 'suspended';

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onCancel} />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/50">

                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
                            <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-rose-400' : 'text-amber-400'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Confirm Status Change</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {statusLabel[action.newStatus]} user: <strong className="text-white">{action.user.name}</strong>
                            </p>
                        </div>
                        <button onClick={onCancel} className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-slate-500">Current status:</span>
                            <span className="font-bold capitalize">{action.user.status}</span>
                            <span className="text-slate-600">→</span>
                            <span className={`font-bold capitalize ${isCritical ? 'text-rose-400' : action.newStatus === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {action.newStatus}
                            </span>
                        </div>
                        <p className="text-sm text-slate-400">{statusDescription[action.newStatus]}</p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
                        <button onClick={onCancel}
                            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button onClick={onConfirm}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg ${isCritical
                                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                                }`}
                        >
                            {statusLabel[action.newStatus]}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
