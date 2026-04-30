import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Zap, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface RoleLoginPageProps {
    role: string;
    roleLabel: string;
    dashboardPath: string;
    accentColor: string;
    accentBg: string;
    accentBorder: string;
    accentText: string;
    icon: React.ElementType;
    demoEmail: string;
    demoPassword: string;
    description: string;
}

type View = 'login' | 'forgot' | 'forgot_sent';

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({
    role,
    roleLabel,
    dashboardPath,
    accentColor,
    accentBg,
    accentBorder,
    accentText,
    icon: Icon,
    demoEmail,
    demoPassword,
    description,
}) => {
    const { adminLogin, mockLogin, user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [view, setView] = useState<View>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && user && user.role !== 'student') {
            navigate(dashboardPath, { replace: true });
        }
    }, [user, authLoading, navigate, dashboardPath]);

    const handlePreview = () => mockLogin(role, `${roleLabel} (Preview)`, demoEmail);

    const fillDemo = () => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await adminLogin(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { error: resetErr } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (resetErr) throw resetErr;
            setView('forgot_sent');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email. Check the address and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Forgot password sent ──────────────────────────────────────────────────
    if (view === 'forgot_sent') {
        return (
            <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden">
                <div className={`absolute top-[-15%] left-[-10%] w-[45%] h-[45%] blur-[140px] rounded-full opacity-30 pointer-events-none bg-gradient-to-br ${accentColor}`} />
                <div className="relative z-10 m-auto w-full max-w-md px-4 py-8">
                    <div className="glass-nmims p-8 shadow-2xl text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold">Check your email</h2>
                        <p className="text-sm text-muted-foreground">
                            A password reset link has been sent to<br />
                            <span className="font-semibold text-foreground">{resetEmail}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Click the link in the email to set a new password. Check your spam folder if you don't see it.
                        </p>
                        <button
                            onClick={() => { setView('login'); setError(null); }}
                            className="w-full py-3 rounded-xl font-semibold border border-border hover:bg-muted transition-colors text-sm"
                        >
                            Back to login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Forgot password form ──────────────────────────────────────────────────
    if (view === 'forgot') {
        return (
            <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden">
                <div className={`absolute top-[-15%] left-[-10%] w-[45%] h-[45%] blur-[140px] rounded-full opacity-30 pointer-events-none bg-gradient-to-br ${accentColor}`} />
                <div className="relative z-10 m-auto w-full max-w-md px-4 py-8 animate-fade-in-up">
                    <button onClick={() => { setView('login'); setError(null); }}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </button>

                    <div className="glass-nmims p-8 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 bg-gradient-to-br ${accentColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                <Mail className="h-8 w-8 text-foreground" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                            <p className="text-muted-foreground text-sm mt-1">
                                Enter your admin email and we'll send a reset link
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Admin Email</label>
                                <input
                                    type="email"
                                    className="input-nmims"
                                    placeholder="your-email@nmims.edu.in"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 rounded-xl font-semibold text-foreground bg-gradient-to-r ${accentColor} hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60`}
                            >
                                {isLoading
                                    ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <><Mail className="w-4 h-4" /> Send Reset Link</>
                                }
                            </button>
                        </form>

                        <p className="text-center text-xs text-muted-foreground mt-5">
                            Campus2Career · NMIMS Placement System
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Login form ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden">
            <div className={`absolute top-[-15%] left-[-10%] w-[45%] h-[45%] blur-[140px] rounded-full opacity-30 pointer-events-none bg-gradient-to-br ${accentColor}`} />
            <div className={`absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full opacity-20 pointer-events-none bg-gradient-to-br ${accentColor}`} />

            <div className="relative z-10 m-auto w-full max-w-md px-4 py-8 animate-fade-in-up">

                <button onClick={() => navigate('/portal')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    All portals
                </button>

                <div className="glass-nmims p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${accentColor} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                            <Icon className="h-8 w-8 text-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">{roleLabel} Portal</h1>
                        <p className="text-muted-foreground text-sm mt-1">{description}</p>
                    </div>

                    {/* Quick Preview */}
                    <button
                        type="button"
                        onClick={handlePreview}
                        className={`w-full mb-5 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border-2 ${accentBorder} ${accentText} ${accentBg} hover:opacity-80 transition-opacity`}
                    >
                        <Zap className="w-4 h-4" />
                        Preview as {roleLabel} (No Login Required)
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">or sign in with credentials</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Demo hint */}
                    <div className={`mb-4 p-3 rounded-xl ${accentBg} border ${accentBorder} flex items-center justify-between`}>
                        <div>
                            <p className="text-xs font-semibold text-foreground">Demo Credentials</p>
                            <p className="text-xs text-muted-foreground font-mono">{demoEmail} / {demoPassword}</p>
                        </div>
                        <button type="button" onClick={fillDemo}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${accentBg} ${accentText} border ${accentBorder} hover:opacity-80`}>
                            Fill
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5">Email</label>
                            <input type="email" className="input-nmims" placeholder={demoEmail}
                                value={email} onChange={e => setEmail(e.target.value)}
                                disabled={isLoading} required />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-semibold">Password</label>
                                <button
                                    type="button"
                                    onClick={() => { setResetEmail(email); setView('forgot'); setError(null); }}
                                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} className="input-nmims pr-10"
                                    placeholder="••••••••" value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    disabled={isLoading} required />
                                <button type="button" tabIndex={-1}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading}
                            className={`w-full py-3 rounded-xl font-semibold text-foreground bg-gradient-to-r ${accentColor} hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60`}>
                            {isLoading
                                ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><Icon className="w-4 h-4" /> Sign in</>
                            }
                        </button>
                    </form>

                    <p className="text-center text-xs text-muted-foreground mt-5">
                        Campus2Career · NMIMS Placement System
                    </p>
                </div>
            </div>
        </div>
    );
};
