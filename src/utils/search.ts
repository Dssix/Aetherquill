import Fuse from 'fuse.js';
import { type ProjectData } from '../dataModels/userData';
import { type Character } from '../types/character';
import { type World } from '../types/world';
import { type WritingEntry } from '../stores/useWritingStore';
import { type TimelineEvent } from '../data/timelineEvents';

// --- Step 1: The Unified Blueprint for Searching ---
// We define a common shape that all our entities can be mapped to.
// This is the key to removing the 'any' type.
type SearchableEntity = {
    id: string;
    name: string; // Generic property for 'name' or 'title'
    type: 'Character' | 'World' | 'Writing' | 'Event';
    // We include all possible fields we want to search on.
    species?: string;
    theme?: string;
    setting?: string;
    description?: string;
    content?: string;
    tags?: string[];
    // We also include the original object for easy access later.
    original: Character | World | WritingEntry | TimelineEvent;
};

// The blueprint for a search result remains the same.
export interface SearchResult {
    id: string;
    name: string;
    type: 'Character' | 'World' | 'Writing' | 'Event';
    context: string;
    path: string;
}

// This is the main, corrected search spell.
export const performSearch = (project: ProjectData, query: string): SearchResult[] => {
    if (!query.trim()) {
        return [];
    }

    // Map all entities to our new, unified type
    // This creates a clean, consistent list for Fuse.js to work with.
    const allEntities: SearchableEntity[] = [
        ...project.characters.map(c => ({
            ...c,
            name: c.name,
            type: 'Character' as const, // We assert this is a constant, not just a string
            original: c,
        })),
        ...project.worlds.map(w => ({
            ...w,
            name: w.name,
            type: 'World' as const, // Asserting here as well
            original: w,
        })),
        ...project.writings.map(w => ({
            ...w,
            name: w.title,
            type: 'Writing' as const, // And here
            original: w,
        })),
        ...project.timeline.map(e => ({
            ...e,
            name: e.title,
            type: 'Event' as const, // And finally here
            original: e,
        })),
    ];

    // The Fuse.js configuration remains the same, but now it operates on a strongly-typed array.
    const fuse = new Fuse(allEntities, {
        keys: [
            { name: 'name', weight: 2 }, // This now correctly searches 'name' and 'title'
            { name: 'species', weight: 1 },
            { name: 'theme', weight: 1 },
            { name: 'setting', weight: 1 },
            { name: 'description', weight: 0.5 },
            { name: 'content', weight: 0.5 },
            { name: 'tags', weight: 1.5 },
        ],
        includeScore: true,
        threshold: 0.4,
    });

    const results = fuse.search(query);

    // --- Step 3: Transform the results into our final format ---
    // The logic is now cleaner because we can read the 'type' directly.
    return results.map(result => {
        const item = result.item; // This is now a 'SearchableEntity'
        const originalItem = item.original;
        let context = '';
        let path = '';

        switch (item.type) {
            case 'Character':
                context = (originalItem as Character).species;
                path = '/characters';
                break;
            case 'World':
                context = (originalItem as World).theme;
                path = '/worlds';
                break;
            case 'Writing':
                context = new Date((originalItem as WritingEntry).updatedAt).toLocaleDateString();
                path = `/writing/${originalItem.id}`;
                break;
            case 'Event':
                context = (originalItem as TimelineEvent).date;
                path = '/timeline';
                break;
        }

        return {
            id: item.id,
            name: item.name,
            type: item.type,
            context,
            path,
        };
    });
};