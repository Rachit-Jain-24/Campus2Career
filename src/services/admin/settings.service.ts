import { settingsDb } from '../db/database.service';
import type { PlatformSettings, SettingsSection } from '../../types/settingsAdmin';

// ── Default / Fallback Settings ──────────────────────────────

export const DEFAULT_SETTINGS: PlatformSettings = {
    general: {
        platformName: 'Smart Campus Placement Hub',
        instituteName: 'Vidyalankar Polytechnic',
        supportEmail: 'placement@vidyalankar.edu.in',
        brandLogoUrl: '',
        brandFaviconUrl: '',
        currentAcademicYear: '2025-26',
        activePlacementSeason: true
    },
    departments: [
        { id: 'dept_1', code: 'CE', displayName: 'B.Tech - Computer Engineering', isActive: true },
        { id: 'dept_2', code: 'IT', displayName: 'B.Tech - Information Technology', isActive: true },
        { id: 'dept_3', code: 'MBAF', displayName: 'MBA - Finance', isActive: true },
        { id: 'dept_4', code: 'MBAM', displayName: 'MBA - Marketing', isActive: true },
        { id: 'dept_5', code: 'ME', displayName: 'B.Tech - Mechanical Engineering', isActive: false }
    ],
    academic: {
        availableBatches: ['Final Year', '3rd Year', '2nd Year', '1st Year'],
        availableYears: ['2023-24', '2024-25', '2025-26', '2026-27'],
        semesterLabels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
        defaultProgressionYear: 'Final Year'
    },
    placement: {
        eligibilityLabels: ['eligible', 'not_eligible', 'pending_review'],
        driveStatusLabels: ['draft', 'upcoming', 'registration_open', 'ongoing', 'completed', 'cancelled'],
        offerStatusLabels: ['issued', 'accepted', 'rejected', 'expired', 'on_hold'],
        interviewRoundLabels: ['aptitude_test', 'gd', 'technical_interview', 'hr_interview', 'final_round'],
        minReadinessThreshold: 60,
        minResumeScoreThreshold: 70,
        warningCGPAThreshold: 6.0
    },
    notifications: {
        emailNotificationsEnabled: true,
        inAppNotificationsEnabled: true,
        driveReminderDaysBefore: 2,
        interviewReminderHoursBefore: 24,
        adminAlertOnNewDrive: true,
        adminAlertOnOfferUpdate: true,
        adminAlertOnLowReadiness: false
    },
    security: {
        sessionTimeoutMinutes: 60,
        auditLoggingEnabled: true,
        requireConfirmOnDelete: true,
        requireConfirmOnStatusChange: true
    }
};

// ── Service Methods ──────────────────────────────────────────

/**
 * Service to handle platform-wide settings.
 * This automatically uses the active provider (Firestore or Supabase).
 */
export const settingsService = {

    async getSettings(): Promise<PlatformSettings> {
        try {
            const settings = await settingsDb.getSettings();
            return {
                ...DEFAULT_SETTINGS,
                ...settings,
                general: { ...DEFAULT_SETTINGS.general, ...settings.general },
                placement: { ...DEFAULT_SETTINGS.placement, ...settings.placement }
            };
        } catch (err) {
            console.warn('Failed to fetch settings, using defaults:', err);
            return { ...DEFAULT_SETTINGS };
        }
    },

    async saveSettings(settings: PlatformSettings, adminEmail?: string): Promise<void> {
        try {
            await settingsDb.saveSettings(settings, adminEmail);
        } catch (err) {
            console.error('Failed to save settings:', err);
            throw new Error('Failed to update platform settings');
        }
    },

    async saveSection(section: SettingsSection, data: any, adminEmail?: string): Promise<void> {
        try {
            await settingsDb.saveSection(section, data, adminEmail);
        } catch (err) {
            console.error(`Failed to save settings section ${section}:`, err);
            throw new Error(`Failed to update settings section: ${section}`);
        }
    },

    async resetToDefaults(adminEmail?: string): Promise<void> {
        try {
            await settingsDb.saveSettings(DEFAULT_SETTINGS, adminEmail);
        } catch (err) {
            console.error('Failed to reset settings:', err);
            throw new Error('Failed to reset settings to defaults');
        }
    }
};
