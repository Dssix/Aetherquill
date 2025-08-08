import React ,{ useState, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import Button from './ui/Button';
import { performSearch, type SearchResult } from '../utils/search';
import { useDebounce } from '../hooks/useDebounce'

// This component is now self-contained and requires no props.
const Header: React.FC = () => {
    // It summons the data it needs to be intelligent from the global store.
    const { currentUser, currentProjectId, userData, logout } = useAppStore();
    const navigate = useNavigate();

    // To Make Searching Possible
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // To generate delay
    const debouncedQuery = useDebounce(searchQuery, 200); // 200ms delay

    // This useMemo hook will ONLY re-run the search when the *debounced* query changes.
    const searchResults = useMemo(() => {
        if (!debouncedQuery || !userData || !currentProjectId) return [];
        const currentProject = userData.projects[currentProjectId];
        if (!currentProject) return [];
        return performSearch(currentProject, debouncedQuery);
    }, [debouncedQuery, userData, currentProjectId]);

    const groupedResults = useMemo(() => {
        return searchResults.reduce((acc, result) => {
            if (!acc[result.type]) {
                acc[result.type] = [];
            }
            acc[result.type].push(result);
            return acc;
        }, {} as Record<SearchResult['type'], SearchResult[]>);
    }, [searchResults]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsSearchFocused(false);
    }

    const handleResultClick = (path: string) => {
        clearSearch();
        navigate(path);
    };

    return (
        <header className="relative w-full bg-parchment/80 backdrop-blur-sm border-b border-ink-brown/20 shadow-md z-20 top-0">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                {/* The main title links to the dashboard if logged in, or the login page if not. */}
                <Link to={currentUser ? "/" : "/login"} className="text-2xl font-bold text-ink-brown font-serif hover:text-gold-leaf transition-colors">
                    Aetherquill
                </Link>

                {/* Search Panel Code */}
                {currentProjectId && (
                    <div className="relative flex-grow max-w-md">
                        <input
                            type="text"
                            placeholder="Search this chronicle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            className="w-full px-4 py-1 bg-parchment-highlight/70 border border-ink-brown/20 rounded-full focus:outline-none focus:ring-2 focus:ring-gold-leaf/50 text-sm"
                        />
                        {/* An 'X' button to clear the search, which appears only when typing */}
                        {searchQuery && (
                            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-brown/50 hover:text-ink-brown">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                )}

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
            {/* Search Result Panel */}
            {isSearchFocused && searchQuery && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSearchFocused(false)} />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[95%] max-w-3xl mt-2 z-20">
                        <div className="bg-parchment border border-gold-leaf/50 rounded-lg shadow-2xl p-4 max-h-[70vh] overflow-y-auto space-y-4">
                            {searchResults.length > 0 ? (
                                // We map over the GROUPS first
                                Object.entries(groupedResults).map(([type, results]) => (
                                    <div key={type}>
                                        <h3 className="text-sm font-bold text-ink-brown/70 uppercase tracking-wider border-b border-ink-brown/10 pb-1 mb-2">{type}s</h3>
                                        <div className="space-y-1">
                                            {/* Then we map over the results within each group */}
                                            {results.map(result => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleResultClick(result.path)}
                                                    className="w-full text-left p-2 rounded hover:bg-gold-leaf/20 transition-colors"
                                                >
                                                    <p className="font-semibold text-ink-brown">{result.name}</p>
                                                    <p className="text-xs text-ink-brown/70">{result.context}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-ink-brown/70 text-center">No echoes found in the archives...</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;