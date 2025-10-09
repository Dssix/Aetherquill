// In packages/common/src/Character.ts

import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

// Represents a single, reorderable trait within a Character.
export class CharacterTrait {
    /**
     * A unique identifier for the trait.
     * e.g., 'appearance' for a fixed trait, or a UUID for a custom one.
     */
    @IsString()
    @IsNotEmpty()
    id!: string;

    /**
     * The display name for the trait's label.
     * e.g., "Appearance" or "Eye Color".
     */
    @IsString()
    @IsNotEmpty()
    label!: string;

    /**
     * The value or content of the trait. Can be an empty string.
     */
    @IsString()
    value!: string;

    /**
     * A flag to distinguish fixed traits from user-created ones.
     */
    @IsBoolean()
    isCustom!: boolean;

    /**
     * A flag used by the frontend as a rendering hint for the input type.
     */
    @IsBoolean()
    isTextarea!: boolean;
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