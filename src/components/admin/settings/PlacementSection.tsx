import React from 'react';
import { Target } from 'lucide-react';
import type { PlacementSettings } from '../../../types/settingsAdmin';
import { SettingsSectionWrapper } from './SettingsSectionWrapper';

interface PlacementSectionProps {
    data: PlacementSettings;
    isDirty: boolean;
    isSaving: boolean;
    onUpdate: <K extends keyof PlacementSettings>(key: K, value: PlacementSettings[K]) => void;
    onSave: () => void;
    onReset: () => void;
}

export const PlacementSection: React.FC<PlacementSectionProps> = ({
    data, isDirty, isSaving, onUpdate, onSave, onReset
}) => {

    const handleListChange = (key: keyof PlacementSettings, value: string) => {
        const items = value.split(',').map((s: string) => s.trim()).filter(Boolean);
        onUpdate(key, items as any);
    };

    return (
        <SettingsSectionWrapper
            title="Placement Configuration"
            description="Status labels, interview round types, and key thresholds"
            icon={Target}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={onSave}
            onReset={onReset}
        >
            {/* Labels Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-300">Status & Label Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Eligibility Status Labels</label>
                        <input
                            type="text"
                            value={data.eligibilityLabels.join(', ')}
                            onChange={(e) => handleListChange('eligibilityLabels', e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Drive Status Labels</label>
                        <input
                            type="text"
                            value={data.driveStatusLabels.join(', ')}
                            onChange={(e) => handleListChange('driveStatusLabels', e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Offer Status Labels</label>
                        <input
                            type="text"
                            value={data.offerStatusLabels.join(', ')}
                            onChange={(e) => handleListChange('offerStatusLabels', e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Interview Round Labels</label>
                        <input
                            type="text"
                            value={data.interviewRoundLabels.join(', ')}
                            onChange={(e) => handleListChange('interviewRoundLabels', e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                </div>
            </div>

            {/* Thresholds Section */}
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
                <h4 className="text-sm font-bold text-slate-300">Quick Thresholds</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Min Readiness Threshold</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={data.minReadinessThreshold}
                                onChange={(e) => onUpdate('minReadinessThreshold', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-xs text-slate-500">%</span>
                        </div>
                        <p className="text-[11px] text-slate-600">Students below this will be flagged</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Min Resume Score Threshold</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={data.minResumeScoreThreshold}
                                onChange={(e) => onUpdate('minResumeScoreThreshold', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-xs text-slate-500">%</span>
                        </div>
                        <p className="text-[11px] text-slate-600">Resumes below this need review</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400">Warning CGPA Threshold</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.1}
                                value={data.warningCGPAThreshold}
                                onChange={(e) => onUpdate('warningCGPAThreshold', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-xs text-slate-500">/ 10</span>
                        </div>
                        <p className="text-[11px] text-slate-600">Students below this CGPA flagged</p>
                    </div>

                </div>
            </div>

        </SettingsSectionWrapper>
    );
};
