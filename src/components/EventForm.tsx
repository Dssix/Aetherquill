import React, { useState, useEffect } from 'react';
import { type TimelineEvent } from '../data/timelineEvents';
import { type Character } from '../types/character'; // For props
import { type WritingEntry } from '../stores/useWritingStore';
import Button from './ui/Button';
import EntityLinker from './ui/EntityLinker';

// The props contract is updated to handle the new data.
interface EventFormProps {
    onClose: () => void;
    onSubmit: (data: Omit<TimelineEvent, 'id' | 'eraId'>) => void;
    initialData?: TimelineEvent | null;
    characters: Character[];
    writings: WritingEntry[];
}

export const EventForm: React.FC<EventFormProps> = ({ onClose, onSubmit, initialData, characters, writings }) => {

    // State for the form's data.
    const [formData, setFormData] = useState({ title: '', date: '', tags: '', description: '' });
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const [linkedWritingIds, setLinkedWritingIds] = useState<string[]>([]);

    // Update useEffect to pre-fill and reset the new link states.
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                date: initialData.date,
                tags: initialData.tags?.join(', ') || '',
                description: initialData.description,
            });
            setLinkedCharacterIds(initialData.linkedCharacterIds || []);
            setLinkedWritingIds(initialData.linkedWritingIds || []);
        } else {
            setFormData({ title: '', date: '', tags: '', description: '' });
            setLinkedCharacterIds([]);
            setLinkedWritingIds([]);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Update handleSubmit to include the new links in the saved data.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.date) {
            alert('A Title and Date are required for every entry.');
            return;
        }
        const submissionData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            linkedCharacterIds,
            linkedWritingIds,
        };
        onSubmit(submissionData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-parchment p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-4xl border border-gold-leaf/50 animate-fade-in-down flex flex-col h-[90vh]">
                <h2 className="text-3xl text-ink-brown mb-6 font-serif flex-shrink-0">{initialData ? 'Edit Chronicle Entry' : 'Add New Entry'}</h2>

                <div className="grid md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                    {/* Column 1: Core Details */}
                    <div className="space-y-4">
                        <input name="title" value={formData.title} onChange={handleChange} placeholder="Event Title" className="w-full p-2 ... transition-colors" />
                        <label>
                            <span className="text-xs text-ink-brown/70">Event Date</span>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 ... transition-colors" />
                        </label>
                        <input name="tags" value={formData.tags} onChange={handleChange} placeholder="Tags (comma, separated)" className="w-full p-2 ... transition-colors" />
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description..." rows={10} className="w-full p-2 ... transition-colors" />
                    </div>

                    {/* Column 2: Entity Links */}
                    <div className="space-y-4">
                        <EntityLinker label="Link Characters" options={characters} selectedIds={linkedCharacterIds} onSelectionChange={setLinkedCharacterIds} />
                        <EntityLinker label="Link Writings" options={writings.map(w => ({ id: w.id, name: w.title }))} selectedIds={linkedWritingIds} onSelectionChange={setLinkedWritingIds} />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6 flex-shrink-0">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Entry</Button>
                </div>
            </form>
        </div>
    );
};