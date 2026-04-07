import React from 'react';

interface LoadingScreenProps {
    fullPage?: boolean;
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullPage = false, message = 'Loading...' }) => {
    const containerClasses = fullPage
        ? "min-h-screen flex flex-col items-center justify-center bg-background"
        : "flex flex-col items-center justify-center p-12";

    return (
        <div className={containerClasses}>
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">
                {message}
            </p>
        </div>
    );
};
