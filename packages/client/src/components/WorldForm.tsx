import React, { useState, useEffect } from 'react';
import {
    type World,
    type Character,
    type WritingEntry,
    type TimelineEvent
} from 'aetherquill-common';
import Button from './ui/Button.tsx';
import EntityLinker from './ui/EntityLinker.tsx';

interface WorldFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<World, 'id'>) => void;
    worldToEdit?: World | null;
    characters: Character[];
    writings: WritingEntry[];
    events: TimelineEvent[];
}

const WorldForm: React.FC<WorldFormProps> = ({ isOpen, onClose, onSave, worldToEdit, characters, writings, events }) => {

    // State for all form fields
    const [formData, setFormData] = useState({ name: '', theme: '', setting: '', description: '' });
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const [linkedWritingIds, setLinkedWritingIds] = useState<string[]>([]);
    const [linkedEventIds, setLinkedEventIds] = useState<string[]>([]);

    // Effect to pre-fill the form for editing or reset it for creation
    useEffect(() => {
        if (isOpen) {
            if (worldToEdit) {
                setFormData({
                    name: worldToEdit.name,
                    theme: worldToEdit.theme,
                    setting: worldToEdit.setting,
                    description: worldToEdit.description,
                });
                setLinkedCharacterIds(worldToEdit.linkedCharacterIds || []);
                setLinkedWritingIds(worldToEdit.linkedWritingIds || []);
                setLinkedEventIds(worldToEdit.linkedEventIds || []);
            } else {
                setFormData({ name: '', theme: '', setting: '', description: '' });
                setLinkedCharacterIds([]);
                setLinkedWritingIds([]);
                setLinkedEventIds([]);
            }
        }
    }, [isOpen, worldToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('A name is required to forge a new world.');
            return;
        }
        onSave({ ...formData, linkedCharacterIds, linkedWritingIds, linkedEventIds });
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-40 ... ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-background ... ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
                    <h2 className="text-3xl font-bold text-foreground font-serif mb-6">{worldToEdit ? 'Edit Realm' : 'Forge a New World'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                        {/* Column 1: Core Details */}
                        <div className="space-y-4">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="World Name..." className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                            <input name="theme" value={formData.theme} onChange={handleChange} placeholder="Theme..." className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                            <input name="setting" value={formData.setting} onChange={handleChange} placeholder="Setting..." className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description..." rows={8} className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                        </div>
                        {/* Column 2: Entity Links */}
                        <div className="space-y-4">
                            <EntityLinker label="Link Characters" options={characters} selectedIds={linkedCharacterIds} onSelectionChange={setLinkedCharacterIds} />
                            <EntityLinker label="Link Writings" options={writings.map(w => ({ id: w.id, name: w.title }))} selectedIds={linkedWritingIds} onSelectionChange={setLinkedWritingIds} />
                            <EntityLinker label="Link Events" options={events.map(e => ({ id: e.id, name: e.title }))} selectedIds={linkedEventIds} onSelectionChange={setLinkedEventIds} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{worldToEdit ? 'Save Changes' : 'Forge World'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorldForm;