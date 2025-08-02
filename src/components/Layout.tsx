import React from 'react';
import { Link, Outlet, NavLink } from 'react-router-dom';

// This component uses <Outlet /> from React Router to render the correct child page.
const Layout: React.FC = () => {
    return (
        <div
            className="min-h-screen w-full flex flex-col bg-cover bg-center bg-fixed"
            // The background image is now controlled by the Layout, ensuring consistency.
            style={{ backgroundImage: "url('/parchment-bg.png')" }}
        >
            {/* --- HEADER --- */}
            <header className="w-full bg-parchment/80 backdrop-blur-sm border-b border-ink-brown/20 shadow-md z-10 sticky top-0">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-ink-brown font-serif hover:text-gold-leaf transition-colors">
                        Aetherquill
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 font-serif">
                        <NavLink
                            to="/timeline"
                            className={({ isActive }) =>
                                `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`
                            }
                        >
                            Chronicle
                        </NavLink>
                        <NavLink
                            to="/characters"
                            className={({ isActive }) =>
                                `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`
                            }
                        >
                            Souls
                        </NavLink>
                        <NavLink
                            to="/worlds"
                            className={({ isActive }) =>
                                `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`
                            }
                        >
                            Realms
                        </NavLink>
                        <NavLink
                            to="/writing-room"
                            className={({ isActive }) =>
                                `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`
                            }
                        >
                            Lore
                        </NavLink>
                    </nav>
                </div>
            </header>

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