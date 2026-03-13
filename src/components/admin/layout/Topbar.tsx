import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight, UserCircle, LogOut, ChevronDown } from 'lucide-react';
import { ADMIN_NAVIGATION } from '../../../config/admin/navigation';
import { useAuth } from '../../../contexts/AuthContext';

interface TopbarProps {
    onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Find current active route for breadcrumbs
    const currentNav = ADMIN_NAVIGATION.find(item => location.pathname.startsWith(item.path));

    // Handle missing photoURL type on mock User object gracefully
    const photoURL = user?.photoURL || null;

    // Formatting based on role
    const userName = user?.name || 'Admin User';
    const rawRole = user?.role as string | undefined;
    const userRole = rawRole === 'system_admin' ? 'System Administrator' :
        rawRole ? rawRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
            'Admin';

    return (
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 transition-all duration-300">

            {/* Left side: Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <nav className="hidden sm:flex items-center gap-2 text-sm font-medium animate-slide-in-left">
                    <span className="text-muted-foreground">Admin</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{currentNav?.label || 'Dashboard'}</span>
                </nav>
            </div>

            {/* Right side: Search, Notifications, Profile */}
            <div className="flex items-center gap-3 sm:gap-6">

                {/* Optional Search Placeholder */}
                <div className="hidden md:flex relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search students, companies..."
                        className="input-nmims py-2 pl-9 pr-4 w-64 bg-secondary/50 focus:bg-background h-10 border-transparent focus:border-ring rounded-xl text-sm"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-card"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <div 
                        className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border cursor-pointer hover:bg-secondary/50 p-1.5 pr-3 rounded-full transition-colors"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm">
                            {photoURL ? (
                                <img src={photoURL} alt="Admin" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle className="w-8 h-8 text-primary/80" />
                            )}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-foreground leading-none">{userName}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-none">{userRole}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    </div>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <>
                            <div 
                                className="fixed inset-0 z-30" 
                                onClick={() => setShowDropdown(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border z-40 overflow-hidden">
                                <div className="p-3 border-b border-border">
                                    <p className="text-sm font-semibold text-foreground">{userName}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </header>
    );
};
