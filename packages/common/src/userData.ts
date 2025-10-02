import {
    type Character,
    type World,
    type WritingEntry,
    type TimelineEvent,
    type Era,
    type CatalogueItem
} from '../src/';

// This is the blueprint for a single project.
// It is a container for all the entities that belong to it.
export interface ProjectData {
    projectId: string;
    name: string;
    characters: Character[];
    worlds: World[];
    writings: WritingEntry[];
    timeline: TimelineEvent[];
    eras: Era[];
    catalogue: CatalogueItem[];
}

// This is the blueprint for a single user's entire collection of data.
export interface UserData {
    username: string;
    projects: {
        // A dictionary-like structure for quick project lookups by ID.
        [projectId: string]: ProjectData;
    };
}