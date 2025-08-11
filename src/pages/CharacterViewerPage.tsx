import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import Card from '../components/ui/Card';
import TraitDisplay from '../components/ui/TraitDisplay';

const CharacterViewerPage: React.FC = () => {
    const { characterId } = useParams<{ characterId: string }>();

    const { userData, currentProjectId } = useAppStore();
    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);

    const character = useMemo(() => projectData?.characters.find(c => c.id === characterId), [projectData, characterId]);
    const worlds = useMemo(() => projectData?.worlds || [], [projectData]);
    const writings = useMemo(() => projectData?.writings || [], [projectData]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);

    // These useMemo hooks are also called unconditionally.
    // If 'character' is undefined, they will simply receive undefined and return a default value.
    const worldName = useMemo(() => worlds.find(w => w.id === character?.linkedWorldId)?.name, [worlds, character]);

    const writingLinks = useMemo(() =>
            character?.linkedWritingIds?.map(id => writings.find(w => w.id === id)).filter(Boolean) as {id: string, title: string}[] || []
        , [writings, character]);

    const eventLinks = useMemo(() =>
            character?.linkedEventIds?.map(id => events.find(e => e.id === id)).filter(Boolean) as {id: string, title: string}[] || []
        , [events, character]);

    // --- Step 2: The Conditional Return (The "Early Exit") ---
    // Now that all hooks have been called, we can safely check if the character was found.
    // If not, we can return early.
    if (!character) {
        return (
            <div className="text-center p-12 animate-fade-in">
                <h2 className="text-2xl text-foreground">Soul not found in this chronicle.</h2>
                <Link to="/characters" className="text-primary mt-4 inline-block">Return to the Gallery</Link>
            </div>
        );
    }

    // If the character WAS found, the component continues and renders the main content.
    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in">
            <header className="mb-8 pb-4 border-b border-border">
                <h1 className="text-5xl font-bold font-serif text-foreground">{character.name}</h1>
                <p className="text-lg text-primary font-semibold mt-1">{character.species}</p>
                {worldName && <p className="text-sm text-foreground/70 mt-2">🌍 From the realm of {worldName}</p>}
            </header>

            <Card>
                <div className="space-y-2">
                    {character.traits.map(trait => (
                        <TraitDisplay key={trait.id} label={trait.label} value={trait.value} />
                    ))}
                </div>
            </Card>

            {(writingLinks.length > 0 || eventLinks.length > 0) && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-foreground font-serif mb-4">Web of Echoes</h2>
                    <Card>
                        {writingLinks.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">✍️ Mentions</h3>
                                {writingLinks.map(writing =>
                                    <Link key={writing.id} to={`/writing/${writing.id}`} className="text-sm text-primary hover:underline block">- {writing.title}</Link>
                                )}
                            </div>
                        )}
                        {eventLinks.length > 0 && (
                            <div className={`space-y-1 ${writingLinks.length > 0 ? 'mt-4' : ''}`}>
                                <h3 className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">⏳ Appearances</h3>
                                {eventLinks.map(event => <p key={event.id} className="text-sm">- {event.title}</p>)}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            <div className="mt-12 text-center">
                <Link to="/characters" className="text-primary hover:text-foreground transition-colors">
                    ← Return to the Gallery of Souls
                </Link>
            </div>
        </div>
    );
};

export default CharacterViewerPage;