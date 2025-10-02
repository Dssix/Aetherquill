import React, {useState, useEffect, useMemo} from 'react';
import { type WritingEntry } from '../../stores/useWritingStore.ts';
import Button from '../ui/Button.tsx';
import EntityLinker from '../ui/EntityLinker.tsx';
import type {Character} from "../../types/character.ts";
import type {World} from "../../types/world.ts";
import type {TimelineEvent} from "../../data/timelineEvents.ts";

interface WritingEditorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
    writingToEdit?: WritingEntry | null;
    characters: Character[];
    worlds: World[];
    events: TimelineEvent[];
}

const WritingEditorPanel: React.FC<WritingEditorPanelProps> = ({ isOpen, onClose, onSave, writingToEdit, characters, worlds, events }) => {

    const characterOptions = useMemo(() =>
            characters.map(c => ({ id: c.id, name: c.name }))
        , [characters]);

    const eventOptions = useMemo(() =>
            events.map(e => ({ id: e.id, name: e.title }))
        , [events]);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const [linkedWorldId, setLinkedWorldId] = useState<string | null>(null);
    const [linkedEventIds, setLinkedEventIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            if (writingToEdit) {
                setTitle(writingToEdit.title);
                setContent(writingToEdit.content);
                setTags(writingToEdit.tags?.join(', ') || '');
                setLinkedCharacterIds(writingToEdit.linkedCharacterIds || []);
                setLinkedWorldId(writingToEdit.linkedWorldId || null);
                setLinkedEventIds(writingToEdit.linkedEventIds || []);
            } else {
                setTitle('');
                setContent('');
                setTags('');
                setLinkedCharacterIds([]);
                setLinkedWorldId(null);
                setLinkedEventIds([]);
            }
        }
    }, [isOpen, writingToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // This is crucial to stop the page from reloading
        if (!title.trim() || !content.trim()) {
            alert('A title and content are required to save this manuscript.');
            return;
        }
        const finalTags = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        onSave({ title, content, tags: finalTags, linkedCharacterIds, linkedWorldId, linkedEventIds });
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-background shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title of thy Manuscript..."
                        className="w-full p-2 text-3xl font-bold font-serif bg-transparent border-b-2 border-border focus:outline-none focus:border-primary mb-4 flex-shrink-0"
                    />
                    <input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags (comma, separated)..."
                        className="w-full p-1 text-sm font-serif bg-transparent border-b border-border focus:outline-none focus:border-primary mb-4 flex-shrink-0"
                    />

                    {/* Two-column layout for editor and live preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-hidden">
                        {/* The Markdown Editor */}
                        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Let thy soul flow onto the page..."
                                className="w-full h-full p-4 bg-card/70 ... flex-grow"
                            />
                            <select
                                value={linkedWorldId || ''}
                                onChange={(e) => setLinkedWorldId(e.target.value || null)}
                                className="w-full p-2 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary flex-shrink-0"
                            >
                                <option value="">Link to a World...</option>
                                {worlds.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>

                        {/* Column 2: Live Preview and Entity Linkers */}
                        <div className="flex flex-col gap-4 overflow-y-auto pr-2">

                            <EntityLinker
                                label="Link Characters"
                                options={characterOptions}
                                selectedIds={linkedCharacterIds}
                                onSelectionChange={setLinkedCharacterIds}
                            />
                            <EntityLinker
                                label="Link Events"
                                options={eventOptions}
                                selectedIds={linkedEventIds}
                                onSelectionChange={setLinkedEventIds}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4 flex-shrink-0">
                        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Manuscript</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WritingEditorPanel;