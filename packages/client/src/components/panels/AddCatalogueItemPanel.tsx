import React, { useState, useEffect } from 'react';
import {
    type CatalogueItem,
    type Character,
    type World,
    type WritingEntry,
    type TimelineEvent
} from 'aetherquill-common';
import Button from '../ui/Button.tsx';
import EntityLinker from '../ui/EntityLinker.tsx';

// The props contract for our new panel.
interface AddCatalogueItemPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Omit<CatalogueItem, 'id'>) => void;
    itemToEdit?: CatalogueItem | null;
    // It needs all the other entities for linking.
    characters: Character[];
    worlds: World[];
    writings: WritingEntry[];
    events: TimelineEvent[];
}

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <label className="block">
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
        {children}
    </label>
);

const AddCatalogueItemPanel: React.FC<AddCatalogueItemPanelProps> = ({
                                                                         isOpen, onClose, onSave, itemToEdit,
                                                                         characters, worlds, writings, events
                                                                     }) => {
    // State for all form fields.
    const [formData, setFormData] = useState({ name: '', category: '', description: '' });
    const [linkedCharacterIds, setLinkedCharacterIds] = useState<string[]>([]);
    const [linkedWorldId, setLinkedWorldId] = useState<string | null>(null);
    const [linkedEventIds, setLinkedEventIds] = useState<string[]>([]);
    const [linkedWritingIds, setLinkedWritingIds] = useState<string[]>([]);

    // Effect to pre-fill or reset the form.
    useEffect(() => {
        if (isOpen) {
            if (itemToEdit) {
                setFormData({
                    name: itemToEdit.name,
                    category: itemToEdit.category,
                    description: itemToEdit.description,
                });
                setLinkedCharacterIds(itemToEdit.linkedCharacterIds || []);
                setLinkedWorldId(itemToEdit.linkedWorldId || null);
                setLinkedEventIds(itemToEdit.linkedEventIds || []);
                setLinkedWritingIds(itemToEdit.linkedWritingIds || []);
            } else {
                setFormData({ name: '', category: '', description: '' });
                setLinkedCharacterIds([]);
                setLinkedWorldId(null);
                setLinkedEventIds([]);
                setLinkedWritingIds([]);
            }
        }
    }, [isOpen, itemToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.category.trim()) {
            alert('A Name and Category are required for every curiosity.');
            return;
        }
        onSave({ ...formData, linkedCharacterIds, linkedWorldId, linkedEventIds, linkedWritingIds });
        onClose();
    };

    return (
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-background shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
                    <h2 className="text-3xl font-bold text-foreground font-serif mb-6">{itemToEdit ? 'Edit Curiosity' : 'Add a New Curiosity'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2">
                        {/* Column 1: Core Details */}
                        <div className="space-y-4">
                            <FormField label="Name">
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Sunpetal Herb, Gryphon" className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary" />
                            </FormField>
                            <FormField label="Category">
                                <input name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Plant, Creature, Artifact" className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary" />
                            </FormField>
                            <FormField label="Description">
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe this curiosity..." rows={8} className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary resize-none" />
                            </FormField>
                            <FormField label="Inhabits World">
                                <select value={linkedWorldId || ''} onChange={(e) => setLinkedWorldId(e.target.value || null)} className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary">
                                    <option value="">None</option>
                                    {worlds.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </FormField>
                        </div>
                        {/* Column 2: Entity Links */}
                        <div className="space-y-4">
                            <EntityLinker label="Link Characters" options={characters} selectedIds={linkedCharacterIds} onSelectionChange={setLinkedCharacterIds} />
                            <EntityLinker label="Link Writings" options={writings.map(w => ({ id: w.id, name: w.title }))} selectedIds={linkedWritingIds} onSelectionChange={setLinkedWritingIds} />
                            <EntityLinker label="Link Events" options={events.map(e => ({ id: e.id, name: e.title }))} selectedIds={linkedEventIds} onSelectionChange={setLinkedEventIds} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4 flex-shrink-0">
                        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit">{itemToEdit ? 'Save Changes' : 'Add to Catalogue'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCatalogueItemPanel;