import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore.ts';
import Card from '../components/ui/Card.tsx';

const CatalogueItemViewerPage: React.FC = () => {
    const { itemId } = useParams<{ itemId: string }>();

    // --- Step 1: Safely fetch the TOP-LEVEL data from the store ---
    const { userData, currentProjectId } = useAppStore();

    // --- Step 2: Safely DERIVE the project data using useMemo ---
    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);

    // --- Step 3: Safely DERIVE the specific item and its related data ---
    const item = useMemo(() => projectData?.catalogue.find(i => i.id === itemId), [projectData, itemId]);
    const characters = useMemo(() => projectData?.characters || [], [projectData]);
    const worlds = useMemo(() => projectData?.worlds || [], [projectData]);
    const writings = useMemo(() => projectData?.writings || [], [projectData]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);

    // The rest of your component logic can now proceed with confidence.

    const worldName = useMemo(() => worlds.find(w => w.id === item?.linkedWorldId)?.name, [worlds, item]);
    const linkedChars = useMemo(() =>
            item?.linkedCharacterIds?.map(id => characters.find(c => c.id === id)).filter(Boolean) as {id: string, name: string}[] || []
        , [characters, item]);
    const linkedWritings = useMemo(() =>
            item?.linkedWritingIds?.map(id => writings.find(w => w.id === id)).filter(Boolean) as {id: string, title: string}[] || []
        , [writings, item]);
    const linkedEvents = useMemo(() =>
            item?.linkedEventIds?.map(id => events.find(e => e.id === id)).filter(Boolean) as {id: string, title: string}[] || []
        , [events, item]);

    // Now, our "early exit" check is safe and will correctly display the message.
    if (!item) {
        return (
            <div className="text-center p-12 animate-fade-in">
                <h2 className="text-2xl text-foreground">Curiosity not found in this chronicle.</h2>
                <Link to="/catalogue" className="text-accent mt-4 inline-block">Return to the Catalogue</Link>
            </div>
        );
    }

    // The JSX for rendering the item remains the same.
    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in">
            <header className="mb-8 pb-4 border-b border-border">
                <p className="text-sm text-primary font-semibold uppercase tracking-wider">{item.category}</p>
                <h1 className="text-5xl font-bold font-serif text-foreground mt-1">{item.name}</h1>
                {worldName && <p className="text-sm text-muted-foreground mt-2">🌍 From the realm of {worldName}</p>}
            </header>

            <Card>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    <p>{item.description}</p>
                </div>
            </Card>

            {(linkedChars.length > 0 || linkedWritings.length > 0 || linkedEvents.length > 0) && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-foreground font-serif mb-4">Web of Echoes</h2>
                    <Card>
                        {linkedChars.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">🧝 Related Characters</h3>
                                {linkedChars.map(char =>
                                    <Link key={char.id} to={`/characters/${char.id}`} className="text-sm text-accent hover:underline block">- {char.name}</Link>
                                )}
                            </div>
                        )}
                        {linkedWritings.length > 0 && (
                            <div className={`space-y-1 ${linkedChars.length > 0 ? 'mt-4' : ''}`}>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">✍️ Associated Lore</h3>
                                {linkedWritings.map(writing =>
                                    <Link key={writing.id} to={`/writing/${writing.id}`} className="text-sm text-accent hover:underline block">- {writing.title}</Link>
                                )}
                            </div>
                        )}
                        {linkedEvents.length > 0 && (
                            <div className={`space-y-1 ${(linkedChars.length > 0 || linkedWritings.length > 0) ? 'mt-4' : ''}`}>
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">⏳ Historical Events</h3>
                                {linkedEvents.map(event =>
                                    <Link key={event.id} to={`/timeline`} className="text-sm text-accent hover:underline block">- {event.title}</Link>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            <div className="mt-12 text-center">
                <Link to="/catalogue" className="text-accent hover:text-accent/80 transition-colors">
                    ← Return to the Catalogue of Curiosities
                </Link>
            </div>
        </div>
    );
};

export default CatalogueItemViewerPage;