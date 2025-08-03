import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';

// --- Step 1: Define the SVG Icon components ---
// We define these directly in the file for simplicity, just as we did on the original LandingPage.
const QuillIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20l10 -10l-1.5 -1.5l-10 10v1.5h1.5z" /><path d="M13.5 6.5l1.5 -1.5l-10 10v1.5h1.5z" /><path d="M18.5 1.5l-1.5 1.5" /><path d="M15 8l-1.5 1.5" /></svg> );
const CrestIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 21l-8 -4.5v-9l8 -4.5l8 4.5v9z" /><path d="M12 12l8 -4.5" /><path d="M12 12v9" /><path d="M12 12l-8 -4.5" /></svg> );
const BookIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><line x1="3" y1="6" x2="3" y2="19" /><line x1="12" y1="6" x2="12" y2="19" /><line x1="21" y1="6" x2="21" y2="19" /></svg> );
const WorldIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><circle cx="12" cy="12" r="9" /><line x1="3.6" y1="9" x2="20.4" y2="9" /><line x1="3.6" y1="15" x2="20.4" y2="15" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" /></svg> );


// The NavigationCard component now correctly uses its 'icon' prop.
const NavigationCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-parchment-highlight/50 backdrop-blur-sm border border-ink-brown/20 rounded-lg p-6 text-center flex flex-col items-center gap-4 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-glow hover:border-gold-leaf/50 cursor-pointer h-full">
        <div className="text-gold-leaf">{icon}</div>
        <h3 className="text-2xl font-bold text-ink-brown">{title}</h3>
        <p className="text-ink-brown/80">{description}</p>
    </div>
);

const ProjectPage: React.FC = () => {
    const { currentUser, userData, currentProjectId } = useAppStore();

    if (!currentProjectId || !userData || !userData.projects[currentProjectId]) {
        return <Navigate to="/" replace />;
    }

    const project = userData.projects[currentProjectId];

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 flex-grow flex flex-col justify-center">
            <header className="text-center mb-12 animate-fade-in-down">
                <h1 className="text-5xl font-bold text-ink-brown">{project.name}</h1>
                <p className="text-lg text-ink-brown/80 italic mt-2">
                    A chronicle by {currentUser}
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up">
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
                <Link to="/worlds">
                    <NavigationCard
                        icon={<WorldIcon />}
                        title="🌍 Realms & Regions"
                        description="Define the lands, cities, and realms that cradle thy saga."
                    />
                </Link>
            </div>
        </div>
    );
};

export default ProjectPage;