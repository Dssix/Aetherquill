import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type TimelineEvent } from '../data/timelineEvents.ts';
import { type Character } from '../types/character.ts';
import { type WritingEntry } from '../stores/useWritingStore.ts';

interface TimelineNodeProps {
    event: TimelineEvent;
    isActive: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    characters: Character[];
    writings: WritingEntry[];
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ event, isActive, onClick, onEdit, onDelete, characters, writings }) => {
    // --- Step 1: Summon the magic from @dnd-kit ---
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: event.id });

    // This style object applies the movement transformations.
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 10 : 'auto',
    };

    const linkedChars = event.linkedCharacterIds?.map(id => characters.find(c => c.id === id)?.name).filter(Boolean);
    const linkedWritings = event.linkedWritingIds?.map(id => writings.find(w => w.id === id)?.title).filter(Boolean);

    return (
        <div ref={setNodeRef} style={style} className="relative group flex items-start gap-2">
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab touch-none pt-1 text-muted-foreground/50 hover:text-accent"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </div>
            <div className="relative group">
                <div  className={`
                    absolute top-1 
                    left-[calc(var(--timeline-dot-offset)_*_(-1))] -translate-x-1/2 
                    w-3 h-3 rounded-full transition-all duration-300 ease-in-out
                    group-hover:bg-accent/70
                    ${isActive
                    ? 'bg-accent scale-110 shadow-primary-glow'
                    : 'bg-muted'
                }
                `}/>
                <div>
                    <button onClick={onClick} className="w-full text-left" aria-expanded={isActive}>
                        <div>
                            <p className="text-sm text-muted-foreground">{event.displayDate}</p>
                            <h3 className="text-xl font-bold text-foreground leading-tight">{event.title}</h3>
                            {event.tags && event.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {event.tags.map(tag => (
                                        <span key={tag} className="text-xs ...">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </button>

                    <div className={`grid transition-grid-rows ... ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        <div className="overflow-hidden">
                            <div className="mt-4">
                                <div className="bg-card/50 p-4 rounded-md border border-border shadow-inner">
                                    <div className="prose prose-sm ...">
                                        <p>{event.description}</p>
                                    </div>

                                    {/* --- THIS IS THE NEW SECTION FOR LINKS --- */}
                                    {(linkedChars && linkedChars.length > 0 || linkedWritings && linkedWritings.length > 0) && (
                                        <div className="mt-3 pt-3 border-t border-border text-xs text-foreground/70 space-y-1">
                                            {linkedChars && linkedChars.length > 0 && <p><strong>🧝 Participants:</strong> {linkedChars.join(', ')}</p>}
                                            {linkedWritings && linkedWritings.length > 0 && <p><strong>✍️ Sources:</strong> {linkedWritings.join(', ')}</p>}
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                                        <button onClick={onEdit} className="text-xs bg-card px-2 py-1 rounded border border-border hover:border-accent">
                                            Edit
                                        </button>
                                        <button onClick={onDelete} className="text-xs bg-card px-2 py-1 rounded border border-border text-destructive hover:border-destructive">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TimelineNode;