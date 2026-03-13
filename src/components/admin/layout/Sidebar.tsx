import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

export const Sidebar: React.FC<SidebarProps> = ({
    isMobileOpen,
    isDesktopCollapsed,
    setMobileOpen,
    setDesktopCollapsed
}) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    // Filter navigation based on user role
    const allowedNavigation = ADMIN_NAVIGATION.filter(item => hasRole(user, item.allowedRoles));

    // Group navigation by sections
    const sections = Array.from(new Set(allowedNavigation.map(item => item.section || 'General')));

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
                    className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={sidebarClasses}>
                {/* Logo/Brand Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        {!isDesktopCollapsed && (
                            <span className="font-bold text-lg whitespace-nowrap text-foreground animate-fade-in-up">Campus2Career Admin</span>
                        )}
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setDesktopCollapsed(prev => !prev)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${isDesktopCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                    {sections.map((sectionName) => {
                        const items = allowedNavigation.filter(item => (item.section || 'General') === sectionName);
                        if (items.length === 0) return null;

                        return (
                            <div key={sectionName} className={`mb-6 ${isDesktopCollapsed ? 'items-center' : ''} flex flex-col`}>
                                {!isDesktopCollapsed && (
                                    <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-pulse-glow" style={{ animationIterationCount: 1, animationDuration: '0.5s' }}>
                                        {sectionName}
                                    </h4>
                                )}
                                <ul className="space-y-1 w-full">
                                    {items.map((item) => {
                                        const isActive = location.pathname.startsWith(item.path);
                                        return (
                                            <li key={item.path}>
                                                <NavLink
                                                    to={item.path}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                                        } ${isDesktopCollapsed ? 'justify-center' : ''}`}
                                                    title={isDesktopCollapsed ? item.label : undefined}
                                                    onClick={() => setMobileOpen(false)} // Close on mobile navigation
                                                >
                                                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                                                    {!isDesktopCollapsed && (
                                                        <span className="truncate">{item.label}</span>
                                                    )}
                                                </NavLink>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions (Logout) */}
                <div className="p-4 border-t border-border mt-auto">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group ${isDesktopCollapsed ? 'justify-center' : ''}`}
                        title={isDesktopCollapsed ? "Log Out" : undefined}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-destructive" />
                        {!isDesktopCollapsed && <span>Log Out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};
