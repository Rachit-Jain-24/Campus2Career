import React from 'react';
import { Bell } from 'lucide-react';
import type { NotificationSettings } from '../../../types/settingsAdmin';
import { SettingsSectionWrapper } from './SettingsSectionWrapper';

interface NotificationsSectionProps {
    data: NotificationSettings;
    isDirty: boolean;
    isSaving: boolean;
    onUpdate: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void;
    onSave: () => void;
    onReset: () => void;
}

interface ToggleRowProps {
    label: string;
    description: string;
    value: boolean;
    onChange: (val: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
        <div>
            <div className="text-sm font-medium text-white">{label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{description}</div>
        </div>
        <button
            onClick={() => onChange(!value)}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-emerald-600' : 'bg-slate-700'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : ''}`} />
        </button>
    </div>
);

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
    data, isDirty, isSaving, onUpdate, onSave, onReset
}) => {
    return (
        <SettingsSectionWrapper
            title="Notification & Communication"
            description="Email, in-app notification channels and admin alert preferences"
            icon={Bell}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={onSave}
            onReset={onReset}
        >
            {/* Channel Toggles */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">Channels</h4>
                <ToggleRow
                    label="Email Notifications"
                    description="Send email alerts for drive registrations, interview schedules, and offer updates"
                    value={data.emailNotificationsEnabled}
                    onChange={(v) => onUpdate('emailNotificationsEnabled', v)}
                />
                <ToggleRow
                    label="In-App Notifications"
                    description="Show notification banners and badge counts within the admin portal"
                    value={data.inAppNotificationsEnabled}
                    onChange={(v) => onUpdate('inAppNotificationsEnabled', v)}
                />
            </div>

            {/* Reminder Defaults */}
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <h4 className="text-sm font-bold text-slate-300">Reminder Defaults</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Drive Reminder (days before)</label>
                        <input
                            type="number"
                            min={1}
                            max={14}
                            value={data.driveReminderDaysBefore}
                            onChange={(e) => onUpdate('driveReminderDaysBefore', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Interview Reminder (hours before)</label>
                        <input
                            type="number"
                            min={1}
                            max={72}
                            value={data.interviewReminderHoursBefore}
                            onChange={(e) => onUpdate('interviewReminderHoursBefore', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Admin Alerts */}
            <div className="space-y-3 pt-4 border-t border-slate-800/50">
                <h4 className="text-sm font-bold text-slate-300">Admin Alert Preferences</h4>
                <ToggleRow
                    label="New Drive Created"
                    description="Alert all admins when a new drive is published"
                    value={data.adminAlertOnNewDrive}
                    onChange={(v) => onUpdate('adminAlertOnNewDrive', v)}
                />
                <ToggleRow
                    label="Offer Status Change"
                    description="Alert when an offer is accepted, rejected, or expires"
                    value={data.adminAlertOnOfferUpdate}
                    onChange={(v) => onUpdate('adminAlertOnOfferUpdate', v)}
                />
                <ToggleRow
                    label="Low Readiness Warning"
                    description="Alert when a student's readiness score drops below the configured threshold"
                    value={data.adminAlertOnLowReadiness}
                    onChange={(v) => onUpdate('adminAlertOnLowReadiness', v)}
                />
            </div>
        </SettingsSectionWrapper>
    );
};
