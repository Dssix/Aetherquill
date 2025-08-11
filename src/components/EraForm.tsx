import React, { useState, useEffect } from 'react';
import { type Era } from '../data/eraManager';

// The props define the contract for this component.
interface EraFormProps {
    onClose: () => void;
    onSubmit: (data: Omit<Era, 'id'>) => void;
    initialData?: Era | null;
}

export const EraForm: React.FC<EraFormProps> = ({ onClose, onSubmit, initialData }) => {
    // The form holds its own data in a state variable.
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '' });

    // This effect pre-fills the form if we are editing an existing Era.
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                startDate: initialData.startDate,
                endDate: initialData.endDate,
            });
        }
    }, [initialData]);

    // This generic handler updates the form's state as the user types.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // This handler validates and submits the data.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate || !formData.endDate) {
            alert('All fields are required to define an Era.');
            return;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            alert('The start date must come before the end date.');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-background p-8 rounded-lg shadow-2xl w-full max-w-lg border border-gold-leaf/50 animate-fade-in-down">
                <h2 className="text-3xl text-foreground mb-6 font-serif">{initialData ? 'Edit Era' : 'Define New Era'}</h2>
                <div className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="Era Name" className="w-full p-2 bg-card/70 border-b-2 border-border focus:outline-none focus:border-primary" />

                    <div className="flex gap-4">
                        <label className="flex-1">
                            <span className="text-xs text-foreground/70">Start Date</span>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full p-2 bg-card/70 border-b-2 border-border focus:outline-none focus:border-primary" />
                        </label>
                        <label className="flex-1">
                            <span className="text-xs text-foreground/70">End Date</span>
                            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full p-2 bg-card/70 border-b-2 border-border focus:outline-none focus:border-primary" />
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-foreground hover:bg-ink-brown/10">Cancel</button>
                    <button type="submit" className="px-6 py-2 rounded bg-gold-leaf text-foreground hover:opacity-90 shadow-md">Save Era</button>
                </div>
            </form>
        </div>
    );
};