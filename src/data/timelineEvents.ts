export interface TimelineEvent {
    id: string;
    eraId: string | null;
    date: string;
    title: string;
    description: string;
    tags?: string[];
    linkedCharacterIds?: string[];
    linkedWritingIds?: string[];
}

// The data is updated to match the new structure.
export const timelineEvents: TimelineEvent[] = [
    {
        id: 'evt_842_winters_reign',
        eraId: 'era_800_900',
        date: "0842-12-21",
        title: "The Coronation of the Sunless King",
        description: "In the heart of the frozen north, a new ruler ascends the Onyx Throne...",
        tags: ["Politics", "North"],
    },
    {
        id: 'evt_843_springs_thaw',
        eraId: 'era_800_900',
        date: "0843-03-20",
        title: "The Whispering Woods Awaken",
        description: "Ancient spirits stir in the Eldwood as the snows recede...",
        tags: ["Magic", "Prophecy"],
    },
    {
        id: 'evt_845_summers_zenith',
        eraId: 'era_900_1000',
        date: "0845-06-21",
        title: "The Great Tournament at Silverpeak",
        description: "Knights and champions from across the land gather for the centennial games...",
        tags: ["Conflict", "Alliances"],
    },
    {
        id: 'evt_845_autumns_veil',
        eraId: 'era_900_1000',
        date: "0845-09-22",
        title: "A Secret Pact is Sealed",
        description: "Beneath the harvest moon, a clandestine meeting between two rival houses...",
        tags: ["Intrigue", "Politics"],
    },
];