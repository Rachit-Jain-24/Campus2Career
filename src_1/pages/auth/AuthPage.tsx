import { useState, useCallback } from 'react';
import nmimsLogo from '../../assets/logo.png';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    User, Lock, Eye, EyeOff, Mail, Hash, Building2, Calendar, 
    CheckCircle, Shield, GraduationCap, Users, AlertCircle, 
    CheckCircle2, UserCircle, ChevronDown, Briefcase
} from 'lucide-react';
import { getDefaultAdminRoute } from '../../config/admin/roleRoutes';

// Admin roles configuration
const ADMIN_ROLES = [
    { id: 'system_admin', label: 'System Admin', icon: Shield, color: '#8B1A1A' },
    { id: 'dean', label: 'Dean', icon: GraduationCap, color: '#1e40af' },
    { id: 'director', label: 'Director', icon: Briefcase, color: '#047857' },
    { id: 'program_chair', label: 'Program Chair', icon: Users, color: '#7c3aed' },
    { id: 'faculty', label: 'Faculty', icon: UserCircle, color: '#c2410c' },
    { id: 'placement_officer', label: 'Placement Officer', icon: Briefcase, color: '#0891b2' },
];

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

// Form validation
interface SignupFormData {
    name: string;
    rollNo: string;
    sapId: string;
    email: string;
    branch: string;
    currentYear: string;
    password: string;
}

type FieldErrors = Partial<Record<keyof SignupFormData, string>>;

