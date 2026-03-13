import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
    variant?: 'default' | 'ghost';
}

export function LogoutButton({ variant = 'default' }: LogoutButtonProps) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setLoading(false);
        }
    };

    if (variant === 'ghost') {
        return (
            <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold disabled:opacity-50"
                title="Sign out"
            >
                <LogOut className="h-4 w-4" />
                {loading ? 'Signing out...' : 'Sign Out'}
            </button>
        );
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-transparent hover:border-red-100 transition-all text-sm font-semibold disabled:opacity-50"
            title="Sign out"
        >
            <LogOut className="h-4 w-4" />
            {loading ? 'Signing out...' : 'Sign Out'}
        </button>
    );
}
