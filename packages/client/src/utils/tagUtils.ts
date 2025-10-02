import { type TimelineEvent } from 'aetherquill-common';

/**
 * Scans all timeline events and returns a sorted array of unique tags.
 * @param events - The array of timeline events.
 * @returns A string array of unique tags.
 */
export const getUniqueTags = (events: TimelineEvent[]): string[] => {
    // Use a Set to automatically handle uniqueness.
    const allTags = new Set<string>();

    // Iterate over each event and add its tags to the Set.
    events.forEach(event => {
        event.tags?.forEach(tag => {
            allTags.add(tag);
        });
    });

    // Convert the Set back to an array and sort it for consistent ordering.
    return Array.from(allTags).sort();
};