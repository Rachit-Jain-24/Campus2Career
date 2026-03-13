import { useState } from 'react';
import nmimsLogo from '../../assets/logo.png';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, Eye, EyeOff, Mail, Hash, Building2, Calendar, UserCircle } from 'lucide-react';

const branches = [
    "MBATech CSE", "MBATech IT",
    "B.Tech CSE", "B.Tech IT", "B.Tech CSBS", "B.Tech CSDS", "B.Tech AIML"
];

const years = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
    { value: '5', label: '5th Year' },
];

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '', rollNo: '', sapId: '', email: '',
        branch: '', currentYear: '', password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { signup, isLoading } = useAuth();
    const navigate = useNavigate();

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFormData(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // Basic email domain validation
        if (!formData.email.endsWith('@nmims.edu.in') && !formData.email.endsWith('@nmims.in')) {
            setError('Please use your official NMIMS email address (@nmims.edu.in or @nmims.in).');
            return;
        }
        try {
            await signup(formData);
            navigate('/login', { state: { registered: true } });
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all text-slate-900 placeholder:text-slate-400";
    const labelClass = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5";
    const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-[18px] w-[18px]";

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans">

            {/* ─── Left Branding Panel ─── */}
            <div className="relative lg:w-[40%] bg-gradient-to-br from-[#8B1A1A] via-[#7a1616] to-[#5a0f0f] flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">

                {/* Background circles */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex flex-col gap-1">
                        <div className="bg-white rounded-xl px-3 py-2 shadow-xl flex items-center justify-center w-fit">
                            <img src={nmimsLogo} alt="NMIMS Logo" className="h-10 w-auto object-contain" />
                        </div>
                        <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mt-1">Hyderabad Campus</p>
                    </div>
                </div>

                {/* Centre Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
                    <div className="mb-2 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold tracking-wide">Student Registration</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black leading-tight mt-4 mb-4">
                        Build Your<br />
                        <span className="text-white/40">Academic</span><br />
                        Profile
                    </h1>

                    <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xs">
                        Create your Campus2Career account to access career tracking, AI-driven insights, and personalized guidance.
                    </p>

                    {/* Steps */}
                    <div className="mt-8 space-y-3">
                        {[
                            { n: '01', label: 'Fill your academic details' },
                            { n: '02', label: 'Use your official NMIMS email' },
                            { n: '03', label: 'Sign in and complete onboarding' },
                        ].map(s => (
                            <div key={s.n} className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-[#8B1A1A] bg-white/90 px-2 py-0.5 rounded-md">{s.n}</span>
                                <span className="text-white/70 text-xs font-medium">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 border-t border-white/10 pt-6">
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                        NMIMS Hyderabad • Campus2Career 2026
                    </p>
                </div>
            </div>

            {/* ─── Right Form Panel ─── */}
            <div className="flex-1 flex flex-col justify-center bg-white px-6 py-10 sm:px-12 xl:px-16 overflow-y-auto">
                <div className="w-full max-w-lg mx-auto">

                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-8 bg-white border border-slate-200 rounded-xl px-4 py-2 w-fit shadow-sm">
                        <img src={nmimsLogo} alt="NMIMS Logo" className="h-8 w-auto object-contain" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hyderabad</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-7">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Provide your academic details to register</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Full Name */}
                        <div>
                            <label className={labelClass}>Full Name</label>
                            <div className="relative">
                                <UserCircle className={iconClass} />
                                <input id="fullName" type="text" placeholder="e.g. Rachit Jain" value={formData.name} onChange={set('name')} required className={inputClass} />
                            </div>
                        </div>

                        {/* Roll No + SAP ID */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Roll No</label>
                                <div className="relative">
                                    <Hash className={iconClass} />
                                    <input id="rollNo" type="text" placeholder="e.g. A001" value={formData.rollNo} onChange={set('rollNo')} required className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>SAP ID</label>
                                <div className="relative">
                                    <User className={iconClass} />
                                    <input id="sapId" type="text" placeholder="700XXXXXXX" value={formData.sapId} onChange={set('sapId')} required className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* College Email */}
                        <div>
                            <label className={labelClass}>College Email</label>
                            <div className="relative">
                                <Mail className={iconClass} />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="yourname@nmims.edu.in"
                                    value={formData.email}
                                    onChange={set('email')}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate-400 ml-1">
                                Use your official NMIMS email — <span className="font-semibold">@nmims.edu.in</span> or <span className="font-semibold">@nmims.in</span>
                            </p>
                        </div>

                        {/* Branch + Year */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Branch</label>
                                <div className="relative">
                                    <Building2 className={iconClass} />
                                    <select id="branch" value={formData.branch} onChange={set('branch')} required
                                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all text-slate-900 appearance-none cursor-pointer">
                                        <option value="" disabled>Select branch</option>
                                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Year</label>
                                <div className="relative">
                                    <Calendar className={iconClass} />
                                    <select id="year" value={formData.currentYear} onChange={set('currentYear')} required
                                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all text-slate-900 appearance-none cursor-pointer">
                                        <option value="" disabled>Select year</option>
                                        {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className={labelClass}>Password</label>
                            <div className="relative">
                                <Lock className={iconClass} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password (min. 6 chars)"
                                    value={formData.password}
                                    onChange={set('password')}
                                    required
                                    minLength={6}
                                    className={`${inputClass} pr-11`}
                                />
                                <button type="button" tabIndex={-1}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
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
                            id="registerBtn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-[#8B1A1A] hover:bg-[#7a1616] active:bg-[#660000] text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-[#8B1A1A]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-semibold">Already registered?</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <Link
                        to="/login"
                        className="flex items-center justify-center w-full py-3.5 border-2 border-[#8B1A1A] text-[#8B1A1A] font-bold rounded-xl text-sm tracking-wide hover:bg-[#8B1A1A]/5 transition-all"
                    >
                        Sign In Instead
                    </Link>

                    <p className="mt-8 text-center text-[11px] text-slate-400 font-medium">
                        NMIMS Hyderabad • Campus2Career • 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
