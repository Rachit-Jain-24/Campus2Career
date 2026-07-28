import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
            </div>
            {action && <div className="flex-shrink-0 animate-fade-in-up">{action}</div>}
        </div>
    );
};
