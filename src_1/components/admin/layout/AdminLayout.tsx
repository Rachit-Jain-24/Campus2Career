import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AdminLayout: React.FC = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">
            {/* Persistent Sidebar */}
            <Sidebar
                isMobileOpen={isMobileOpen}
                setMobileOpen={setIsMobileOpen}
                isDesktopCollapsed={isDesktopCollapsed}
                setDesktopCollapsed={setIsDesktopCollapsed}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Sticky Topbar */}
                <Topbar onMobileMenuToggle={() => setIsMobileOpen(true)} />

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full">
                        {/* Render nested routes here */}
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
