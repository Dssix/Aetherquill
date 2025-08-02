// src/components/ui/EntityLinker.tsx
import React from 'react';

interface LinkableEntity {
    id: string;
    name: string; // We'll use this as a generic property for titles or names
}

interface EntityLinkerProps {
    label: string;
    options: LinkableEntity[];
    selectedIds: string[];
    onSelectionChange: (selectedIds: string[]) => void;
}

const EntityLinker: React.FC<EntityLinkerProps> = ({ label, options, selectedIds, onSelectionChange }) => {
    const handleToggle = (optionId: string) => {
        const newSelection = selectedIds.includes(optionId)
            ? selectedIds.filter(id => id !== optionId)
            : [...selectedIds, optionId];
        onSelectionChange(newSelection);
    };

    return (
        <label className="block">
            <span className="text-sm font-semibold text-ink-brown/80">{label}</span>
            <div className="w-full p-2 mt-1 h-32 bg-parchment/70 border-2 border-ink-brown/20 rounded-md overflow-y-auto">
                {options.length > 0 ? (
                    options.map(option => {
                        const isActive = selectedIds.includes(option.id);
                        return (
                            <button
                                type="button"
                                key={option.id}
                                onClick={() => handleToggle(option.id)}
                                className={`w-full text-left p-1 rounded transition-colors text-sm ${isActive ? 'bg-gold-leaf/30 text-ink-brown font-semibold' : 'hover:bg-gold-leaf/10'}`}
                            >
                                {option.name}
                            </button>
                        );
                    })
                ) : (
                    <p className="text-sm text-ink-brown/60 italic p-1">None available.</p>
                )}
            </div>
        </label>
    );
};

export default EntityLinker;