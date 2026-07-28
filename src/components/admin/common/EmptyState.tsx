import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon, actionLabel, onAction }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center card-nmims animate-fade-in-up border-dashed border-2 bg-secondary/30">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-6 shadow-sm border border-border">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">{description}</p>

            {actionLabel && onAction && (
                <button onClick={onAction} className="btn-nmims-primary">
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
