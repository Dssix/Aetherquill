import React, { useState, useEffect } from 'react';
import { type TimelineEvent } from '../data/timelineEvents';
import { type Character } from '../types/character';
import { type WritingEntry } from '../stores/useWritingStore';
import { type Era } from '../data/eraManager'; // Import Era
import Button from './ui/Button';
import EntityLinker from './ui/EntityLinker';
import Card from './ui/Card';

// The props contract is updated for the new system.
interface EventFormProps {
    onClose: () => void;
    onSubmit: (data: Omit<TimelineEvent, 'id'>) => void; // It now submits the full object.
    initialData?: TimelineEvent | null;
    characters: Character[];
    writings: WritingEntry[];
    eras: Era[]; // It now requires the list of eras.
}

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <label className="block">
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
        {children}
    </label>
);

export const EventForm: React.FC<EventFormProps> = ({ onClose, onSubmit, initialData, characters, writings, eras }) => {
    // The form state is updated to use 'displayDate' and 'eraId'.
    const [formData, setFormData] = useState({ title: '', displayDate: '', tags: '', description: '' });
    const [eraId, setEraId] = useState<string>(''); // eraId is now a required field.
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const [linkedWritingIds, setLinkedWritingIds] = useState<string[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                displayDate: initialData.displayDate,
                tags: initialData.tags?.join(', ') || '',
                description: initialData.description,
            });
            setEraId(initialData.eraId);
            setLinkedCharacterIds(initialData.linkedCharacterIds || []);
            setLinkedWritingIds(initialData.linkedWritingIds || []);
        } else {
            setFormData({ title: '', displayDate: '', tags: '', description: '' });
            // Default to the first available era when creating a new event.
            setEraId(eras[0]?.id || '');
            setLinkedCharacterIds([]);
            setLinkedWritingIds([]);
        }
    }, [initialData, eras]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !eraId) {
            alert('A Title and an Era are required for every event.');
            return;
        }
        const submissionData = {
            ...formData,
            eraId,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
            linkedCharacterIds,
            linkedWritingIds,
        };
        onSubmit(submissionData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-background p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-4xl border border-accent/50 animate-fade-in-down flex flex-col h-[90vh]">
                <h2 className="text-3xl text-foreground mb-6 font-serif flex-shrink-0">{initialData ? 'Edit Chronicle Entry' : 'Add New Entry'}</h2>

                {/* --- THIS IS THE NEW, STRUCTURED LAYOUT --- */}
                <div className="grid md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                    {/* Column 1: Core Details */}
                    <div className="flex flex-col gap-6">
                        <Card className="!bg-card/70">
                            <div className="space-y-4">
                                <FormField label="Event Title">
                                    <input name="title" value={formData.title} onChange={handleChange} placeholder="e.g., The Coronation" className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                                </FormField>
                                <FormField label="Era">
                                    <select name="eraId" value={eraId} onChange={(e) => setEraId(e.target.value)} className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary">
                                        {eras.length > 0 ? eras.map(era => <option key={era.id} value={era.id}>{era.name}</option>) : <option disabled>Create an Era first</option>}
                                    </select>
                                </FormField>
                                <FormField label="Date Label">
                                    <input name="displayDate" value={formData.displayDate} onChange={handleChange} placeholder="e.g., 15th Day of the Sun's Height" className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                                </FormField>
                                <FormField label="Tags">
                                    <input name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., Politics, Ritual, Betrayal" className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                                </FormField>
                            </div>
                        </Card>
                        <Card className="!bg-card/70 flex-grow">
                            <FormField label="Description">
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the events that transpired..." className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary h-full resize-none"/>
                            </FormField>
                        </Card>
                    </div>

                    {/* Column 2: Entity Links */}
                    <div className="flex flex-col gap-6">
                        <Card className="!bg-card/70 flex-grow">
                            <EntityLinker label="Link Characters" options={characters} selectedIds={linkedCharacterIds} onSelectionChange={setLinkedCharacterIds} />
                        </Card>
                        <Card className="!bg-card/70 flex-grow">
                            <EntityLinker label="Link Writings" options={writings.map(w => ({ id: w.id, name: w.title }))} selectedIds={linkedWritingIds} onSelectionChange={setLinkedWritingIds} />
                        </Card>
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