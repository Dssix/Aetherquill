// This is the true and final blueprint for a single World object.
export class World {
    id!: string;
    name!: string;
    theme!: string;
    setting!: string;
    description!: string;
    // These properties are required for the links to work.
    linkedCharacterIds?: string[];
    linkedWritingIds?: string[];
    linkedEventIds?: string[];
}