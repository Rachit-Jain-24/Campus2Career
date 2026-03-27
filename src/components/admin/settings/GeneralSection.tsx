import React from 'react';
import { Globe } from 'lucide-react';
import type { GeneralSettings } from '../../../types/settingsAdmin';
import { SettingsSectionWrapper } from './SettingsSectionWrapper';

interface GeneralSectionProps {
    data: GeneralSettings;
    isDirty: boolean;
    isSaving: boolean;
    onUpdate: <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) => void;
    onSave: () => void;
    onReset: () => void;
}

export const GeneralSection: React.FC<GeneralSectionProps> = ({
    data, isDirty, isSaving, onUpdate, onSave, onReset
}) => {
    return (
        <SettingsSectionWrapper
            title="General Platform Settings"
            description="Core branding, contact, and academic season configuration"
            icon={Globe}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={onSave}
            onReset={onReset}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Platform Name</label>
                    <input
                        type="text"
                        value={data.platformName}
                        onChange={(e) => onUpdate('platformName', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Institute Name</label>
                    <input
                        type="text"
                        value={data.instituteName}
                        onChange={(e) => onUpdate('instituteName', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Support Email</label>
                    <input
                        type="email"
                        value={data.supportEmail}
                        onChange={(e) => onUpdate('supportEmail', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Current Academic Year</label>
                    <select
                        value={data.currentAcademicYear}
                        onChange={(e) => onUpdate('currentAcademicYear', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    >
                        <option value="2023-24">2023-24</option>
                        <option value="2024-25">2024-25</option>
                        <option value="2025-26">2025-26</option>
                        <option value="2026-27">2026-27</option>
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Brand Logo URL</label>
                    <input
                        type="url"
                        value={data.brandLogoUrl}
                        onChange={(e) => onUpdate('brandLogoUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Favicon URL</label>
                    <input
                        type="url"
                        value={data.brandFaviconUrl}
                        onChange={(e) => onUpdate('brandFaviconUrl', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                </div>

            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-lg mt-4">
                <div>
                    <div className="text-sm font-medium text-foreground">Active Placement Season</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Enable to activate the current placement cycle. Disabling hides drives from student portal.</div>
                </div>
                <button
                    onClick={() => onUpdate('activePlacementSeason', !data.activePlacementSeason)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${data.activePlacementSeason ? 'bg-emerald-600' : 'bg-secondary'}`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${data.activePlacementSeason ? 'translate-x-6' : ''}`} />
                </button>
            </div>

        </SettingsSectionWrapper>
    );
};
