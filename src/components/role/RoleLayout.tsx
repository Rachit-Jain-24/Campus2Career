import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    GraduationCap, LogOut, ChevronLeft, Menu, Bell,
    ChevronDown, ChevronRight, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { RoleNavItem } from '../../config/roles/roleNavigation';

interface RoleLayoutProps {
    navItems: RoleNavItem[];
    portalTitle: string;
    accentColor?: string;
    loginPath: string;
}

const roleColorMap: Record<string, string> = {
    dean: 'bg-violet-100 text-violet-700',
    director: 'bg-slate-100 text-slate-700',
    program_chair: 'bg-indigo-100 text-indigo-700',
    faculty: 'bg-teal-100 text-teal-700',
    placement_officer: 'bg-orange-100 text-orange-700',
    system_admin: 'bg-red-100 text-red-700',
};

const notifications = [
    { id: 1, msg: 'New student batch data uploaded', time: '5m ago', type: 'info' },
    { id: 2, msg: 'Placement drive scheduled for next week', time: '2h ago', type: 'success' },
    { id: 3, msg: 'Eligibility rules update pending review', time: '3h ago', type: 'warning' },
];

export const RoleLayout: React.FC<RoleLayoutProps> = ({
    navItems,
    portalTitle,
    loginPath,
}) => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Force navigate regardless of intermediate state issues
            navigate(loginPath, { replace: true });
        }
    };

    // Close menus on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = e.target as Node;
            if (notifRef.current && !notifRef.current.contains(target)) {
                setNotifOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const sections = Array.from(new Set(navItems.map(i => i.section)));

    const userName = user?.name || 'User';
    const rawRole = user?.role as string | undefined;
    const userRole = rawRole === 'system_admin' ? 'System Administrator'
        : rawRole ? rawRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'Admin';

    const roleColor = rawRole ? (roleColorMap[rawRole] ?? 'bg-red-100 text-red-700') : 'bg-red-100 text-red-700';

    const initials = userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const currentNav = navItems.find(i => location.pathname === i.path || location.pathname.startsWith(i.path + '/'));

    return (
        /* Light theme wrapper — matches student DashboardLayout */
        <div className="flex h-screen bg-background overflow-hidden text-foreground">

            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar — light theme matching student Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 bg-card border-r border-border flex flex-col
                transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
                lg:translate-x-0 lg:static ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
            `}>
                {/* Brand — gradient-primary icon matching student sidebar */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm flex-shrink-0">
                            <GraduationCap className="h-5 w-5 text-foreground" />
                        </div>
                        {!isCollapsed && (
                            <div className="animate-fade-in-up">
                                <span className="text-base font-bold text-foreground block whitespace-nowrap">Campus2Career</span>
                                <p className="text-xs text-muted-foreground leading-none">Admin Portal</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(p => !p)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Nav sections */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                    {sections.map(section => {
                        const items = navItems.filter(i => i.section === section);
                        return (
                            <div key={section}>
                                {!isCollapsed && (
                                    <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {section}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {items.map(item => {
                                        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setIsMobileOpen(false)}
                                                title={isCollapsed ? item.label : undefined}
                                                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150
                                                    ${isActive
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                            >
                                                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                                                {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Role Badge + Logout Footer */}
                <div className="border-t border-border p-4 space-y-2">
                    {!isCollapsed && (
                        <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${roleColor}`}>
                            {userRole} Portal
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors group ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? 'Sign Out' : undefined}
                    >
                        <LogOut className="w-4 h-4 shrink-0 group-hover:text-red-600" />
                        {!isCollapsed && <span>Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Topbar — glassmorphism on white, matching student Navbar */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card/90 backdrop-blur-md px-4 md:px-6">
                    {/* Mobile toggle */}
                    <button onClick={() => setIsMobileOpen(true)} className="lg:hidden rounded-lg p-2 hover:bg-secondary">
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Breadcrumb */}
                    <nav className="hidden sm:flex items-center gap-2 text-sm font-medium animate-slide-in-left">
                        <span className="text-muted-foreground">{portalTitle}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-semibold">{currentNav?.label || 'Dashboard'}</span>
                    </nav>

                    <div className="flex-1" />

                    {/* Search */}
                    <div className="hidden md:block relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Search..."
                            className="h-9 w-52 rounded-lg border border-input bg-secondary/60 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                        />
                    </div>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
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

                    {/* User menu */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => { setShowDropdown(!showDropdown); setNotifOpen(false); }}
                            className="flex items-center gap-3 rounded-xl border bg-secondary/50 px-3 py-1.5 cursor-pointer hover:bg-secondary transition-colors"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-foreground text-sm font-bold">
                                {initials}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold leading-none">{userName}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{userRole}</p>
                            </div>
                            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 top-12 w-52 rounded-xl border bg-card shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
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
                        )}
                    </div>
                </header>

                {/* Page content — light background */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
