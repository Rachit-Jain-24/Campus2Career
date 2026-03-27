import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight, LogOut, ChevronDown } from 'lucide-react';
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
    const [notifOpen, setNotifOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Close menus on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

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

    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const notifications = [
        { id: 1, msg: 'New student batch data uploaded', time: '5m ago', type: 'info' },
        { id: 2, msg: 'Placement drive scheduled for next week', time: '2h ago', type: 'success' },
        { id: 3, msg: 'Audit log: Admin login detected', time: '3h ago', type: 'warning' },
    ];

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/90 backdrop-blur-md px-4 md:px-6">

            {/* Mobile menu toggle */}
            <button
                onClick={onMobileMenuToggle}
                className="rounded-lg p-2 hover:bg-secondary lg:hidden"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-2 text-sm font-medium animate-slide-in-left">
                <span className="text-muted-foreground">Admin</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-semibold">{currentNav?.label || 'Dashboard'}</span>
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="search"
                    placeholder="Search students, companies..."
                    className="h-9 w-64 rounded-lg border border-input bg-secondary/60 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                />
            </div>

            {/* Notifications */}
            <div className="relative" ref={userMenuRef}>
                <button
                    onClick={() => { setNotifOpen(!notifOpen); setShowDropdown(false); }}
                    className="relative rounded-full p-2 hover:bg-secondary transition-colors"
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                </button>

                {notifOpen && (
                    <div className="absolute right-0 top-12 w-80 rounded-xl border bg-card shadow-xl z-50 overflow-hidden">
                        <div className="border-b px-4 py-3">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                        </div>
                        <div className="divide-y">
                            {notifications.map(n => (
                                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === 'info' ? 'bg-blue-500' : n.type === 'success' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    <div>
                                        <p className="text-sm">{n.msg}</p>
                                        <p className="text-xs text-muted-foreground">{n.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t px-4 py-2">
                            <button className="text-xs text-primary hover:underline">View all notifications</button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Menu */}
            <div className="relative">
                <button
                    onClick={() => { setShowDropdown(!showDropdown); setNotifOpen(false); }}
                    className="flex items-center gap-3 rounded-xl border bg-secondary/50 px-3 py-1.5 cursor-pointer hover:bg-secondary transition-colors"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-foreground text-sm font-bold overflow-hidden">
                        {photoURL ? (
                            <img src={photoURL} alt="Admin" className="w-full h-full object-cover" />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold leading-none">{userName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{userRole}</p>
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-30"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 top-12 w-52 rounded-xl border bg-card shadow-xl z-50 overflow-hidden">
                            <div className="border-b px-4 py-3">
                                <p className="text-sm font-semibold truncate">{userName}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};
