import { type CatalogueItem } from './catalogue.js';
import { type Era } from './era.js'
import { type TimelineEvent } from './timeline.js';
import { type WritingEntry } from './writing.js';
import { type World } from './world.js';
import { type Character } from './character.js';

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