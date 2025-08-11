import React from 'react';
import { type TimelineEvent } from '../data/timelineEvents';
import { type Character } from '../types/character'; // For props
import { type WritingEntry } from '../stores/useWritingStore';

interface TimelineNodeProps {
    event: TimelineEvent;
    isActive: boolean;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
    // It now receives the data it needs for name lookups.
    characters: Character[];
    writings: WritingEntry[];
}

const TimelineNode: React.FC<TimelineNodeProps> = ({ event, isActive, onClick, onEdit, onDelete, characters, writings }) => {

    // Look up the names of the linked entities.
    const linkedChars = event.linkedCharacterIds?.map(id => characters.find(c => c.id === id)?.name).filter(Boolean);
    const linkedWritings = event.linkedWritingIds?.map(id => writings.find(w => w.id === id)?.title).filter(Boolean);

    return (
        <div className="relative group">
            <div  className={`
        absolute top-1 
        left-[calc(var(--timeline-dot-offset)_*_(-1))] -translate-x-1/2 
        w-3 h-3 rounded-full transition-all duration-300 ease-in-out
        group-hover:bg-accent/70
        ${isActive
                ? 'bg-accent scale-110 shadow-glow'
                : 'bg-muted'
            }
    `}/>
            <div>
                <button onClick={onClick} className="w-full text-left" aria-expanded={isActive}>
                    <div>
                        <p className="text-sm text-foreground/70">{event.date}</p>
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
                                {(linkedChars?.length || linkedWritings?.length) && (
                                    <div className="mt-3 pt-3 border-t border-border text-xs text-foreground/70 space-y-1">
                                        {linkedChars && linkedChars.length > 0 && <p><strong>🧝 Participants:</strong> {linkedChars.join(', ')}</p>}
                                        {linkedWritings && linkedWritings.length > 0 && <p><strong>✍️ Sources:</strong> {linkedWritings.join(', ')}</p>}
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                                    <button onClick={onEdit} className="text-xs ...">Edit</button>
                                    <button onClick={onDelete} className="text-xs ...">Delete</button>
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