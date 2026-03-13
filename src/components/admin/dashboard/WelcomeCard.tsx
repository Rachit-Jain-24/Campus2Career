import React from 'react';
import { Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import type { AdminUser } from '../../../types/auth';

export const WelcomeCard: React.FC = () => {
    const { user } = useAuth();
    const adminUser = user as AdminUser;

    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date());

    const formatRole = (role?: string) => {
        if (!role) return 'Administrator';
        if (role === 'system_admin') return 'System Administrator';
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="relative overflow-hidden card-nmims outline outline-1 outline-primary/10 border-0 shadow-lg mb-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'} <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    </h1>
                    <p className="text-muted-foreground">
                        [{formatRole(user?.role)}] {adminUser?.department ? `- ${adminUser.department}` : ''}
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl border border-border/50 backdrop-blur-sm self-start sm:self-auto">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{today}</span>
                </div>
            </div>

            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-50 absolute bottom-0 left-0" />
        </div>
    );
};
