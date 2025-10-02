import React, { useState, useEffect } from 'react';
import { type Era } from 'aetherquill-common';
import Button from './ui/Button.tsx';

// The props define the contract for this component.
interface EraFormProps {
    onClose: () => void;
    onSubmit: (data: Omit<Era, 'id' | 'order'>) => void;
    initialData?: Era | null;
}

export const EraForm: React.FC<EraFormProps> = ({ onClose, onSubmit, initialData }) => {
    // The form holds its own data in a state variable.
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // This effect pre-fills the form if we are editing an existing Era.
    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [initialData]);

    // This handler validates and submits the data.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('An Era must have a name.');
            return;
        }
        onSubmit({ name, description });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form
                onSubmit={handleSubmit}
                className="relative bg-background p-8 rounded-lg shadow-2xl w-full max-w-lg border border-accent/50 animate-fade-in-down"
            >
                <h2 className="text-3xl text-foreground mb-6 font-serif">{initialData ? 'Edit Era' : 'Define New Era'}</h2>
                <div className="space-y-4">
                    <input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Era Name (e.g., The Age of Sundering)" className="w-full p-2 bg-card/70 border-b-2 border-border focus:outline-none focus:border-primary" />
                    <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of this age..." rows={4} className="w-full p-2 bg-card/70 border-b-2 border-border focus:outline-none focus:border-primary" />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Era</Button>
                </div>
            </form>
        </div>
    );
};