import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { AdminUserProfile, UserFormData, UserStatus } from '../../../types/userAdmin';
import type { AdminRole } from '../../../types/auth';

interface UserFormModalProps {
    isOpen: boolean;
    editingUser: AdminUserProfile | null;
    onSave: (data: UserFormData) => void;
    onClose: () => void;
    departments: string[];
}

const ROLE_OPTIONS: AdminRole[] = ['system_admin', 'dean', 'director', 'program_chair', 'placement_officer', 'faculty'];
const STATUS_OPTIONS: UserStatus[] = ['active', 'inactive', 'suspended'];

export const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen, editingUser, onSave, onClose, departments
}) => {
    const [form, setForm] = useState<UserFormData>({
        name: '',
        email: '',
        role: 'faculty',
        department: '',
        status: 'active',
        phone: '',
        notes: '',
    });

    useEffect(() => {
        if (editingUser) {
            setForm({
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                department: editingUser.department,
                status: editingUser.status,
                phone: editingUser.phone || '',
                notes: editingUser.notes || '',
            });
        } else {
            setForm({ name: '', email: '', role: 'faculty', department: '', status: 'active', phone: '', notes: '' });
        }
    }, [editingUser, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim()) return;
        onSave(form);
    };

    const isEdit = !!editingUser;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/50"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">
                            {isEdit ? 'Edit User' : 'Add New User'}
                        </h2>
                        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-400">Full Name *</label>
                                <input
                                    type="text" required
                                    value={form.name}
                                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-400">Email *</label>
                                <input
                                    type="email" required
                                    value={form.email}
                                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                                    disabled={isEdit}
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {!isEdit && (
                                    <p className="text-[11px] text-slate-600">An invite or temporary credential can be provisioned after creation.</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Role *</label>
                                <select
                                    value={form.role}
                                    onChange={(e) => setForm(p => ({ ...p, role: e.target.value as AdminRole }))}
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {ROLE_OPTIONS.map(r => (
                                        <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Department *</label>
                                <input
                                    type="text" list="dept-list"
                                    value={form.department}
                                    onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))}
                                    placeholder="Type or select…"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                                <datalist id="dept-list">
                                    {departments.map(d => <option key={d} value={d} />)}
                                </datalist>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value as UserStatus }))}
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Phone</label>
                                <input
                                    type="tel"
                                    value={form.phone || ''}
                                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+91 …"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-400">Notes</label>
                                <textarea
                                    rows={2}
                                    value={form.notes || ''}
                                    onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Optional admin notes…"
                                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-500/20"
                        >
                            <Save className="w-4 h-4" />
                            {isEdit ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};
