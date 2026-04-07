import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';

export default function SwitchAccount() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isAdmin = user?.role && user.role !== 'student';

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                        isAdmin ? 'bg-gradient-to-br from-primary to-blue-600' : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                        {isAdmin ? (
                            <Shield className="h-10 w-10 text-white" />
                        ) : (
                            <User className="h-10 w-10 text-white" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Currently Logged In</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        You're logged in as {isAdmin ? 'an admin' : 'a student'}
                    </p>
                </div>

                {/* User Info */}
                <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="font-semibold">{user?.name || 'User'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-semibold text-sm">{user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Role</p>
                            <p className="font-semibold capitalize">
                                {user?.role?.replace('_', ' ') || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard')}
                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                    >
                        Go to Dashboard
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition-all border border-red-200"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out & Switch Account
                    </button>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-800">
                        <strong>Note:</strong> To switch between admin and student accounts, you need to sign out first.
                    </p>
                </div>
            </div>
        </div>
    );
}
