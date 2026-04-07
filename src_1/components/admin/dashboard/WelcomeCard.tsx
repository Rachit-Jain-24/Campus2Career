import React from 'react';
import { Sparkles, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import type { AdminUser } from '../../../types/auth';

const roleConfig: Record<string, { label: string; badge: string }> = {
    dean: { label: 'Dean of Academics', badge: '🎓 Dean' },
    director: { label: 'Director', badge: '🏛️ Director' },
    program_chair: { label: 'Program Chair', badge: '📋 Program Chair' },
    faculty: { label: 'Faculty Mentor', badge: '👨‍🏫 Faculty Mentor' },
    placement_officer: { label: 'Placement Officer', badge: '💼 Placement Officer' },
    system_admin: { label: 'System Administrator', badge: '⚙️ System Admin' },
};

export const WelcomeCard: React.FC = () => {
    const { user } = useAuth();
    const adminUser = user as AdminUser;

    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date());

    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const rawRole = user?.role as string | undefined;
    const config = rawRole ? roleConfig[rawRole] : null;
    const roleLabel = config?.label ?? (rawRole
        ? rawRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Administrator');
    const badgeText = config?.badge ?? `🛡️ ${roleLabel}`;

    return (
        /* Same gradient as the student dashboard hero — NMIMS red, light theme */
        <div className="relative overflow-hidden rounded-3xl bg-gradient-nmims p-8 text-white shadow-2xl border border-white/10 group mb-6">
            {/* Decorative orbs */}
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
            <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-4 w-4 text-white/70" />
                        <span className="text-xs font-black tracking-widest uppercase text-white/70">
                            {badgeText}{adminUser?.department ? ` • ${adminUser.department}` : ''}
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">
                        {greeting}, {user?.name?.split(' ')[0] || 'Admin'}!{' '}
                        <Sparkles className="inline w-6 h-6 text-white/80 animate-pulse" />
                    </h1>
                    <p className="text-white/80 font-medium text-sm mt-1">
                        Campus2Career Admin · NMIMS Hyderabad
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 self-start sm:self-auto shrink-0">
                    <Calendar className="w-4 h-4 text-white/80" />
                    <span className="text-sm font-semibold text-white">{today}</span>
                </div>
            </div>

            {/* Bottom accent line — same style as student dashboard */}
            <div className="h-0.5 w-full bg-gradient-to-r from-white/30 via-white/10 to-transparent absolute bottom-0 left-0" />
        </div>
    );
};
