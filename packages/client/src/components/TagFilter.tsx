import React from 'react';

interface TagFilterProps {
    allTags: string[];
    selectedTags: string[];
    onTagChange: (tag: string) => void;
    onClear: () => void;
    className?: string; // Allow a className to be passed in.
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, selectedTags, onTagChange, onClear, className = '' }) => {
    return (
        // Apply the passed-in className to the root element.
        <div className={`bg-card/60 p-4 rounded-lg border border-border mb-8 ${className}`}>
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-foreground">Filter Chronicle by Tag</h4>
                {selectedTags.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-sm text-primary hover:text-foreground transition-colors duration-300"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => onTagChange(tag)}
                            className={`
                                px-3 py-1 rounded-full text-sm border transition-all duration-200
                                ${isSelected
                                ? 'bg-gold-leaf text-parchment-highlight border-gold-leaf shadow-md'
                                : 'bg-transparent text-muted-foreground border-border hover:border-ink-brown/50 hover:bg-ink-brown/5'
                            }`
                            }
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TagFilter;