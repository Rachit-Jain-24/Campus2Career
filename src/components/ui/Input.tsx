import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className, ...props }) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">{label}</label>}
            <div className="relative group">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        {icon}
                    </div>
                )}
                <input
                    className={cn(
                        "input-nmims",
                        icon && "pl-11",
                        error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-[11px] text-red-500 font-medium ml-1">{error}</p>}
        </div>
    );
};
