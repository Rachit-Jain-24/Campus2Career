import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDefaultAdminRoute } from '../../config/admin/roleRoutes';

export const AdminLogin: React.FC = () => {
    const { adminLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        try {
            await adminLogin(email, password);
            // Read user from localStorage since adminLogin stores it there
            const storedUser = localStorage.getItem('c2c_user');
            const parsed = storedUser ? JSON.parse(storedUser) : null;
            const route = getDefaultAdminRoute(parsed?.role);
            navigate(route, { replace: true });
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-foreground bg-background relative overflow-hidden">

            {/* Ambient Backgound Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply opacity-50 animate-float pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-multiply opacity-50 pointer-events-none"></div>

            <div className="relative z-10 m-auto w-full max-w-md p-6 sm:p-8 animate-fade-in-up">
                <div className="glass-nmims p-8 sm:p-10 shadow-2xl relative overflow-hidden">

                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-gradient-nmims rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                            <GraduationCap className="h-8 w-8 text-white -rotate-3" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Portal</h1>
                        <p className="text-muted-foreground text-sm">Secure access for Placement Operations</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 animate-fade-in-up">
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive leading-tight">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Staff Email</label>
                            <input
                                type="email"
                                className="input-nmims"
                                placeholder="admin@nmims.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Secret Key</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-nmims pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`btn-nmims-primary w-full text-lg py-3 mt-4 flex items-center justify-center ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Authenticate'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
