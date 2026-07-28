import React from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface SettingsSectionWrapperProps {
    title: string;
    description: string;
    icon: React.ElementType;
    isDirty: boolean;
    isSaving: boolean;
    onSave: () => void;
    onReset: () => void;
    children: React.ReactNode;
}

export const SettingsSectionWrapper: React.FC<SettingsSectionWrapperProps> = ({
    title,
    description,
    icon: Icon,
    isDirty,
    isSaving,
    onSave,
    onReset,
    children
}) => {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-base">{title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isDirty && (
                        <span className="text-xs text-amber-400 font-medium px-2 py-1 bg-amber-500/10 rounded-md">
                            Unsaved changes
                        </span>
                    )}
                    <button
                        onClick={onReset}
                        disabled={!isDirty || isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        onClick={onSave}
                        disabled={!isDirty || isSaving}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? 'Saving...' : 'Save Section'}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
                {children}
            </div>
        </div>
    );
};
