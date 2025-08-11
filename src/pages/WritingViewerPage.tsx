import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import ReactMarkdown from 'react-markdown';
import Card from "../components/ui/Card.tsx";

const WritingViewerPage: React.FC = () => {
    const { writingId } = useParams<{ writingId: string }>();

    // --- Step 1: Safely fetch the TOP-LEVEL data from the store ---
    const { userData, currentProjectId } = useAppStore();

    // --- Step 2: Safely DERIVE the project data using useMemo ---
    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);

    // --- Step 3: Safely DERIVE the specific manuscript and its related data ---
    const writing = useMemo(() => projectData?.writings.find(w => w.id === writingId), [projectData, writingId]);
    const characters = useMemo(() => projectData?.characters || [], [projectData]);
    const worlds = useMemo(() => projectData?.worlds || [], [projectData]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);

    // --- The rest of the component logic can now proceed with confidence ---

    const linkedWorld = useMemo(() =>
            worlds.find(w => w.id === writing?.linkedWorldId)
        , [worlds, writing]);

    const linkedChars = useMemo(() =>
            writing?.linkedCharacterIds?.map(id => characters.find(c => c.id === id)).filter(Boolean) as {id: string, name: string}[] || []
        , [characters, writing]);

    const linkedEvents = useMemo(() =>
            writing?.linkedEventIds?.map(id => events.find(e => e.id === id)).filter(Boolean) as {id: string, title: string}[] || []
        , [events, writing]);

    // Now, our "early exit" check is safe and will correctly display the message.
    if (!writing) {
        // We add a check for projectData to give a more helpful message
        if (!projectData) {
            return <div className="p-8 text-center">Loading chronicle...</div>;
        }
        return (
            <div className="text-center p-12 animate-fade-in">
                <h2 className="text-2xl text-foreground">Manuscript not found in this chronicle.</h2>
                <Link to="/writing-room" className="text-primary mt-4 inline-block">Return to the Library</Link>
            </div>
        );
    }

    // The JSX for rendering the manuscript remains the same.
    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 animate-fade-in">
            <header className="mb-8 pb-4 border-b border-border">
                <h1 className="text-5xl font-bold font-serif text-foreground">{writing.title}</h1>
                <div className="flex justify-between items-center mt-2 text-xs text-foreground/60">
                    <span>Created: {new Date(writing.createdAt).toLocaleString()}</span>
                    <span>Updated: {new Date(writing.updatedAt).toLocaleString()}</span>
                </div>
                {writing.tags && writing.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {writing.tags.map(tag => (
                            <span key={tag} className="text-xs bg-ink-brown/10 text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                )}
                {(linkedWorld || (linkedChars && linkedChars.length > 0) || (linkedEvents && linkedEvents.length > 0)) && (
                    <div className="mt-4 text-xs text-foreground/70 space-y-1">
                        {linkedWorld && (
                            <p>
                                🌍 In the realm of <Link to={`/worlds/${linkedWorld.id}`} className="text-primary hover:underline">{linkedWorld.name}</Link>
                            </p>
                        )}
                        {linkedChars && linkedChars.length > 0 && (
                            <p>
                                🧝 Featuring: {linkedChars.map((char, index) => (
                                <React.Fragment key={char.id}>
                                    <Link to={`/characters/${char.id}`} className="text-primary hover:underline">{char.name}</Link>
                                    {index < linkedChars.length - 1 ? ', ' : ''}
                                </React.Fragment>
                            ))}
                            </p>
                        )}
                        {linkedEvents && linkedEvents.length > 0 && (
                            <p>
                                ⏳ Pertaining to: {linkedEvents.map((event, index) => (
                                <React.Fragment key={event.id}>
                                    <Link to={`/timeline#${event.id}`} className="text-primary hover:underline">{event.title}</Link>
                                    {index < linkedEvents.length - 1 ? ', ' : ''}
                                </React.Fragment>
                            ))}
                            </p>
                        )}
                    </div>
                )}
            </header>
            <Card>
                <article className="prose prose-lg prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground max-w-none">
                    <ReactMarkdown>{writing.content}</ReactMarkdown>
                </article>
            </Card>
            <div className="mt-12 text-center">
                <Link to="/writing-room" className="text-primary hover:text-foreground transition-colors">
                    ← Return to the Library
                </Link>
            </div>
        </div>
    );
};

export default WritingViewerPage;