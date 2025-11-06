// In packages/client/src/components/Layout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';

const Layout: React.FC = () => {
    return (
        // This div is now just a flex container for the authenticated layout.
        // The global background is provided by the parent AppShell.
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow w-full">
                <Outlet />
            </main>
            <footer className="w-full text-center py-4 bg-popover/80 backdrop-blur-sm border-t border-border mt-auto">
                <p className="text-xs text-muted-foreground italic">
                    Forged with quills & dreams
                </p>
            </footer>
        </div>
    );
};

export default Layout;