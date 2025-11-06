// packages/client/src/components/AppShell.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * The AppShell is the highest-level layout component.
 * Its primary responsibility is to provide the consistent, theme-aware
 * background and structure for the ENTIRE application, including
 * both authenticated and unauthenticated pages.
 */
const AppShell: React.FC = () => {
    return (
        // This div provides the global parchment background.
        // In dark mode, it will have a dark parchment texture, and in light mode, a light one.
        // This is achieved via CSS variables tied to the .dark class on the <html> element.
        <div className="min-h-screen w-full">
            {/* The Outlet will render either the LoginPage, RegisterPage, or the main Layout component. */}
            <Outlet />
        </div>
    );
};

export default AppShell;