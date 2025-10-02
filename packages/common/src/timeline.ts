export interface TimelineEvent {
    id: string;
    eraId: string; // An event MUST now belong to an Era. It can no longer be null.
    // --- RENAMED PROPERTY ---
    displayDate: string; // Replaces 'date'. This is a simple string like "15th Day of the Sun's Height".
    order: number;
    title: string;
    description: string;
    tags?: string[];
    linkedCharacterIds?: string[];
    linkedWritingIds?: string[];
}