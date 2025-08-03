import React from 'react';
import { Outlet } from 'react-router-dom';

import Header from './Header';

// This component uses <Outlet /> from React Router to render the correct child page.
const Layout: React.FC = () => {

    return (
        <div
            className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed"
            // The background image is now controlled by the Layout, ensuring consistency.
            style={{ backgroundImage: "url('/parchment-bg.png')" }}
        >
            {/* --- HEADER --- */}
            <Header/>

            {/* --- MAIN CONTENT AREA --- */}
            {/* React Router renders the specific page component (e.g., TimelinePage) here. */}
            <main className="flex-grow w-full">
                <Outlet />
            </main>

            {/* --- FOOTER --- */}
            <footer className="w-full text-center py-4 bg-parchment/80 backdrop-blur-sm border-t border-ink-brown/10 mt-auto">
                <p className="text-xs text-ink-brown/60 italic">
                    Forged with quills & dreams
                </p>
            </footer>
        </div>
    );
};

export default Layout;