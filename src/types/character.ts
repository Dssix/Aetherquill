export interface CharacterTrait {
    id: string;
    label: string;
    value: string;
    isCustom: boolean;
    isTextarea: boolean;
}

// --- CHARACTER INTERFACE ---
export interface Character {
    id:string;
    name: string;
    species: string;
    // These properties MUST be present for the panel to work.
    linkedWorldId: string | null;
    linkedEventIds?: string[];
    linkedWritingIds?: string[];
    traits: CharacterTrait[];
}