function validateField(field: keyof SignupFormData, value: string): string {
    switch (field) {
        case 'name': {
            if (!value.trim()) return 'Full name is required.';
            if (value.trim().length < 2) return 'Name must be at least 2 characters.';
            if (!/^[a-zA-Z\s.'`-]+$/.test(value.trim()))
                return 'Name can only contain letters, spaces, hyphens, apostrophes, and dots.';
            return '';
        }
        case 'rollNo': {
            if (!value.trim()) return 'Roll number is required.';
            if (!/^[a-zA-Z0-9-]+$/.test(value.trim()))
                return 'Roll number can only contain letters, numbers, and hyphens.';
            return '';
        }
        case 'sapId': {
            if (!value.trim()) return 'SAP ID is required.';
            if (!/^\d{9,11}$/.test(value.trim()))
                return 'SAP ID must be 9-11 digits.';
            return '';
        }
        case 'email': {
            if (!value.trim()) return 'Email is required.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
                return 'Enter a valid email address.';
            return '';
        }
        case 'branch':
            return value ? '' : 'Please select your branch.';
        case 'currentYear':
            return value ? '' : 'Please select your year.';
        case 'password': {
            if (!value) return 'Password is required.';
            if (value.length < 8) return 'Password must be at least 8 characters.';
            if (!/[A-Za-z]/.test(value)) return 'Password must contain at least one letter.';
            if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
            return '';
        }
        default:
            return '';
    }
}

function validateAll(data: SignupFormData): FieldErrors {
    const errors: FieldErrors = {};
    (Object.keys(data) as (keyof SignupFormData)[]).forEach(field => {
        const msg = validateField(field, data[field]);
        if (msg) errors[field] = msg;
    });
    return errors;
}

export default function AuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, adminLogin, signup, isLoading: authLoading } = useAuth();
    
    // Mode: 'login-student' | 'signup-student' | 'login-admin'
    const [mode, setMode] = useState<'login-student' | 'signup-student' | 'login-admin'>('login-student');
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    
    // Login form state
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState(ADMIN_ROLES[0]);
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Signup form state
    const [formData, setFormData] = useState<SignupFormData>({
        name: '', rollNo: '', sapId: '', email: '',
        branch: '', currentYear: '', password: ''
    });
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [signupError, setSignupError] = useState('');
    
    const justRegistered = location.state?.registered === true;

    // Handle login (both student and admin)
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsLoading(true);
        
        try {
            if (mode === 'login-admin') {
                // Admin login with role
                await adminLogin(loginIdentifier, loginPassword);
                const stored = localStorage.getItem('c2c_user');
                if (stored) {
                    const u = JSON.parse(stored);
                    navigate(getDefaultAdminRoute(u.role));
                }
            } else {
                // Student login
                await login(loginIdentifier, loginPassword);
                const stored = localStorage.getItem('c2c_user');
                if (stored) {
                    const u = JSON.parse(stored);
                    if (!u.careerDiscoveryCompleted) {
                        navigate('/career-discovery');
                    } else if (!u.profileCompleted) {
                        navigate('/student/profile-setup');
                    } else if (!u.assessmentCompleted) {
                        navigate('/student/assessment');
                    } else {
                        navigate('/student/dashboard');
                    }
                }
            }
        } catch (err: any) {
            setLoginError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle signup
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError('');
        
        const errors = validateAll(formData);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        
        setIsLoading(true);
        try {
            await signup({
                fullName: formData.name,
                name: formData.name,
                rollNo: formData.rollNo,
                sapId: formData.sapId,
                email: formData.email,
                branch: formData.branch,
                program: formData.branch,
                currentYear: formData.currentYear,
                password: formData.password
            });
            navigate('/auth', { state: { registered: true } });
            setMode('login-student');
        } catch (err: any) {
            setSignupError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const updateField = useCallback((field: keyof SignupFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        const error = validateField(field, value);
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    // Render mode selector tabs
    const renderModeSelector = () => (
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
                type="button"
                onClick={() => setMode('login-student')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login-student' 
                        ? 'bg-white text-[#8B1A1A] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Student Login
            </button>
            <button
                type="button"
                onClick={() => setMode('signup-student')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    mode === 'signup-student' 
                        ? 'bg-white text-[#8B1A1A] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                New Student
            </button>
            <button
                type="button"
                onClick={() => setMode('login-admin')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login-admin' 
                        ? 'bg-white text-[#8B1A1A] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Staff/Admin
            </button>
        </div>
    );

    // Render login form (shared for student and admin)
    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="space-y-5">
            {mode === 'login-admin' && (
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Select Role
                    </label>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <selectedRole.icon className="h-4 w-4" style={{ color: selectedRole.color }} />
                                <span className="text-slate-900">{selectedRole.label}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                        {showRoleDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg">
                                {ADMIN_ROLES.map(role => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setShowRoleDropdown(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <role.icon className="h-4 w-4" style={{ color: role.color }} />
                                        <span className="text-slate-700">{role.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {mode === 'login-admin' ? 'Email Address' : 'Email or SAP ID'}
                </label>
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="h-[18px] w-[18px]" />
                    </div>
                    <input
                        type="text"
                        placeholder={mode === 'login-admin' ? 'admin@nmims.edu.in' : 'email@nmims.edu.in or SAP ID'}
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] transition-all text-slate-900 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="h-[18px] w-[18px]" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
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

            {loginError && (
                <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                </div>
            )}

            {justRegistered && (
                <div className="flex items-start gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Account created successfully! Please sign in.</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#8B1A1A] hover:bg-[#7a1616] active:bg-[#660000] text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-[#8B1A1A]/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                    </span>
                ) : 'Sign In'}
            </button>
        </form>
    );

    // Render signup form
    const renderSignupForm = () => (
        <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <UserCircle className="h-[18px] w-[18px]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={e => updateField('name', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400 ${
                            fieldErrors.name ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]'
                        }`}
                    />
                </div>
                {fieldErrors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.name}</p>}
            </div>

            {/* Roll No & SAP ID */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Roll No</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="e.g. 22CSDS001"
                            value={formData.rollNo}
                            onChange={e => updateField('rollNo', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400 ${
                                fieldErrors.rollNo ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]'
                            }`}
                        />
                    </div>
                    {fieldErrors.rollNo && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.rollNo}</p>}
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">SAP ID</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="9-11 digits"
                            value={formData.sapId}
                            onChange={e => updateField('sapId', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400 ${
                                fieldErrors.sapId ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]'
                            }`}
                        />
                    </div>
                    {fieldErrors.sapId && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.sapId}</p>}
                </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Email</label>
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="h-[18px] w-[18px]" />
                    </div>
                    <input
                        type="email"
                        placeholder="yourname@nmims.edu.in"
                        value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400 ${
                            fieldErrors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]'
                        }`}
                    />
                </div>
                {fieldErrors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.email}</p>}
            </div>

            {/* Branch & Year */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Branch</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={formData.branch}
                            onChange={e => updateField('branch', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                                fieldErrors.branch ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]'
                            }`}
                        >
                            <option value="">Select</option>
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    {fieldErrors.branch && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.branch}</p>}
                </div>
                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Year</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            value={formData.currentYear}
                            onChange={e => updateField('currentYear', e.target.value)}
                            className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-900 ${
                                fieldErrors.currentYear ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]'
                            }`}
                        >
                            <option value="">Select</option>
                            {years.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                        </select>
                    </div>
                    {fieldErrors.currentYear && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.currentYear}</p>}
                </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="h-[18px] w-[18px]" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 chars, with letter & number"
                        value={formData.password}
                        onChange={e => updateField('password', e.target.value)}
                        className={`w-full pl-10 pr-11 py-2.5 text-sm border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-slate-900 placeholder:text-slate-400 ${
                            fieldErrors.password ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-slate-200 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]'
                        }`}
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
                {fieldErrors.password && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {fieldErrors.password}</p>}
            </div>

            {signupError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{signupError}</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#8B1A1A] hover:bg-[#7a1616] active:bg-[#660000] text-white font-bold rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-[#8B1A1A]/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                    </span>
                ) : 'Create Account'}
            </button>
        </form>
    );

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans">
            {/* Left Branding Panel */}
            <div className="relative lg:w-[45%] bg-gradient-to-br from-[#8B1A1A] via-[#7a1616] to-[#5a0f0f] flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="bg-white rounded-xl px-3 py-2 shadow-xl flex items-center justify-center w-fit">
                        <img src={nmimsLogo} alt="NMIMS Logo" className="h-10 w-auto object-contain" />
                    </div>
                    <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mt-2">Hyderabad Campus</p>
                </div>

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

                    <div className="mt-8 flex flex-wrap gap-2">
                        {['Placement Tracking', 'AI Insights', 'Career Roadmap', 'LeetCode Analytics'].map(f => (
                            <span key={f} className="text-[11px] font-bold bg-white/10 border border-white/15 px-3 py-1 rounded-full">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 border-t border-white/10 pt-6">
                    <p className="text-white/50 text-xs font-medium italic leading-relaxed">
                        "The best way to predict your future is to create it."
                    </p>
                    <p className="text-white/30 text-xs font-bold mt-1 uppercase tracking-widest">— NMIMS Hyderabad, 2026</p>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col justify-center bg-white px-6 py-12 sm:px-12 xl:px-20">
                <div className="w-full max-w-md mx-auto">
                    {/* Mobile Logo */}
                    <div className="flex lg:hidden items-center gap-3 mb-10 bg-white border border-slate-200 rounded-xl px-4 py-2 w-fit shadow-sm">
                        <img src={nmimsLogo} alt="NMIMS Logo" className="h-8 w-auto object-contain" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hyderabad</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {mode === 'login-student' && 'Welcome back'}
                            {mode === 'signup-student' && 'Create Account'}
                            {mode === 'login-admin' && 'Staff Login'}
                        </h2>
                        <p className="text-slate-500 mt-1.5 text-sm">
                            {mode === 'login-student' && 'Sign in to access your student portal'}
                            {mode === 'signup-student' && 'Register to start your career journey'}
                            {mode === 'login-admin' && 'Sign in to access admin portal'}
                        </p>
                    </div>

                    {/* Mode Selector */}
                    {renderModeSelector()}

                    {/* Form */}
                    {mode === 'signup-student' ? renderSignupForm() : renderLoginForm()}

                    {/* Footer */}
                    <p className="mt-8 text-center text-[11px] text-slate-400 font-medium">
                        NMIMS Hyderabad • Campus2Career • 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
