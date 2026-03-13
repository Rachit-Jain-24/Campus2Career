import React from 'react';
import {
    Settings, Globe, Building2, GraduationCap, Target, Bell, Shield,
    Save, RotateCcw, RefreshCw, CheckCircle2
} from 'lucide-react';
import { useSettings } from '../../hooks/admin/useSettings';
import type { SettingsSection } from '../../types/settingsAdmin';

import { GeneralSection } from '../../components/admin/settings/GeneralSection';
import { DepartmentsSection } from '../../components/admin/settings/DepartmentsSection';
import { AcademicSection } from '../../components/admin/settings/AcademicSection';
import { PlacementSection } from '../../components/admin/settings/PlacementSection';
import { NotificationsSection } from '../../components/admin/settings/NotificationsSection';
import { SecuritySection } from '../../components/admin/settings/SecuritySection';

const SECTION_TABS: { key: SettingsSection; label: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'General', icon: Globe },
    { key: 'departments', label: 'Departments', icon: Building2 },
    { key: 'academic', label: 'Academic', icon: GraduationCap },
    { key: 'placement', label: 'Placement', icon: Target },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield }
];

export const SettingsPage: React.FC = () => {
    const {
        isLoading,
        isSaving,
        error,
        successMessage,
        activeSection,
        setActiveSection,
        settings,
        dirtyFlags,
        isDirty,
        updateGeneral,
        updateAcademic,
        updatePlacement,
        updateNotifications,
        updateSecurity,
        addDepartment,
        updateDepartment,
        removeDepartment,
        saveSection,
        saveAll,
        resetSection,
        resetAllToDefaults,
        refresh
    } = useSettings();

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-500/20 rounded-lg border border-brand-500/30">
                            <Settings className="w-6 h-6 text-brand-400" />
                        </div>
                        Platform Settings
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Configure platform-level settings, departments, and operational thresholds.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={resetAllToDefaults}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset All Defaults
                    </button>
                    <button
                        onClick={saveAll}
                        disabled={!isDirty || isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save All'}
                    </button>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
                    <strong>Error:</strong> {error}
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMessage}
                </div>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-3 border border-slate-800 border-dashed rounded-xl">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p>Loading platform settings...</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* Section Navigation */}
                    <div className="lg:w-56 flex-shrink-0">
                        <nav className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden lg:sticky lg:top-4">
                            {SECTION_TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeSection === tab.key;
                                const hasDirty = dirtyFlags[tab.key];
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveSection(tab.key)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-left transition-colors border-b border-slate-800/50 last:border-b-0 ${isActive
                                            ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-l-indigo-500'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        <span className="flex-1">{tab.label}</span>
                                        {hasDirty && (
                                            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Active Section Content */}
                    <div className="flex-1 min-w-0">
                        {activeSection === 'general' && (
                            <GeneralSection
                                data={settings.general}
                                isDirty={dirtyFlags.general}
                                isSaving={isSaving}
                                onUpdate={updateGeneral}
                                onSave={() => saveSection('general')}
                                onReset={() => resetSection('general')}
                            />
                        )}
                        {activeSection === 'departments' && (
                            <DepartmentsSection
                                data={settings.departments}
                                isDirty={dirtyFlags.departments}
                                isSaving={isSaving}
                                onAdd={addDepartment}
                                onUpdate={updateDepartment}
                                onRemove={removeDepartment}
                                onSave={() => saveSection('departments')}
                                onReset={() => resetSection('departments')}
                            />
                        )}
                        {activeSection === 'academic' && (
                            <AcademicSection
                                data={settings.academic}
                                isDirty={dirtyFlags.academic}
                                isSaving={isSaving}
                                onUpdate={updateAcademic}
                                onSave={() => saveSection('academic')}
                                onReset={() => resetSection('academic')}
                            />
                        )}
                        {activeSection === 'placement' && (
                            <PlacementSection
                                data={settings.placement}
                                isDirty={dirtyFlags.placement}
                                isSaving={isSaving}
                                onUpdate={updatePlacement}
                                onSave={() => saveSection('placement')}
                                onReset={() => resetSection('placement')}
                            />
                        )}
                        {activeSection === 'notifications' && (
                            <NotificationsSection
                                data={settings.notifications}
                                isDirty={dirtyFlags.notifications}
                                isSaving={isSaving}
                                onUpdate={updateNotifications}
                                onSave={() => saveSection('notifications')}
                                onReset={() => resetSection('notifications')}
                            />
                        )}
                        {activeSection === 'security' && (
                            <SecuritySection
                                data={settings.security}
                                isDirty={dirtyFlags.security}
                                isSaving={isSaving}
                                onUpdate={updateSecurity}
                                onSave={() => saveSection('security')}
                                onReset={() => resetSection('security')}
                            />
                        )}
                    </div>

                </div>
            )}

            {/* Last Updated */}
            {settings.updatedAt && (
                <div className="text-xs text-slate-600 text-right">
                    Last updated: {new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(settings.updatedAt)}
                    {settings.updatedBy && ` by ${settings.updatedBy}`}
                </div>
            )}

        </div>
    );
};
