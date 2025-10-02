import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import { type WritingEntry } from '../stores/useWritingStore.ts';

import WritingEditorPanel from '../components/panels/WritingEditorPanel.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import {useAppStore} from "../stores/useAppStore.ts";
import EmptyGalleryPlaceholder from "../components/ui/placeholders/EmptyGalleryPlaceholder.tsx";

const QuillIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 20l10 -10l-1.5 -1.5l-10 10v1.5h1.5z" />
        <path d="M13.5 6.5l1.5 -1.5l-10 10v1.5h1.5z" />
        <path d="M18.5 1.5l-1.5 1.5" />
        <path d="M15 8l-1.5 1.5" />
    </svg>
);

const WritingRoomPage: React.FC = () => {
    // We summon our librarian, the Zustand store.
    const {
        userData,
        currentProjectId,
        addWriting,
        updateWriting,
        deleteWriting
    } = useAppStore();

    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);

    const writings = useMemo(() => projectData?.writings || [], [projectData]);
    const characters = useMemo(() => projectData?.characters || [], [projectData]);
    const worlds = useMemo(() => projectData?.worlds || [], [projectData]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);

    // UI state for controlling the editor panel.
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [writingToEdit, setWritingToEdit] = useState<WritingEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Handlers to connect our UI to the store's actions.
    const handleSave = (data: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (writingToEdit) {
            updateWriting(writingToEdit.id, data);
        } else {
            addWriting(data);
        }
    };

    const filteredWritings = useMemo(() => {
        if (!searchQuery) return writings;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return writings.filter(entry =>
            entry.title.toLowerCase().includes(lowerCaseQuery) ||
            entry.content.toLowerCase().includes(lowerCaseQuery) ||
            entry.tags?.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
        );
    }, [writings, searchQuery]);

    const openPanelForEdit = (entry: WritingEntry) => {
        setWritingToEdit(entry);
        setIsPanelOpen(true);
    };

    const openPanelForAdd = () => {
        setWritingToEdit(null);
        setIsPanelOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Consign this manuscript to the flames?")) {
            deleteWriting(id);
        }
    };

    if (!projectData) {
        return <div className="p-8 text-center">Loading project data...</div>;
    }

    return (

        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">✍️ The Heart's Library</h1>
                    <p className="text-foreground/70 italic mt-1">Where tales are etched in magic and memory.</p>
                </div>
                <Button onClick={openPanelForAdd}>
                    + New Manuscript
                </Button>
            </div>

            <div className="mb-8 opacity-0 animate-fade-in-down">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search manuscripts by title, content, or tag..."
                    className="w-full p-2 bg-card/70 border-b-2 border-border focus:outline-none focus:border-primary"
                />
            </div>

            {writings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWritings.map(entry => {
                        // --- LOOKUP LOGIC ---
                        const linkedChars = entry.linkedCharacterIds?.map(id => characters.find(c => c.id === id)?.name).filter(Boolean);
                        const linkedWorld = worlds.find(w => w.id === entry.linkedWorldId)?.name;
                        const linkedEvents = entry.linkedEventIds?.map(id => events.find(e => e.id === id)?.title).filter(Boolean);

                        return (
                            <Link to={`/writing/${entry.id}`} key={entry.id}>
                                <Card className="h-full opacity-0 animate-fade-in-up flex flex-col justify-between hover:!border-gold-leaf">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground border-b border-border pb-2 mb-3">{entry.title}</h3>
                                        <p className="text-xs text-foreground/60 mb-3">
                                            Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                                        </p>
                                        {/* Display tags on the card */}
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="mb-3 flex flex-wrap gap-1">
                                                {entry.tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-xs bg-ink-brown/10 text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="prose prose-sm max-w-none text-muted-foreground line-clamp-4">
                                            <ReactMarkdown>{entry.content}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* --- THIS IS DISPLAY SECTION --- */}
                                    {(linkedWorld || linkedChars?.length || linkedEvents?.length) && (
                                        <div className="mt-4 pt-4 border-t border-border text-xs text-foreground/70 space-y-1">
                                            {linkedWorld && <p>🌍 {linkedWorld}</p>}
                                            {linkedChars && linkedChars.length > 0 && <p>🧝 {linkedChars.join(', ')}</p>}
                                            {linkedEvents && linkedEvents.length > 0 && <p>⏳ {linkedEvents.join(', ')}</p>}
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                                        {/* We stop the Link's navigation when clicking the buttons */}
                                        <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={(e) => { e.preventDefault(); openPanelForEdit(entry); }}>Edit</Button>
                                        <Button variant="secondary" className="!px-3 !py-1 text-xs !text-destructive !border-red-800/30 hover:!bg-red-500/10" onClick={(e) => { e.preventDefault(); handleDelete(entry.id); }}>Delete</Button>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                // If no writings exist at all, we render our beautiful placeholder.
                <EmptyGalleryPlaceholder
                    icon={<QuillIcon />}
                    title="The Unwritten Page"
                    message="The library is quiet, its shelves awaiting the first of thy tales. Pen a new manuscript to begin."
                />
            )}

            <WritingEditorPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSave}
                writingToEdit={writingToEdit}
                characters={characters}
                worlds={worlds}
                events={events}
            />
        </div>
    );
};

export default WritingRoomPage;