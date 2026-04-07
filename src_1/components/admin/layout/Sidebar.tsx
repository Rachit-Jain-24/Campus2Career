import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, ChevronLeft } from 'lucide-react';
import { ADMIN_NAVIGATION } from '../../../config/admin/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { hasRole } from '../../../utils/admin/rbac';

interface SidebarProps {
    isMobileOpen: boolean;
    isDesktopCollapsed: boolean;
    setMobileOpen: (open: boolean) => void;
    setDesktopCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

const roleColorMap: Record<string, string> = {
    dean: 'bg-violet-100 text-violet-700',
    director: 'bg-slate-100 text-slate-700',
    program_chair: 'bg-indigo-100 text-indigo-700',
    faculty: 'bg-teal-100 text-teal-700',
    placement_officer: 'bg-orange-100 text-orange-700',
    system_admin: 'bg-red-100 text-red-700',
};

const roleLabelMap: Record<string, string> = {
    dean: 'Dean',
    director: 'Director',
    program_chair: 'Program Chair',
    faculty: 'Faculty Mentor',
    placement_officer: 'Placement Officer',
    system_admin: 'System Admin',
};

export const Sidebar: React.FC<SidebarProps> = ({
    isMobileOpen,
    isDesktopCollapsed,
    setMobileOpen,
    setDesktopCollapsed,
}) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            // AuthContext.logout() already navigates to /login
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    // Filter navigation based on user role
    const allowedNavigation = ADMIN_NAVIGATION.filter(item => hasRole(user, item.allowedRoles));

    // Group navigation by sections
    const sections = Array.from(new Set(allowedNavigation.map(item => item.section || 'General')));

    const rawRole = user?.role as string | undefined;
    const roleColor = rawRole ? (roleColorMap[rawRole] ?? 'bg-red-100 text-red-700') : 'bg-red-100 text-red-700';
    const roleLabel = rawRole ? (roleLabelMap[rawRole] ?? rawRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())) : 'Admin';

    const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full'} 
    lg:translate-x-0 lg:static ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
  `;

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={sidebarClasses}>
                {/* Logo/Brand Area — matches student sidebar style */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-sm flex-shrink-0">
                            <GraduationCap className="h-5 w-5 text-foreground" />
                        </div>
                        {!isDesktopCollapsed && (
                            <div className="animate-fade-in-up">
                                <span className="text-base font-bold text-foreground block whitespace-nowrap">Campus2Career</span>
                                <p className="text-xs text-muted-foreground leading-none">Admin Portal</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setDesktopCollapsed(prev => !prev)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        title={isDesktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
                    {sections.map((sectionName) => {
                        const items = allowedNavigation.filter(item => (item.section || 'General') === sectionName);
                        if (items.length === 0) return null;

                        return (
                            <div key={sectionName} className="flex flex-col">
                                {!isDesktopCollapsed && (
                                    <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {sectionName}
                                    </p>
                                )}
                                <div className="space-y-0.5 w-full">
                                    {items.map((item) => {
                                        const isActive = location.pathname.startsWith(item.path);
                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150
                                                    ${isActive
                                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                                    } ${isDesktopCollapsed ? 'justify-center' : ''}`}
                                                title={isDesktopCollapsed ? item.label : undefined}
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                                                {!isDesktopCollapsed && (
                                                    <span className="flex-1 truncate">{item.label}</span>
                                                )}
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
                    {!isDesktopCollapsed && (
                        <div className={`rounded-lg px-3 py-2 text-center text-xs font-semibold ${roleColor}`}>
                            {roleLabel} Portal
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors group ${isDesktopCollapsed ? 'justify-center' : ''}`}
                        title={isDesktopCollapsed ? 'Log Out' : undefined}
                    >
                        <LogOut className="w-4 h-4 shrink-0 group-hover:text-red-600" />
                        {!isDesktopCollapsed && <span>Sign out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};
