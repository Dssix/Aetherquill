// packages/client/src/api/characters.ts

/**
 * @file This file contains all API calls related to Characters.
 * @description It uses the configured apiClient to communicate with the
 * /projects/:projectId/characters endpoints on the backend.
 */

import apiClient from './index';
import type { Character } from 'aetherquill-common';

// The DTO for creating a character is complex, so we'll import it from the store later.
// For now, we can define a partial type for clarity.
type CreateCharacterPayload = Omit<Character, 'id'>;
type UpdateCharacterPayload = Omit<Character, 'id'>;

/**
 * Sends a request to create a new character within a specific project.
 *
 * @param projectId The ID of the project to add the character to.
 * @param characterData The data for the new character.
 * @returns A promise that resolves with the newly created Character object from the server.
 */
export const createCharacter = async (
    projectId: string,
    characterData: CreateCharacterPayload,
): Promise<Character> => {
    const response = await apiClient.post(
        `/projects/${projectId}/characters`,
        characterData,
    );
    return response.data;
};

/**
 * Sends a request to update an existing character.
 *
 * @param projectId The ID of the project containing the character.
 * @param characterId The ID of the character to update.
 * @param characterData The new data for the character.
 * @returns A promise that resolves with the fully updated Character object.
 */
export const updateCharacter = async (
    projectId: string,
    characterId: string,
    characterData: UpdateCharacterPayload,
): Promise<Character> => {
    const response = await apiClient.put(
        `/projects/${projectId}/characters/${characterId}`,
        characterData,
    );
    return response.data;
};

/**
 * Sends a request to delete a character.
 *
 * @param projectId The ID of the project containing the character.
 * @param characterId The ID of the character to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteCharacter = async (
    projectId: string,
    characterId: string,
): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/characters/${characterId}`);
};