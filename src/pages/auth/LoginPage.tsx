import { useState } from 'react';
import nmimsLogo from '../../assets/logo.png';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function LoginPage() {
    const [sapId, setSapId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const justRegistered = location.state?.registered === true;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(sapId, password);
            navigate('/onboarding');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans">

            {/* ─── Left Branding Panel ─── */}
            <div className="relative lg:w-[45%] bg-gradient-to-br from-[#8B1A1A] via-[#7a1616] to-[#5a0f0f] flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">

                {/* Background decorative circles */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />
                <div className="absolute top-1/2 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/2 pointer-events-none" />

                {/* Logo & Name */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white rounded-xl px-3 py-2 shadow-xl flex items-center justify-center">
                            <img src={nmimsLogo} alt="NMIMS Logo" className="h-10 w-auto object-contain" />
                        </div>
                    </div>
                    <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mt-2">Hyderabad Campus</p>
                </div>

                {/* Center Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                    <div className="mb-2 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold tracking-wide">Campus2Career Portal — Live</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black leading-tight mt-4 mb-4">
                        Virtual<br />
                        <span className="text-white/40">Placement</span><br />
                        Assistant
                    </h1>

                    <p className="text-white/70 font-medium text-sm sm:text-base leading-relaxed max-w-xs">
                        Your intelligent academic and career companion — built exclusively for NMIMS Hyderabad students.
                    </p>

                    {/* Feature pills */}
                    <div className="mt-8 flex flex-wrap gap-2">
                        {['Placement Tracking', 'AI Insights', 'Career Roadmap', 'LeetCode Analytics'].map(f => (
                            <span key={f} className="text-[11px] font-bold bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Quote */}
                <div className="relative z-10 border-t border-white/10 pt-6">
                    <p className="text-white/50 text-xs font-medium italic leading-relaxed">
                        "The best way to predict your future is to create it."
                    </p>
                    <p className="text-white/30 text-xs font-bold mt-1 uppercase tracking-widest">— NMIMS Hyderabad, 2026</p>
                </div>
            </div>

            {/* ─── Right Form Panel ─── */}
            <div className="flex-1 flex flex-col justify-center bg-white px-6 py-12 sm:px-12 xl:px-20">
                <div className="w-full max-w-md mx-auto">

                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-10 bg-white border border-slate-200 rounded-xl px-4 py-2 w-fit shadow-sm">
                        <img src={nmimsLogo} alt="NMIMS Logo" className="h-8 w-auto object-contain" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hyderabad</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Sign in with your SAP ID to access the portal</p>
                    </div>

                    {/* Success Banner */}
                    {justRegistered && (
                        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>Account created successfully! Please sign in with your SAP ID and password.</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* SAP ID */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">SAP ID</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                                </div>
                                <input
                                    id="sapId"
                                    type="text"
                                    placeholder="e.g. 70572200036"
                                    value={sapId}
                                    onChange={e => setSapId(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="h-[18px] w-[18px]" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-11 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all text-slate-900 placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            id="loginBtn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-[#8B1A1A] hover:bg-[#7a1616] active:bg-[#660000] text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-[#8B1A1A]/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-7 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-semibold">New to Campus2Career?</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Register CTA */}
                    <Link
                        to="/signup"
                        className="flex items-center justify-center w-full py-3.5 border-2 border-[#8B1A1A] text-[#8B1A1A] font-bold rounded-xl text-sm tracking-wide hover:bg-[#8B1A1A]/5 transition-all"
                    >
                        Create an Account
                    </Link>

                    {/* Footer */}
                    <p className="mt-10 text-center text-[11px] text-slate-400 font-medium">
                        NMIMS Hyderabad • Campus2Career • 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
