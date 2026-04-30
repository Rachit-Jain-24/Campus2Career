import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ServerCog, Landmark, Target, BookOpen, UserCheck, Handshake, ArrowRight, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultAdminRoute } from '../../config/admin/roleRoutes';

const PORTALS = [
    {
        role: 'system_admin',
        label: 'System Admin',
        email: 'sysadmin@nmims.edu',
        dashboard: '/admin/dashboard',
        icon: ServerCog,
        color: 'from-rose-600 to-rose-800',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        desc: 'Full platform access',
    },
    {
        role: 'dean',
        label: 'Dean',
        email: 'dean@nmims.edu',
        dashboard: '/dean/dashboard',
        icon: Landmark,
        color: 'from-purple-600 to-purple-800',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        desc: 'Strategic oversight',
    },
    {
        role: 'director',
        label: 'Director',
        email: 'director@nmims.edu',
        dashboard: '/director/dashboard',
        icon: Target,
        color: 'from-blue-600 to-blue-800',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        desc: 'Operational oversight',
    },
    {
        role: 'program_chair',
        label: 'Program Chair',
        email: 'programchair@nmims.edu',
        dashboard: '/program-chair/dashboard',
        icon: BookOpen,
        color: 'from-amber-600 to-amber-800',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        desc: 'Department management',
    },
    {
        role: 'faculty',
        label: 'Faculty',
        email: 'faculty@nmims.edu',
        dashboard: '/faculty/dashboard',
        icon: UserCheck,
        color: 'from-emerald-600 to-emerald-800',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        desc: 'Student mentorship',
    },
    {
        role: 'placement_officer',
        label: 'Placement Officer',
        email: 'placement@nmims.edu',
        dashboard: '/placement/dashboard',
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
    const { adminLogin, user, isInitializing } = useAuth();
    const [loadingRole, setLoadingRole] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // If already logged in as admin, redirect straight to their dashboard
    useEffect(() => {
        if (!isInitializing && user && user.role !== 'student') {
            navigate(getDefaultAdminRoute(user.role), { replace: true });
        }
    }, [user, isInitializing, navigate]);

    const handleLoginClick = async (e: React.FormEvent, portal: typeof PORTALS[0]) => {
        e.preventDefault();
        setLoadingRole(portal.role);
        setError(null);
        try {
            await adminLogin(portal.email, password);
            navigate(portal.dashboard, { replace: true });
        } catch (err: any) {
            console.error('Admin login failed:', err);
            setError('Invalid password. Please try again.');
            setPassword('');
        } finally {
            setLoadingRole(null);
        }
    };

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl animate-fade-in-up">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-nmims rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Campus2Career</h1>
                    <p className="text-muted-foreground mt-2">Select your role and enter password to continue</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PORTALS.map((portal) => {
                        const Icon = portal.icon;
                        const isSelected = selectedRole === portal.role;
                        
                        return (
                            <div
                                key={portal.role}
                                className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 ${
                                    isSelected 
                                        ? `ring-2 ring-offset-2 ring-offset-background ${portal.border} ${portal.bg} shadow-lg scale-[1.02]` 
                                        : `${portal.border} ${portal.bg} hover:scale-[1.01] opacity-80 hover:opacity-100 cursor-pointer`
                                }`}
                                onClick={() => !isSelected && setSelectedRole(portal.role)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground text-sm">{portal.label}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{portal.desc}</p>
                                    </div>
                                    {!isSelected && <ArrowRight className={`w-4 h-4 ${portal.text} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`} />}
                                </div>

                                {isSelected && (
                                    <form 
                                        onSubmit={(e) => handleLoginClick(e, portal)}
                                        className="mt-4 pt-4 border-t border-white/10 animate-fade-in"
                                    >
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    autoFocus
                                                    type="password"
                                                    placeholder="Enter Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-background/50 border border-white/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                                />
                                            </div>
                                            
                                            {error && (
                                                <p className="text-[10px] text-rose-500 font-medium px-1 animate-pulse">
                                                    {error}
                                                </p>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedRole(null);
                                                        setPassword('');
                                                        setError(null);
                                                    }}
                                                    className="flex-1 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!!loadingRole || !password}
                                                    className={`flex-[2] py-2 rounded-xl bg-gradient-to-br ${portal.color} text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
                                                >
                                                    {loadingRole === portal.role ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : 'Login'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
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
