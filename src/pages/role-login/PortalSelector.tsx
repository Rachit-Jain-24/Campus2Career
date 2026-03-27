import { useNavigate } from 'react-router-dom';
import { GraduationCap, ServerCog, Landmark, Target, BookOpen, UserCheck, Handshake, ArrowRight } from 'lucide-react';

const PORTALS = [
    {
        role: 'System Admin',
        path: '/login/admin',
        icon: ServerCog,
        color: 'from-rose-600 to-rose-800',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        desc: 'Full platform access',
    },
    {
        role: 'Dean',
        path: '/login/dean',
        icon: Landmark,
        color: 'from-purple-600 to-purple-800',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        desc: 'Strategic oversight',
    },
    {
        role: 'Director',
        path: '/login/director',
        icon: Target,
        color: 'from-blue-600 to-blue-800',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        desc: 'Operational oversight',
    },
    {
        role: 'Program Chair',
        path: '/login/program-chair',
        icon: BookOpen,
        color: 'from-amber-600 to-amber-800',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        desc: 'Department management',
    },
    {
        role: 'Faculty',
        path: '/login/faculty',
        icon: UserCheck,
        color: 'from-emerald-600 to-emerald-800',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        desc: 'Student mentorship',
    },
    {
        role: 'Placement Officer',
        path: '/login/placement-officer',
        icon: Handshake,
        color: 'from-cyan-600 to-cyan-800',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        desc: 'Placement operations',
    },
];

export default function PortalSelector() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-nmims rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Campus2Career</h1>
                    <p className="text-muted-foreground mt-2">Select your portal to continue</p>
                </div>

                {/* Portal cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PORTALS.map((portal) => {
                        const Icon = portal.icon;
                        return (
                            <button
                                key={portal.path}
                                onClick={() => navigate(portal.path)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border ${portal.border} ${portal.bg} hover:opacity-90 transition-all group text-left`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground text-sm">{portal.role}</p>
                                    <p className="text-xs text-muted-foreground">{portal.desc}</p>
                                </div>
                                <ArrowRight className={`w-4 h-4 ${portal.text} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
                            </button>
                        );
                    })}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-8">
                    NMIMS Placement Management System · Campus2Career
                </p>
            </div>
        </div>
    );
}
