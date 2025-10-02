import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Era } from '../data/eraManager.ts';

// The props contract is updated to include the onDelete function.
interface EraDividerProps {
    era: Era;
    onEdit: () => void;
    onDelete: () => void;
}

const EraDivider: React.FC<EraDividerProps> = ({ era, onEdit, onDelete }) => {
    // --- Step 1: Summon the magic from @dnd-kit ---
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: era.id });

    // This style object applies the movement transformations.
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1, // Make it slightly transparent while dragging
        zIndex: isDragging ? 10 : 'auto',
    };
    return (
        <div ref={setNodeRef} style={style} className="flex items-center my-6 group relative">
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none p-2 -ml-2 text-muted-foreground/50 hover:text-accent"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </div>

            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="text-center mx-4">
                <h2 className="text-xl font-bold text-primary tracking-widest uppercase">{era.name}</h2>
                {/* The description is now shown instead of the date range. */}
                {era.description && (
                    <p className="text-xs text-muted-foreground italic mt-1">{era.description}</p>
                )}
            </div>
            <div className="flex-grow h-px bg-gradient-to-l from-transparent via-border to-transparent"></div>

            {era.id !== 'no-era' && (
                // We add a container for the buttons.
                <div className="absolute right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="text-xs bg-card px-2 py-1 rounded border border-border hover:border-accent">
                        Edit
                    </button>
                    <button onClick={onDelete} className="text-xs bg-card px-2 py-1 rounded border border-border text-destructive hover:border-destructive">
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default EraDivider;