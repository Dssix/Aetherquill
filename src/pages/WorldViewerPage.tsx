import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import Card from '../components/ui/Card';

const WorldViewerPage: React.FC = () => {
    const { worldId } = useParams<{ worldId: string }>();

    const { userData, currentProjectId } = useAppStore();
    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);

    const world = useMemo(()  => projectData?.worlds.find(w => w.id === worldId), [projectData, worldId]);
    const characters = useMemo(() => projectData?.characters || [], [projectData]);
    const writings = useMemo(() => projectData?.writings || [], [projectData]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);

    // Look up the names of all linked entities.
    const linkedChars = useMemo(() =>
            world?.linkedCharacterIds?.map(id => characters.find(c => c.id === id)).filter(Boolean) as {id: string, name: string}[] || []
        , [characters, world]);

    const linkedWritings = useMemo(() =>
            world?.linkedWritingIds?.map(id => writings.find(w => w.id === id)).filter(Boolean) as {id: string, title: string}[] || []
        , [writings, world]);

    const linkedEvents = useMemo(() =>
            world?.linkedEventIds?.map(id => events.find(e => e.id === id)).filter(Boolean) as {id: string, title: string}[] || []
        , [events, world]);

    // Safety check if the world isn't found.
    if (!world) {
        return (
            <div className="text-center p-12 animate-fade-in">
                <h2 className="text-2xl text-ink-brown">Realm not found in this chronicle.</h2>
                <Link to="/worlds" className="text-gold-leaf mt-4 inline-block">Return to the Atlas</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in">
            {/* --- Main Header --- */}
            <header className="mb-8 pb-4 border-b border-ink-brown/20">
                <h1 className="text-5xl font-bold font-serif text-ink-brown">{world.name}</h1>
                <p className="text-lg text-gold-leaf font-semibold mt-1">{world.theme}</p>
                <p className="text-sm text-ink-brown/70 mt-2">{world.setting}</p>
            </header>

            {/* --- Core Description --- */}
            <Card>
                <div className="prose prose-sm max-w-none text-ink-brown/90 leading-relaxed">
                    <p>{world.description}</p>
                </div>
            </Card>

            {/* --- Links Display --- */}
            {(linkedChars.length > 0 || linkedWritings.length > 0 || linkedEvents.length > 0) && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-ink-brown font-serif mb-4">Web of Echoes</h2>
                    <Card>
                        {linkedChars.length > 0 && (
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-ink-brown/70 uppercase tracking-wider mb-2">🧝 Known Inhabitants</h3>
                                {linkedChars.map(char =>
                                    <Link key={char.id} to={`/characters/${char.id}`} className="text-sm text-gold-leaf hover:underline block">- {char.name}</Link>
                                )}
                            </div>
                        )}
                        {linkedWritings.length > 0 && (
                            <div className={`space-y-1 ${linkedChars.length > 0 ? 'mt-4' : ''}`}>
                                <h3 className="text-xs font-bold text-ink-brown/70 uppercase tracking-wider mb-2">✍️ Associated Lore</h3>
                                {linkedWritings.map(writing =>
                                    <Link key={writing.id} to={`/writing/${writing.id}`} className="text-sm text-gold-leaf hover:underline block">- {writing.title}</Link>
                                )}
                            </div>
                        )}
                        {linkedEvents.length > 0 && (
                            <div className={`space-y-1 ${(linkedChars.length > 0 || linkedWritings.length > 0) ? 'mt-4' : ''}`}>
                                <h3 className="text-xs font-bold text-ink-brown/70 uppercase tracking-wider mb-2">⏳ Historical Events</h3>
                                {/* These can be made into links to the timeline later if desired */}
                                {linkedEvents.map(event => <p key={event.id} className="text-sm">- {event.title}</p>)}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            <div className="mt-12 text-center">
                <Link to="/worlds" className="text-gold-leaf hover:text-ink-brown transition-colors">
                    ← Return to the Atlas of Realms
                </Link>
            </div>
        </div>
    );
};

export default WorldViewerPage;