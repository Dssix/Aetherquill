import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import Button from './ui/Button';

// This component is now self-contained and requires no props.
const Header: React.FC = () => {
    // It summons the data it needs to be intelligent from the global store.
    const { currentUser, currentProjectId, logout } = useAppStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="w-full bg-parchment/80 backdrop-blur-sm border-b border-ink-brown/20 shadow-md z-10 sticky top-0">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                {/* The main title links to the dashboard if logged in, or the login page if not. */}
                <Link to={currentUser ? "/" : "/login"} className="text-2xl font-bold text-ink-brown font-serif hover:text-gold-leaf transition-colors">
                    Aetherquill
                </Link>

                <div className="flex items-center gap-6">
                    {/* --- The Intelligent Navigation --- */}
                    {/* The main navigation links ONLY appear if a project is currently selected. */}
                    {currentProjectId && (
                        <nav className="hidden md:flex items-center gap-6 font-serif">
                            <NavLink
                                to="/project"
                                className={({ isActive }) => `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`}
                                // The 'end' prop is crucial here. It tells the NavLink to only be "active"
                                // when the path is EXACTLY "/project", not when it's a sub-path like "/project/timeline".
                                end
                            >
                                Home
                            </NavLink>
                            <NavLink to="/timeline" className={({ isActive }) => `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`}>
                                Chronicle
                            </NavLink>
                            <NavLink to="/characters" className={({ isActive }) => `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`}>
                                Souls
                            </NavLink>
                            <NavLink to="/writing-room" className={({ isActive }) => `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`}>
                                Lore
                            </NavLink>
                            <NavLink to="/worlds" className={({ isActive }) => `transition-colors ${isActive ? 'text-gold-leaf font-bold' : 'text-ink-brown/70 hover:text-gold-leaf'}`}>
                                Realms
                            </NavLink>
                        </nav>
                    )}

                    {/* The Logout button appears as long as a user is logged in. */}
                    {currentUser && (
                        <Button variant="secondary" onClick={handleLogout} className="!px-4 !py-1 text-xs">
                            Logout
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;