import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

import { useWritingStore, type WritingEntry } from '../stores/useWritingStore';
import { useCharacterStore } from '../stores/useCharacterStore';
import { useWorldStore } from '../stores/useWorldStore';
import { useTimelineEventStore } from '../stores/useTimelineEventStore';

import WritingEditorPanel from '../components/panels/WritingEditorPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const WritingRoomPage: React.FC = () => {
    // We summon our librarian, the Zustand store.
    const { writings, addWriting, updateWriting, deleteWriting } = useWritingStore();
    const { characters } = useCharacterStore();
    const { worlds } = useWorldStore();
    const { events } = useTimelineEventStore();

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

    return (

        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold text-ink-brown">✍️ The Heart's Library</h1>
                    <p className="text-ink-brown/70 italic mt-1">Where tales are etched in magic and memory.</p>
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
                    className="w-full p-2 bg-parchment-highlight/70 border-b-2 border-ink-brown/20 focus:outline-none focus:border-gold-leaf"
                />
            </div>

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
                                    <h3 className="text-xl font-bold text-ink-brown border-b border-ink-brown/10 pb-2 mb-3">{entry.title}</h3>
                                    <p className="text-xs text-ink-brown/60 mb-3">
                                        Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                                    </p>
                                    {/* Display tags on the card */}
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-1">
                                            {entry.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="text-xs bg-ink-brown/10 text-ink-brown/80 px-2 py-0.5 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="prose prose-sm max-w-none text-ink-brown/80 line-clamp-4">
                                        <ReactMarkdown>{entry.content}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* --- THIS IS DISPLAY SECTION --- */}
                                {(linkedWorld || linkedChars?.length || linkedEvents?.length) && (
                                    <div className="mt-4 pt-4 border-t border-ink-brown/10 text-xs text-ink-brown/70 space-y-1">
                                        {linkedWorld && <p>🌍 {linkedWorld}</p>}
                                        {linkedChars && linkedChars.length > 0 && <p>🧝 {linkedChars.join(', ')}</p>}
                                        {linkedEvents && linkedEvents.length > 0 && <p>⏳ {linkedEvents.join(', ')}</p>}
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-ink-brown/10 flex justify-end gap-2">
                                    {/* We stop the Link's navigation when clicking the buttons */}
                                    <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={(e) => { e.preventDefault(); openPanelForEdit(entry); }}>Edit</Button>
                                    <Button variant="secondary" className="!px-3 !py-1 text-xs !text-red-800/80 !border-red-800/30 hover:!bg-red-500/10" onClick={(e) => { e.preventDefault(); handleDelete(entry.id); }}>Delete</Button>
                                </div>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {writings.length === 0 && (
                <Card className="text-center opacity-0 animate-fade-in-up col-span-full">
                    <p className="text-lg text-ink-brown/90 my-6">The library is quiet. Pen thy first manuscript to begin.</p>
                </Card>
            )}

            <WritingEditorPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSave}
                writingToEdit={writingToEdit}
            />
        </div>
    );
};

export default WritingRoomPage;