// ─────────────────────────────────────────────────────────────
// Settings Firestore Service
// All persistence logic lives here – UI state is in useSettings hook.
// ─────────────────────────────────────────────────────────────

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { PlatformSettings, SettingsSection } from '../../types/settingsAdmin';

const DOC_PATH = 'config/platformSettings';

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

export const settingsService = {

    async getSettings(): Promise<PlatformSettings> {
        try {
            const docRef = doc(db, DOC_PATH);
            const snapshot = await getDoc(docRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                return {
                    general: data.general || DEFAULT_SETTINGS.general,
                    departments: data.departments || DEFAULT_SETTINGS.departments,
                    academic: data.academic || DEFAULT_SETTINGS.academic,
                    placement: data.placement || DEFAULT_SETTINGS.placement,
                    notifications: data.notifications || DEFAULT_SETTINGS.notifications,
                    security: data.security || DEFAULT_SETTINGS.security,
                    updatedAt: data.updatedAt?.toDate() || undefined,
                    updatedBy: data.updatedBy || undefined
                };
            }

            // No document exists yet — return defaults
            return { ...DEFAULT_SETTINGS };
        } catch (err) {
            console.warn('Failed to fetch settings from Firestore, using defaults:', err);
            return { ...DEFAULT_SETTINGS };
        }
    },

    async saveSettings(settings: PlatformSettings, adminEmail?: string): Promise<void> {
        const docRef = doc(db, DOC_PATH);
        await setDoc(docRef, {
            ...settings,
            updatedAt: serverTimestamp(),
            updatedBy: adminEmail || 'system_admin'
        }, { merge: true });
    },

    async saveSection(section: SettingsSection, data: any, adminEmail?: string): Promise<void> {
        const docRef = doc(db, DOC_PATH);
        await setDoc(docRef, {
            [section]: data,
            updatedAt: serverTimestamp(),
            updatedBy: adminEmail || 'system_admin'
        }, { merge: true });
    },

    async resetToDefaults(adminEmail?: string): Promise<void> {
        const docRef = doc(db, DOC_PATH);
        await setDoc(docRef, {
            ...DEFAULT_SETTINGS,
            updatedAt: serverTimestamp(),
            updatedBy: adminEmail || 'system_admin'
        });
    }
};
