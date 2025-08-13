// src/components/ui/EntityLinker.tsx
import React, { useState, useMemo } from 'react';

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
    const [searchQuery, setSearchQuery] = useState('');

    const selectedOptions = useMemo(
        () => options.filter(opt => selectedIds.includes(opt.id)),
        [options, selectedIds]
    );

    // The second list contains the filtered, searchable options.
    // It excludes already selected items and matches against the search query.
    const filteredOptions = useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return options.filter(opt =>
            !selectedIds.includes(opt.id) &&
            opt.name.toLowerCase().includes(lowerCaseQuery)
        );
    }, [options, selectedIds, searchQuery]);

    // The toggle handler remains the same, as its logic is already perfect.
    const handleToggle = (optionId: string) => {
        const newSelection = selectedIds.includes(optionId)
            ? selectedIds.filter(id => id !== optionId)
            : [...selectedIds, optionId];
        onSelectionChange(newSelection);
    };

    return (
        <label className="block">
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>

            {/* --- Step 3: The New, Structured UI --- */}
            <div className="w-full mt-1 bg-input/50 border-2 border-border rounded-md flex flex-col h-40">

                {/* --- The list of ALREADY SELECTED items --- */}
                <div className="p-2 border-b-2 border-border flex-shrink-0">
                    {selectedOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {selectedOptions.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleToggle(option.id)}
                                    className="flex items-center gap-1 text-xs bg-primary/80 text-primary-foreground px-2 py-0.5 rounded-full hover:bg-destructive"
                                    title={`Click to remove ${option.name}`}
                                >
                                    <span>{option.name}</span>
                                    <span>&times;</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground italic px-1">No items selected.</p>
                    )}
                </div>

                {/* --- The SEARCHABLE list of available options --- */}
                <div className="flex-grow overflow-y-auto">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search to add..."
                        className="w-full p-2 text-sm bg-transparent focus:outline-none border-b border-border sticky top-0"
                    />
                    <div className="p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <button
                                    type="button"
                                    key={option.id}
                                    onClick={() => handleToggle(option.id)}
                                    className="w-full text-left p-1 rounded transition-colors text-sm hover:bg-primary/10"
                                >
                                    {option.name}
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground italic p-1">No matching items found.</p>
                        )}
                    </div>
                </div>
            </div>
        </label>
    );
};

export default EntityLinker;