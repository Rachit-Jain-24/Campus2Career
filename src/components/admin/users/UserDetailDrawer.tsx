import React from 'react';
import { X, User, Edit2, Building2, Calendar, Clock, FileText, Activity } from 'lucide-react';
import type { AdminUserProfile } from '../../../types/userAdmin';

interface UserDetailDrawerProps {
    user: AdminUserProfile | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (user: AdminUserProfile) => void;
}

const statusColor = (s: string) => {
    switch (s) {
        case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'inactive': return 'text-slate-400 bg-slate-700/50 border-slate-700';
        case 'suspended': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        default: return 'text-slate-400 bg-slate-700/50 border-slate-700';
    }
};

const roleColor = (r: string) => {
    switch (r) {
        case 'system_admin': return 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20';
        case 'dean': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        case 'director': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        case 'program_chair': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        case 'placement_officer': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'faculty': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
        default: return 'text-slate-400 bg-slate-700/50 border-slate-700';
    }
};

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, isOpen, onClose, onEdit }) => {
    if (!isOpen || !user) return null;

    const formatDate = (date?: Date) => {
        if (!date) return '—';
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }).format(date);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

            <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-slate-950 border-l border-slate-800 z-50 overflow-y-auto animate-slide-in-right">

                {/* Header */}
                <div className="sticky top-0 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-lg font-bold text-white">User Profile</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Avatar + Identity */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user.name}</h3>
                            <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize border ${roleColor(user.role)}`}>
                            {user.role.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize border ${statusColor(user.status)}`}>
                            {user.status}
                        </span>
                    </div>

                    {/* Profile Details */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <User className="w-3.5 h-3.5" />
                            Account Details
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">User ID</div>
                                <div className="text-white font-mono text-xs">{user.id}</div>
                            </div>
                            {user.uid && (
                                <div>
                                    <div className="text-slate-500 text-xs mb-0.5">Auth UID</div>
                                    <div className="text-white font-mono text-xs">{user.uid}</div>
                                </div>
                            )}
                            {user.phone && (
                                <div>
                                    <div className="text-slate-500 text-xs mb-0.5">Phone</div>
                                    <div className="text-white font-medium">{user.phone}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Department + Role */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Building2 className="w-3.5 h-3.5" />
                            Organization
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">Department</div>
                                <div className="text-white font-medium">{user.department}</div>
                            </div>
                            <div>
                                <div className="text-slate-500 text-xs mb-0.5">Role</div>
                                <div className="text-white font-medium capitalize">{user.role.replace(/_/g, ' ')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            Timeline
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-slate-500 text-xs">Created:</span>
                                <span className="text-white text-xs font-medium">{formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-600" />
                                <span className="text-slate-500 text-xs">Last Login:</span>
                                <span className="text-white text-xs font-medium">{formatDate(user.lastLogin)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {user.notes && (
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                <FileText className="w-3.5 h-3.5" />
                                Notes
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{user.notes}</p>
                        </div>
                    )}

                    {/* Recent Activity Placeholder */}
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Activity className="w-3.5 h-3.5" />
                            Recent Activity
                        </div>
                        <p className="text-xs text-slate-600 italic">
                            Activity log integration coming soon. This section will show the user's recent actions from the audit trail.
                        </p>
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => { onClose(); onEdit(user); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit User Profile
                    </button>
                </div>
            </div>
        </>
    );
};
