import React, { useState, useEffect } from 'react';
import { type Character } from '../../types/character.ts';
import { type World } from '../../types/world.ts';
import { type WritingEntry } from '../../stores/useWritingStore.ts';
import Button from '../ui/Button.tsx';
import Card from '../ui/Card.tsx';

// The unified blueprint for any field that can be reordered.
type ReorderableField = {
    id: string;
    label: string;
    value: string;
    isCustom: boolean;
    placeholder: string;
    isTextarea: boolean;
};

// The component's props contract.
interface AddCharacterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (characterData: Omit<Character, 'id'>) => void;
    characterToEdit?: Character | null;
    worlds: World[];
    writings: WritingEntry[];
}

// A helper component for the fixed fields.
const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <label className="block">
        <span className="text-sm font-semibold text-muted-foreground">{label}</span>
        {children}
    </label>
);

const AddCharacterPanel: React.FC<AddCharacterPanelProps> = ({ isOpen, onClose, onSave, characterToEdit, worlds, writings }) => {

    // State for fixed, non-reorderable fields.
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('');
    const [linkedWorldId, setLinkedWorldId] = useState<string | null>(null);
    const [linkedWritingIds, setLinkedWritingIds] = useState<string[]>([]);
    const [reorderableFields, setReorderableFields] = useState<ReorderableField[]>([]);

    // Helper function to get the default set of reorderable fields.
    const getDefaultReorderableFields = (): ReorderableField[] => [
        { id: 'appearance', label: 'Appearance', value: '', isCustom: false, placeholder: 'Their physical form, attire, and bearing...', isTextarea: true },
        { id: 'background', label: 'Background', value: '', isCustom: false, placeholder: 'The story of their past...', isTextarea: true },
        { id: 'description', label: 'Notes', value: '', isCustom: false, placeholder: 'Additional notes and secrets...', isTextarea: true },
    ];

    // Effect to reset the form when the panel opens.
    useEffect(() => {
        if (isOpen) {
            if (characterToEdit) {
                // Pre-fill the fixed fields
                setName(characterToEdit.name);
                setSpecies(characterToEdit.species);
                setLinkedWorldId(characterToEdit.linkedWorldId);
                setLinkedWritingIds(characterToEdit.linkedWritingIds || []);

                const fieldsForEditing = characterToEdit.traits.map(trait => ({
                    ...trait,
                    placeholder: trait.isCustom ? 'Value...' : `The character's ${trait.label.toLowerCase()}...`,
                }));
                setReorderableFields(fieldsForEditing);

            } else {
                // Reset all fields for a new character
                setName('');
                setSpecies('');
                setLinkedWorldId(null);
                setLinkedWritingIds([]);
                setReorderableFields(getDefaultReorderableFields());
            }
        }
    }, [isOpen, characterToEdit]);

    // --- Handler Functions ---
    const handleReorderableFieldChange = (id: string, newValue: string) => {
        setReorderableFields(prev => prev.map(f => f.id === id ? { ...f, value: newValue } : f));
    };
    const handleCustomLabelChange = (id: string, newLabel: string) => {
        setReorderableFields(prev => prev.map(f => f.id === id ? { ...f, label: newLabel } : f));
    };
    const handleWritingToggle = (writingId: string) => {
        setLinkedWritingIds(prevIds => {
            // If the ID is already in the array, remove it (deselect).
            if (prevIds.includes(writingId)) {
                return prevIds.filter(id => id !== writingId);
            } else {
                // Otherwise, add it to the array (select).
                return [...prevIds, writingId];
            }
        });
    };
    const handleAddCustomField = () => {
        const newField: ReorderableField = {
            id: `custom_${Date.now()}`,
            label: '',
            value: '',
            isCustom: true,
            placeholder: 'Value...',
            isTextarea: false,
        };
        setReorderableFields(prev => [...prev, newField]);
    };
    const handleRemoveField = (id: string) => {
        setReorderableFields(prev => prev.filter(f => f.id !== id));
    };
    const moveField = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= reorderableFields.length) return;
        const newFields = [...reorderableFields];
        [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
        setReorderableFields(newFields);
    };

    // --- Submission Logic ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('A name is required to bind a new soul.');
            return;
        }

        const finalCharacterData: Omit<Character, 'id'> = {
            name,
            species,
            linkedWorldId,
            linkedWritingIds,
            traits: reorderableFields
                .filter(f => f.isCustom ? f.label.trim() !== '' && f.value.trim() !== '' : true)
                .map(({ id, label, value, isCustom, isTextarea }) => ({
                    id,
                    label,
                    value,
                    isCustom,
                    isTextarea,
                })),
        };

        onSave(finalCharacterData);
        onClose();
    };

    // --- The Complete and Styled JSX ---
    return (
        <div className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-background shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
                    <h2 className="text-3xl font-bold text-foreground font-serif mb-6 flex-shrink-0">Craft a New Soul</h2>

                    <div className="flex-grow space-y-6 overflow-y-auto pr-2">
                        <Card className="!bg-card/70">
                            <div className="space-y-4">
                                <FormField label="Name">
                                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What is thy name, noble soul?" className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary" />
                                </FormField>
                                <FormField label="Species">
                                    <input value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="e.g., Human, Elf, Star-forged Automaton" className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"/>
                                </FormField>
                                <FormField label="Inhabits World">
                                    <select
                                        value={linkedWorldId || ''}
                                        onChange={(e) => setLinkedWorldId(e.target.value || null)}
                                        className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary"
                                    >
                                        <option value="">None</option>
                                        {worlds.map(world => (
                                            <option key={world.id} value={world.id}>{world.name}</option>
                                        ))}
                                    </select>
                                </FormField>
                                <FormField label="Mentioned in Writings">
                                    {/* --- INTUITIVE LISTBOX --- */}
                                    <div className="w-full p-2 h-32 bg-input/50 border-2 border-border rounded-md overflow-y-auto">
                                        {writings.length > 0 ? (
                                            // We map over all available writings to create a list of clickable buttons.
                                            writings.map(writing => {
                                                // We check if the current writing is in our list of selected IDs.
                                                const isActive = linkedWritingIds.includes(writing.id);
                                                return (
                                                    <button
                                                        type="button" // Important to prevent form submission
                                                        key={writing.id}
                                                        onClick={() => handleWritingToggle(writing.id)}
                                                        className={`
                                                            w-full text-left p-1 rounded transition-colors text-sm
                                                            ${isActive
                                                            ? 'bg-gold-leaf/30 text-foreground font-semibold' // Style for ACTIVE (selected) items
                                                            : 'hover:bg-gold-leaf/10 text-muted-foreground'      // Style for INACTIVE items
                                                        }`}
                                                    >{writing.title}
                                                    </button>
                                                );
                                            })) : (<p className="text-sm text-muted-foreground italic p-1">No manuscripts exist yet.</p>)}
                                    </div>
                                </FormField>
                            </div>
                        </Card>

                        <Card className="!bg-card/70">
                            <div className="space-y-4">
                                {reorderableFields.map((field, index) => (
                                    <div key={field.id} className="p-2 border border-border rounded-md bg-background/50">
                                        <div className="flex items-start gap-2">
                                            <div className="flex flex-col items-center pt-1 text-muted-foreground">
                                                <button type="button" onClick={() => moveField(index, 'up')} disabled={index === 0} className="disabled:opacity-20 hover:text-accent">▲</button>
                                                <button type="button" onClick={() => moveField(index, 'down')} disabled={index === reorderableFields.length - 1} className="disabled:opacity-20 hover:text-accent">▼</button>
                                            </div>
                                            <div className="flex-grow">
                                                {field.isCustom ? (
                                                    <input value={field.label} onChange={(e) => handleCustomLabelChange(field.id, e.target.value)} placeholder="Custom Label..." className="w-full p-1 mb-1 text-sm font-semibold bg-transparent border-b border-border focus:outline-none focus:border-primary/50" />
                                                ) : (
                                                    <label className="text-sm font-semibold text-muted-foreground block mb-1">{field.label}</label>
                                                )}
                                                {field.isTextarea ? (
                                                    <textarea value={field.value} onChange={(e) => handleReorderableFieldChange(field.id, e.target.value)} rows={4} placeholder={field.placeholder} className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary text-sm" />
                                                ) : (
                                                    <input value={field.value} onChange={(e) => handleReorderableFieldChange(field.id, e.target.value)} placeholder={field.placeholder} className="w-full p-2 mt-1 bg-input/50 border-b-2 border-border focus:outline-none focus:border-primary text-sm" />
                                                )}
                                            </div>
                                            {field.isCustom && (
                                                <button type="button" onClick={() => handleRemoveField(field.id)} className="text-destructive hover:text-destructive/80 p-1 rounded-full hover:bg-red-500/10 transition-colors flex-shrink-0" title="Remove Field">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center mt-4">
                                <Button type="button" variant="secondary" className="!px-3 !py-1 text-xs" onClick={handleAddCustomField}>
                                    + Add Custom Field
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className="mt-auto pt-6 flex justify-end gap-4 border-t border-border flex-shrink-0">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Bind This Soul</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCharacterPanel;