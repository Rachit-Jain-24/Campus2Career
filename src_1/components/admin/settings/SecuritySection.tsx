import React from 'react';
import { Shield } from 'lucide-react';
import type { SecuritySettings } from '../../../types/settingsAdmin';
import { SettingsSectionWrapper } from './SettingsSectionWrapper';

interface SecuritySectionProps {
    data: SecuritySettings;
    isDirty: boolean;
    isSaving: boolean;
    onUpdate: <K extends keyof SecuritySettings>(key: K, value: SecuritySettings[K]) => void;
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
    <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-lg">
        <div>
            <div className="text-sm font-medium text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        </div>
        <button
            onClick={() => onChange(!value)}
            className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-emerald-600' : 'bg-secondary'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-6' : ''}`} />
        </button>
    </div>
);

export const SecuritySection: React.FC<SecuritySectionProps> = ({
    data, isDirty, isSaving, onUpdate, onSave, onReset
}) => {
    return (
        <SettingsSectionWrapper
            title="Security & Access"
            description="Session management, audit logging, and action confirmation policies"
            icon={Shield}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={onSave}
            onReset={onReset}
        >
            {/* Session Timeout */}
            <div className="space-y-1.5 max-w-xs">
                <label className="text-xs font-semibold text-muted-foreground">Session Timeout (minutes)</label>
                <input
                    type="number"
                    min={5}
                    max={480}
                    value={data.sessionTimeoutMinutes}
                    onChange={(e) => onUpdate('sessionTimeoutMinutes', parseInt(e.target.value) || 60)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-600">Admins will be auto-logged out after this period of inactivity</p>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
                <ToggleRow
                    label="Audit Logging"
                    description="Log all admin actions (create, update, delete) for accountability and compliance"
                    value={data.auditLoggingEnabled}
                    onChange={(v) => onUpdate('auditLoggingEnabled', v)}
                />
                <ToggleRow
                    label="Confirm on Delete"
                    description="Require explicit confirmation before deleting any record (students, companies, drives, etc.)"
                    value={data.requireConfirmOnDelete}
                    onChange={(v) => onUpdate('requireConfirmOnDelete', v)}
                />
                <ToggleRow
                    label="Confirm on Status Change"
                    description="Require confirmation when changing offer status, drive status, or interview outcomes"
                    value={data.requireConfirmOnStatusChange}
                    onChange={(v) => onUpdate('requireConfirmOnStatusChange', v)}
                />
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg mt-2">
                <p className="text-xs text-amber-300/80 font-medium">
                    ⚠️ Security settings are sensitive. Changes here will affect all admin users. Session timeout and audit logging changes take effect on next login.
                </p>
            </div>

        </SettingsSectionWrapper>
    );
};
