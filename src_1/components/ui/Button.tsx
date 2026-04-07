import React from 'react';
import { cn } from '../../lib/utils'; // I'll create this helper next

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading,
    className,
    ...props
}) => {
    const variants = {
        primary: 'btn-nmims-primary',
        outline: 'btn-nmims-outline',
        ghost: 'hover:bg-slate-100 text-slate-600 px-4 py-2 font-medium transition-all rounded-xl',
    };

    const sizes = {
        sm: 'text-xs px-4 py-2',
        md: 'text-sm px-6 py-2.5',
        lg: 'text-base px-8 py-3',
    };

    return (
        <button
            className={cn(variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                </span>
            ) : children}
        </button>
    );
};
