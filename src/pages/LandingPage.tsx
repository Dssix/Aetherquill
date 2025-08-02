import React from 'react';
import { Link } from 'react-router-dom';

// The props for our card remain the same.
interface NavCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const NavigationCard: React.FC<NavCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-parchment-highlight/50 backdrop-blur-sm border border-ink-brown/20 rounded-lg p-6 text-center flex flex-col items-center gap-4 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-glow hover:border-gold-leaf/50 cursor-pointer h-full">
            <div className="text-gold-leaf">{icon}</div>
            <h3 className="text-2xl font-bold text-ink-brown">{title}</h3>
            <p className="text-ink-brown/80">{description}</p>
        </div>
    );
};

const LandingPage: React.FC = () => {
    return (
        <main
            className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-cover bg-center"
            style={{ backgroundImage: "url('/parchment-bg.png')" }}
        >
            <div className="text-center mb-12 md:mb-16 opacity-0 animate-fade-in-down">
                <h1 className="text-5xl md:text-7xl font-bold text-ink-brown" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                    Aetherquill
                </h1>
                <p className="text-lg md:text-xl text-ink-brown/90 mt-4 italic">
                    Craft thy tale upon parchment and stars
                </p>
            </div>

            {/* --- THE CHANGE: THE GRID IS NOW MORE FLEXIBLE --- */}
            {/* We now have 4 items. A 2x2 grid on medium screens and a 4x1 on large screens is a robust pattern. */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl opacity-0 animate-fade-in-up">

                {/* --- TITLES ARE NOW MORE POETIC --- */}
                <Link to="/timeline">
                    <NavigationCard
                        icon={<QuillIcon />}
                        title="📜 Chronicle of Eras"
                        description="Weave the threads of destiny and order thy story's events."
                    />
                </Link>
                <Link to="/characters">
                    <NavigationCard
                        icon={<CrestIcon />}
                        title="🧝 Living Souls"
                        description="Summon forth thy heroes and villains; chronicle their traits."
                    />
                </Link>
                <Link to="/writing-room">
                    <NavigationCard
                        icon={<BookIcon />}
                        title="✍️ Whispers & Lore"
                        description="Enter the scriptorium and let the ink flow upon the page."
                    />
                </Link>

                {/* --- THE GATEWAY --- */}
                <Link to="/worlds">
                    <NavigationCard
                        icon={<WorldIcon />}
                        title="🌍 Realms & Regions"
                        description="Define the lands, cities, and realms that cradle thy saga."
                    />
                </Link>
            </div>
        </main>
    );
};

// --- ADD THIS NEW SVG ICON COMPONENT AT THE BOTTOM ---
const WorldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <circle cx="12" cy="12" r="9" />
        <line x1="3.6" y1="9" x2="20.4" y2="9" />
        <line x1="3.6" y1="15" x2="20.4" y2="15" />
        <path d="M11.5 3a17 17 0 0 0 0 18" />
        <path d="M12.5 3a17 17 0 0 1 0 18" />
    </svg>
);

const QuillIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 20l10 -10l-1.5 -1.5l-10 10v1.5h1.5z" />
        <path d="M13.5 6.5l1.5 -1.5l-10 10v1.5h1.5z" />
        <path d="M18.5 1.5l-1.5 1.5" />
        <path d="M15 8l-1.5 1.5" />
    </svg>
);

const CrestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 21l-8 -4.5v-9l8 -4.5l8 4.5v9z" />
        <path d="M12 12l8 -4.5" />
        <path d="M12 12v9" />
        <path d="M12 12l-8 -4.5" />
    </svg>
);

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
        <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
        <line x1="3" y1="6" x2="3" y2="19" />
        <line x1="12" y1="6" x2="12" y2="19" />
        <line x1="21" y1="6" x2="21" y2="19" />
    </svg>
);


export default LandingPage;