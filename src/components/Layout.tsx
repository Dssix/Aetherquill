import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header';

// This component uses <Outlet /> from React Router to render the correct child page.
const Layout: React.FC = () => {

    return (
        <div
            className="min-h-screen w-full flex flex-col"
        >
            {/* --- HEADER --- */}
            <Header/>

            {/* --- MAIN CONTENT AREA --- */}
            {/* React Router renders the specific page component (e.g., TimelinePage) here. */}
            <main className="flex-grow w-full">
                <Outlet />
            </main>

            {/* --- FOOTER --- */}
            <footer className="w-full text-center py-4 bg-popover/80 backdrop-blur-sm border-t border-border mt-auto">
                <p className="text-xs text-muted-foreground italic">
                    Forged with quills & dreams
                </p>
            </footer>
        </div>
    );
};

export default Layout;