import { type Character } from '../types/character';
import { type World } from '../types/world';
import { type WritingEntry } from '../stores/useWritingStore';
import { type TimelineEvent } from '../data/timelineEvents';
import { type Era } from '../data/eraManager';

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
}

// This is the blueprint for a single user's entire collection of data.
export interface UserData {
    username: string;
    projects: {
        // A dictionary-like structure for quick project lookups by ID.
        [projectId: string]: ProjectData;
    };
}