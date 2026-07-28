import React from 'react';
import type { StatCardProps } from '../../../types/admin';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, subtitle }) => {
    return (
        <div className="card-nmims p-6 animate-fade-in-up">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-foreground">{value}</h3>
                </div>
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Icon className="w-5 h-5 text-primary" />
                </div>
            </div>

            {(trend || subtitle) && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                    {trend && (
                        <span className={`flex items-center gap-1 font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                            {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {trend.value}%
                        </span>
                    )}
                    {subtitle && <span className="text-muted-foreground truncate">{subtitle}</span>}
                </div>
            )}
        </div>
    );
};
