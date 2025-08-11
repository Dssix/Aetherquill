import React ,{ useState, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import Button from './ui/Button';
import { performSearch, type SearchResult } from '../utils/search';
import { useDebounce } from '../hooks/useDebounce'
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

// This component is now self-contained and requires no props.
const Header: React.FC = () => {
    // It summons the data it needs to be intelligent from the global store.
    const {
        currentUser,
        currentProjectId,
        userData,
        logout,
        theme,
        toggleTheme
    } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();
    const breadcrumbs = useBreadcrumbs();

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
        <header className="relative w-full bg-background/80 backdrop-blur-sm border-b border-border shadow-md z-20 top-0">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                {/* The main title links to the dashboard if logged in, or the login page if not. */}
                <Link to={currentUser ? "/" : "/login"} className="text-2xl font-bold text-foreground font-serif hover:text-accent transition-colors">
                    Aetherquill
                </Link>

                {/* Search Panel Code */}
                {currentProjectId && location.pathname.startsWith('/project') && (
                    <div className="relative flex-grow max-w-md">
                        <input
                            type="text"
                            placeholder="Search this chronicle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            className="w-full px-4 py-1 bg-card/70 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-gold-leaf/50 text-sm"
                        />
                        {/* An 'X' button to clear the search, which appears only when typing */}
                        {searchQuery && (
                            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {/* --- The Intelligent Navigation --- */}
                    {/* The main navigation links ONLY appear if a project is currently selected. */}
                    {currentProjectId && (
                        <nav className="hidden md:flex items-center gap-6 font-serif">
                            <NavLink
                                to="/project"
                                className={({ isActive }) => `transition-colors ${isActive ? 'text-primary font-bold' : 'text-foreground/70 hover:text-accent'}`}
                                // The 'end' prop is crucial here. It tells the NavLink to only be "active"
                                // when the path is EXACTLY "/project", not when it's a sub-path like "/project/timeline".
                                end
                            >
                                Home
                            </NavLink>
                            <NavLink to="/timeline" className={({ isActive }) => `transition-colors ${isActive ? 'text-primary font-bold' : 'text-foreground/70 hover:text-accent'}`}>
                                Chronicle
                            </NavLink>
                            <NavLink to="/characters" className={({ isActive }) => `transition-colors ${isActive ? 'text-primary font-bold' : 'text-foreground/70 hover:text-accent'}`}>
                                Souls
                            </NavLink>
                            <NavLink to="/writing-room" className={({ isActive }) => `transition-colors ${isActive ? 'text-primary font-bold' : 'text-foreground/70 hover:text-accent'}`}>
                                Lore
                            </NavLink>
                            <NavLink to="/worlds" className={({ isActive }) => `transition-colors ${isActive ? 'text-primary font-bold' : 'text-foreground/70 hover:text-accent'}`}>
                                Realms
                            </NavLink>
                        </nav>
                    )}

                    {/* The Logout button appears as long as a user is logged in. */}
                    {currentUser && (
                        <>
                            <button
                                onClick={toggleTheme}
                                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                                title="Toggle Theme"
                            >
                                {/* We conditionally render a sun or moon icon based on the current theme. */}
                                {theme === 'light' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                                    </svg>
                                )}
                            </button>
                            <Button variant="secondary" onClick={handleLogout} className="!px-4 !py-1 text-xs">
                                Logout
                            </Button></>
                    )}
                </div>
            </div>

            {/* This is the Breadcrumb Trail. It only appears if a project is active, and we are not on the main project page. */}
            {currentProjectId && location.pathname !== '/' && (
                <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-2 text-xs text-foreground/70 border-b border-border">
                    <nav>
                        <ol className="flex items-center gap-2 flex-wrap">
                            {breadcrumbs.map((crumb, index) => (
                                <li key={crumb.path} className="flex items-center gap-2">
                                    {index < breadcrumbs.length - 1 ? (
                                        <Link to={crumb.path} className="hover:text-accent transition-colors">
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="font-semibold text-foreground">{crumb.label}</span>
                                    )}
                                    {index < breadcrumbs.length - 1 && <span>/</span>}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            )}

            {/* Search Result Panel */}
            {isSearchFocused && searchQuery && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsSearchFocused(false)} />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[95%] max-w-3xl mt-2 z-20">
                        <div className="bg-popover border border-gold-leaf/50 rounded-lg shadow-2xl p-4 max-h-[70vh] overflow-y-auto space-y-4">
                            {searchResults.length > 0 ? (
                                // We map over the GROUPS first
                                Object.entries(groupedResults).map(([type, results]) => (
                                    <div key={type}>
                                        <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wider border-b border-border pb-1 mb-2">{type}s</h3>
                                        <div className="space-y-1">
                                            {/* Then we map over the results within each group */}
                                            {results.map(result => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleResultClick(result.path)}
                                                    className="w-full text-left p-2 rounded hover:bg-gold-leaf/20 transition-colors"
                                                >
                                                    <p className="font-semibold text-foreground">{result.name}</p>
                                                    <p className="text-xs text-foreground/70">{result.context}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-foreground/70 text-center">No echoes found in the archives...</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;