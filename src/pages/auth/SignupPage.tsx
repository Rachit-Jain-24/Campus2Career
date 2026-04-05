import { useState, useCallback } from 'react';
import nmimsLogo from '../../assets/logo.png';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, Eye, EyeOff, Mail, Hash, Building2, Calendar, UserCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

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

interface FormData {
    name: string;
    rollNo: string;
    sapId: string;
    email: string;
    branch: string;
    currentYear: string;
    password: string;
}

type FieldErrors = Partial<Record<keyof FormData, string>>;

function validateField(field: keyof FormData, value: string): string {
    switch (field) {
        case 'name': {
            if (!value.trim()) return 'Full name is required.';
            if (value.trim().length < 2) return 'Name must be at least 2 characters.';
            if (value.trim().length > 80) return 'Name must be under 80 characters.';
            if (!/^[a-zA-Z\s.'`-]+$/.test(value.trim()))
                return 'Name can only contain letters, spaces, hyphens, apostrophes, and dots.';
            return '';
        }
        case 'rollNo': {
            if (!value.trim()) return 'Roll number is required.';
            if (!/^[a-zA-Z0-9-]+$/.test(value.trim()))
                return 'Roll number can only contain letters, numbers, and hyphens.';
            if (value.trim().length > 20) return 'Roll number is too long.';
            return '';
        }
        case 'sapId': {
            if (!value.trim()) return 'SAP ID is required.';
            if (!/^\d{9,11}$/.test(value.trim()))
                return 'SAP ID must be 9–11 digits (numbers only).';
            return '';
        }
        case 'email': {
            if (!value.trim()) return 'Email is required.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
                return 'Enter a valid email address.';
            if (!value.trim().endsWith('@nmims.edu.in') && !value.trim().endsWith('@nmims.in'))
                return 'Use your official NMIMS email (@nmims.edu.in or @nmims.in).';
            return '';
        }
        case 'branch':
            return value ? '' : 'Please select your branch.';
        case 'currentYear':
            return value ? '' : 'Please select your year.';
        case 'password': {
            if (!value) return 'Password is required.';
            if (value.length < 8) return 'Password must be at least 8 characters.';
            if (value.length > 128) return 'Password is too long.';
            if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter.';
            if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
            return '';
        }
        default:
            return '';
    }
}

function validateAll(data: FormData): FieldErrors {
    const errors: FieldErrors = {};
    (Object.keys(data) as (keyof FormData)[]).forEach(field => {
        const msg = validateField(field, data[field]);
        if (msg) errors[field] = msg;
    });
    return errors;
}

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        name: '', rollNo: '', sapId: '', email: '',
        branch: '', currentYear: '', password: '',
    });
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const set = useCallback((field: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const value = e.target.value;
            setFormData(prev => ({ ...prev, [field]: value }));
            const msg = validateField(field, value);
            setFieldErrors(prev => ({ ...prev, [field]: msg }));
        }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const errors = validateAll(formData);
        setFieldErrors(errors);
        if (Object.values(errors).some(Boolean)) return;

        setIsLoading(true);
        try {
            await signup({
                fullName: formData.name,
                rollNo: formData.rollNo,
                sapId: formData.sapId,
                email: formData.email,
                branch: formData.branch,
                currentYear: formData.currentYear,
                password: formData.password,
            });
            navigate('/career-discovery');
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all text-slate-900 placeholder:text-slate-400";
    const labelClass = "block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide";
    const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none";

    return (
        <div className="min-h-screen flex">
            {/* ─── Left Panel ─── */}
            <div className="hidden lg:flex lg:w-[42%] xl:w-[38%] flex-col justify-between bg-[#8B1A1A] px-12 py-14 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20">
                        <img src={nmimsLogo} alt="NMIMS" className="h-10 w-auto object-contain" />
                    </div>
                    <div>
                        <p className="text-white font-black text-lg tracking-tight leading-none">NMIMS</p>
                        <p className="text-white/60 text-xs font-semibold tracking-widest uppercase">Hyderabad</p>
                    </div>
                </div>

                {/* Main copy */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h1 className="text-4xl font-black text-white leading-tight mb-3">
                            Your career journey<br />starts here.
                        </h1>
                        <p className="text-white/70 text-sm leading-relaxed">
                            Create your Campus2Career account to access career tracking, AI-driven insights, and personalized guidance.
                        </p>
                    </div>

                    <div className="space-y-3">
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
                                <input id="fullName" type="text" placeholder="e.g. Rachit Jain"
                                    value={formData.name} onChange={set('name')} required className={inputClass} />
                            </div>
                            {fieldErrors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.name}</p>}
                        </div>

                        {/* Roll No + SAP ID */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Roll No</label>
                                <div className="relative">
                                    <Hash className={iconClass} />
                                    <input id="rollNo" type="text" placeholder="e.g. A001"
                                        value={formData.rollNo} onChange={set('rollNo')} required className={inputClass} />
                                </div>
                                {fieldErrors.rollNo && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.rollNo}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>SAP ID</label>
                                <div className="relative">
                                    <User className={iconClass} />
                                    <input id="sapId" type="text" placeholder="700XXXXXXX"
                                        value={formData.sapId} onChange={set('sapId')} required className={inputClass} />
                                </div>
                                {fieldErrors.sapId && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.sapId}</p>}
                            </div>
                        </div>

                        {/* College Email */}
                        <div>
                            <label className={labelClass}>College Email</label>
                            <div className="relative">
                                <Mail className={iconClass} />
                                <input id="email" type="email" placeholder="yourname@nmims.edu.in"
                                    value={formData.email} onChange={set('email')} required className={inputClass} />
                            </div>
                            {fieldErrors.email
                                ? <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.email}</p>
                                : <p className="mt-1.5 text-[11px] text-slate-400 ml-1">Use your official NMIMS email — <span className="font-semibold">@nmims.edu.in</span> or <span className="font-semibold">@nmims.in</span></p>
                            }
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
                                {fieldErrors.branch && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.branch}</p>}
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
                                {fieldErrors.currentYear && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.currentYear}</p>}
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className={labelClass}>Password</label>
                            <div className="relative">
                                <Lock className={iconClass} />
                                <input id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password (min. 8 chars)"
                                    value={formData.password} onChange={set('password')}
                                    required minLength={8} className={`${inputClass} pr-11`} />
                                <button type="button" tabIndex={-1}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.password}</p>}
                        </div>

                        {/* Global error */}
                        {error && (
                            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0" />{error}
                            </div>
                        )}

                        {/* Submit */}
                        <button id="registerBtn" type="submit" disabled={isLoading}
                            className="w-full py-3.5 bg-[#8B1A1A] hover:bg-[#7a1616] active:bg-[#660000] text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-[#8B1A1A]/25 disabled:opacity-60 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> Create Account
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-semibold">Already registered?</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    <Link to="/login"
                        className="flex items-center justify-center w-full py-3.5 border-2 border-[#8B1A1A] text-[#8B1A1A] font-bold rounded-xl text-sm tracking-wide hover:bg-[#8B1A1A]/5 transition-all">
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
