import React from 'react';
import { GraduationCap } from 'lucide-react';
import type { AcademicSettings } from '../../../types/settingsAdmin';
import { SettingsSectionWrapper } from './SettingsSectionWrapper';

interface AcademicSectionProps {
    data: AcademicSettings;
    isDirty: boolean;
    isSaving: boolean;
    onUpdate: <K extends keyof AcademicSettings>(key: K, value: AcademicSettings[K]) => void;
    onSave: () => void;
    onReset: () => void;
}

export const AcademicSection: React.FC<AcademicSectionProps> = ({
    data, isDirty, isSaving, onUpdate, onSave, onReset
}) => {

    const handleListChange = (key: keyof AcademicSettings, value: string) => {
        const items = value.split(',').map((s: string) => s.trim()).filter(Boolean);
        onUpdate(key, items as any);
    };

    return (
        <SettingsSectionWrapper
            title="Academic Configuration"
            description="Manage batches, years, semesters, and academic progression defaults"
            icon={GraduationCap}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={onSave}
            onReset={onReset}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Available Batches</label>
                    <input
                        type="text"
                        value={data.availableBatches.join(', ')}
                        onChange={(e) => handleListChange('availableBatches', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-600">Comma-separated list of batch labels</p>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Available Academic Years</label>
                    <input
                        type="text"
                        value={data.availableYears.join(', ')}
                        onChange={(e) => handleListChange('availableYears', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-600">Comma-separated list of academic years</p>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Semester Labels</label>
                    <input
                        type="text"
                        value={data.semesterLabels.join(', ')}
                        onChange={(e) => handleListChange('semesterLabels', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[11px] text-slate-600">Comma-separated semester/term labels</p>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Default Progression Year</label>
                    <select
                        value={data.defaultProgressionYear}
                        onChange={(e) => onUpdate('defaultProgressionYear', e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500"
                    >
                        {data.availableBatches.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

            </div>
        </SettingsSectionWrapper>
    );
};
