// ─────────────────────────────────────────────────────────────
// useSettings Hook — Manages all Settings UI state
// Supports: dirty tracking, per-section save/reset, loading/success/error
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
    PlatformSettings,
    SettingsSection,
    GeneralSettings,
    DepartmentEntry,
    AcademicSettings,
    PlacementSettings,
    NotificationSettings,
    SecuritySettings
} from '../../types/settingsAdmin';
import { settingsService, DEFAULT_SETTINGS } from '../../services/admin/settings.service';
import { useAuth } from '../../contexts/AuthContext';

export const useSettings = () => {
    const { user } = useAuth();

    // ── Loading / Error / Success ────────────────────────────
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ── Active section tab ───────────────────────────────────
    const [activeSection, setActiveSection] = useState<SettingsSection>('general');

    // ── Settings state ───────────────────────────────────────
    const [settings, setSettings] = useState<PlatformSettings>({ ...DEFAULT_SETTINGS });
    const originalRef = useRef<PlatformSettings>({ ...DEFAULT_SETTINGS });

    // ── Dirty state ──────────────────────────────────────────
    const [dirtyFlags, setDirtyFlags] = useState<Record<SettingsSection, boolean>>({
        general: false,
        departments: false,
        academic: false,
        placement: false,
        notifications: false,
        security: false
    });

    const isDirty = Object.values(dirtyFlags).some(Boolean);

    // ── Fetch ────────────────────────────────────────────────
    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await settingsService.getSettings();
            setSettings(data);
            originalRef.current = JSON.parse(JSON.stringify(data));
            setDirtyFlags({ general: false, departments: false, academic: false, placement: false, notifications: false, security: false });
        } catch (err: any) {
            setError(err.message || 'Failed to load settings.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    // ── Auto-clear success messages ──────────────────────────
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // ── Section Updaters ─────────────────────────────────────

    const updateGeneral = useCallback(<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => {
        setSettings(prev => ({ ...prev, general: { ...prev.general, [key]: value } }));
        setDirtyFlags(prev => ({ ...prev, general: true }));
    }, []);

    const updateAcademic = useCallback(<K extends keyof AcademicSettings>(key: K, value: AcademicSettings[K]) => {
        setSettings(prev => ({ ...prev, academic: { ...prev.academic, [key]: value } }));
        setDirtyFlags(prev => ({ ...prev, academic: true }));
    }, []);

    const updatePlacement = useCallback(<K extends keyof PlacementSettings>(key: K, value: PlacementSettings[K]) => {
        setSettings(prev => ({ ...prev, placement: { ...prev.placement, [key]: value } }));
        setDirtyFlags(prev => ({ ...prev, placement: true }));
    }, []);

    const updateNotifications = useCallback(<K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
        setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: value } }));
        setDirtyFlags(prev => ({ ...prev, notifications: true }));
    }, []);

    const updateSecurity = useCallback(<K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => {
        setSettings(prev => ({ ...prev, security: { ...prev.security, [key]: value } }));
        setDirtyFlags(prev => ({ ...prev, security: true }));
    }, []);

    // ── Department CRUD ──────────────────────────────────────

    const addDepartment = useCallback((dept: Omit<DepartmentEntry, 'id'>) => {
        const newDept: DepartmentEntry = { ...dept, id: `dept_${Date.now()}` };
        setSettings(prev => ({ ...prev, departments: [...prev.departments, newDept] }));
        setDirtyFlags(prev => ({ ...prev, departments: true }));
    }, []);

    const updateDepartment = useCallback((id: string, updates: Partial<DepartmentEntry>) => {
        setSettings(prev => ({
            ...prev,
            departments: prev.departments.map(d => d.id === id ? { ...d, ...updates } : d)
        }));
        setDirtyFlags(prev => ({ ...prev, departments: true }));
    }, []);

    const removeDepartment = useCallback((id: string) => {
        setSettings(prev => ({
            ...prev,
            departments: prev.departments.filter(d => d.id !== id)
        }));
        setDirtyFlags(prev => ({ ...prev, departments: true }));
    }, []);

    // ── Save ─────────────────────────────────────────────────

    const saveSection = useCallback(async (section: SettingsSection) => {
        setIsSaving(true);
        setError(null);
        try {
            const sectionData = section === 'departments' ? settings.departments : settings[section];
            await settingsService.saveSection(section, sectionData, user?.email || undefined);
            originalRef.current = JSON.parse(JSON.stringify(settings));
            setDirtyFlags(prev => ({ ...prev, [section]: false }));
            setSuccessMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully.`);
        } catch (err: any) {
            setError(err.message || `Failed to save ${section} settings.`);
        } finally {
            setIsSaving(false);
        }
    }, [settings, user]);

    const saveAll = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            await settingsService.saveSettings(settings, user?.email || undefined);
            originalRef.current = JSON.parse(JSON.stringify(settings));
            setDirtyFlags({ general: false, departments: false, academic: false, placement: false, notifications: false, security: false });
            setSuccessMessage('All settings saved successfully.');
        } catch (err: any) {
            setError(err.message || 'Failed to save settings.');
        } finally {
            setIsSaving(false);
        }
    }, [settings, user]);

    // ── Reset ────────────────────────────────────────────────

    const resetSection = useCallback((section: SettingsSection) => {
        const original = originalRef.current;
        if (section === 'departments') {
            setSettings(prev => ({ ...prev, departments: JSON.parse(JSON.stringify(original.departments)) }));
        } else {
            setSettings(prev => ({ ...prev, [section]: JSON.parse(JSON.stringify(original[section])) }));
        }
        setDirtyFlags(prev => ({ ...prev, [section]: false }));
    }, []);

    const resetAllToDefaults = useCallback(async () => {
        setIsSaving(true);
        setError(null);
        try {
            await settingsService.resetToDefaults(user?.email || undefined);
            setSettings({ ...DEFAULT_SETTINGS });
            originalRef.current = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            setDirtyFlags({ general: false, departments: false, academic: false, placement: false, notifications: false, security: false });
            setSuccessMessage('All settings reset to defaults.');
        } catch (err: any) {
            setError(err.message || 'Failed to reset settings.');
        } finally {
            setIsSaving(false);
        }
    }, [user]);

    // ── Return ───────────────────────────────────────────────

    return {
        // State
        isLoading,
        isSaving,
        error,
        successMessage,

        // Navigation
        activeSection,
        setActiveSection,

        // Settings data
        settings,

        // Dirty state
        dirtyFlags,
        isDirty,

        // Section updaters
        updateGeneral,
        updateAcademic,
        updatePlacement,
        updateNotifications,
        updateSecurity,

        // Department CRUD
        addDepartment,
        updateDepartment,
        removeDepartment,

        // Persistence
        saveSection,
        saveAll,
        resetSection,
        resetAllToDefaults,

        // Refresh
        refresh: fetchSettings
    };
};
