// This is the blueprint for any item in the user's catalogue,
// be it a creature, a plant, an artifact, or a concept.
export interface CatalogueItem {
    id: string;
    name: string;
    category: string; // The user-defined category, e.g., "Creatures", "Plants", "Artifacts"
    description: string;

    // --- The Web of Echoes ---
    // A catalogue item can be linked to other entities.
    linkedCharacterIds?: string[];
    linkedWorldId?: string | null;
    linkedEventIds?: string[];
    linkedWritingIds?: string[];
}