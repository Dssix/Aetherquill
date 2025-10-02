// src/data/timelineEvents.ts
import type {TimelineEvent} from "aetherquill-common";

// We migrate our old data to this new format.
// The old absolute dates are now descriptive, relative 'displayDate' strings.
export const timelineEvents: TimelineEvent[] = [
    {
        id: 'evt_842_winters_reign',
        eraId: 'era_1', // Belongs to "The Age of Beginnings"
        displayDate: "Year 1, Winter's Reign",
        order: 1,
        title: "The Coronation of the Sunless King",
        description: "In the heart of the frozen north, a new ruler ascends the Onyx Throne...",
        tags: ["Politics", "North"],
    },
    {
        id: 'evt_843_springs_thaw',
        eraId: 'era_1', // Belongs to "The Age of Beginnings"
        displayDate: "Year 2, Spring's Thaw",
        order: 2,
        title: "The Whispering Woods Awaken",
        description: "Ancient spirits stir in the Eldwood as the snows recede...",
        tags: ["Magic", "Prophecy"],
    },
    {
        id: 'evt_845_summers_zenith',
        eraId: 'era_2', // Belongs to "The Sundered Age"
        displayDate: "1st Year of the Broken Pact",
        order: 3,
        title: "The Great Tournament at Silverpeak",
        description: "Knights and champions from across the land gather for the centennial games...",
        tags: ["Conflict", "Alliances"],
    },
    {
        id: 'evt_845_autumns_veil',
        eraId: 'era_2', // Belongs to "The Sundered Age"
        displayDate: "1st Year, Harvest Moon",
        order: 4,
        title: "A Secret Pact is Sealed",
        description: "Beneath the harvest moon, a clandestine meeting between two rival houses...",
        tags: ["Intrigue", "Politics"],
    },
];