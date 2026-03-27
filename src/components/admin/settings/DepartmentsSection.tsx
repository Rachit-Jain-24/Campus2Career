import React, { useState } from 'react';
import { Building2, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { DepartmentEntry } from '../../../types/settingsAdmin';
import { SettingsSectionWrapper } from './SettingsSectionWrapper';

interface DepartmentsSectionProps {
    data: DepartmentEntry[];
    isDirty: boolean;
    isSaving: boolean;
    onAdd: (dept: Omit<DepartmentEntry, 'id'>) => void;
    onUpdate: (id: string, updates: Partial<DepartmentEntry>) => void;
    onRemove: (id: string) => void;
    onSave: () => void;
    onReset: () => void;
}

export const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
    data, isDirty, isSaving, onAdd, onUpdate, onRemove, onSave, onReset
}) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newCode, setNewCode] = useState('');
    const [newName, setNewName] = useState('');
    const [editCode, setEditCode] = useState('');
    const [editName, setEditName] = useState('');

    const handleAdd = () => {
        if (newCode.trim() && newName.trim()) {
            onAdd({ code: newCode.trim(), displayName: newName.trim(), isActive: true });
            setNewCode('');
            setNewName('');
            setIsAdding(false);
        }
    };

    const startEdit = (dept: DepartmentEntry) => {
        setEditingId(dept.id);
        setEditCode(dept.code);
        setEditName(dept.displayName);
    };

    const confirmEdit = (id: string) => {
        if (editCode.trim() && editName.trim()) {
            onUpdate(id, { code: editCode.trim(), displayName: editName.trim() });
            setEditingId(null);
        }
    };

    return (
        <SettingsSectionWrapper
            title="Department Master"
            description="Manage departments available across the platform"
            icon={Building2}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={onSave}
            onReset={onReset}
        >
            {/* Department List */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-muted-foreground border-b border-border/50">
                            <th className="px-4 py-3 font-medium">Code</th>
                            <th className="px-4 py-3 font-medium">Display Name</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {data.map((dept) => (
                            <tr key={dept.id} className="hover:bg-secondary/30 transition-colors">
                                <td className="px-4 py-3">
                                    {editingId === dept.id ? (
                                        <input
                                            type="text"
                                            value={editCode}
                                            onChange={(e) => setEditCode(e.target.value)}
                                            className="w-20 px-2 py-1 bg-background border border-indigo-500 rounded text-sm text-foreground focus:outline-none"
                                        />
                                    ) : (
                                        <span className="font-mono text-indigo-400 font-bold">{dept.code}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === dept.id ? (
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full px-2 py-1 bg-background border border-indigo-500 rounded text-sm text-foreground focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-foreground font-medium">{dept.displayName}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => onUpdate(dept.id, { isActive: !dept.isActive })}
                                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${dept.isActive
                                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                : 'bg-secondary/70 text-muted-foreground hover:bg-secondary'
                                            }`}
                                    >
                                        {dept.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {editingId === dept.id ? (
                                            <>
                                                <button onClick={() => confirmEdit(dept.id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEdit(dept)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onRemove(dept.id)} className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Department */}
            {isAdding ? (
                <div className="flex items-end gap-3 p-4 bg-background/50 border border-border rounded-lg">
                    <div className="space-y-1.5 flex-shrink-0">
                        <label className="text-xs font-semibold text-muted-foreground">Code</label>
                        <input
                            type="text"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                            placeholder="e.g. EE"
                            className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="space-y-1.5 flex-1">
                        <label className="text-xs font-semibold text-muted-foreground">Display Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="e.g. B.Tech - Electrical Engineering"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <button onClick={handleAdd} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-foreground rounded-lg text-sm font-medium transition-colors">
                        Add
                    </button>
                    <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors">
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-dashed border-indigo-500/30 rounded-lg transition-colors w-full justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Add Department
                </button>
            )}

        </SettingsSectionWrapper>
    );
};
