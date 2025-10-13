// packages/client/src/api/worlds.ts

/**
 * @file This file contains all API calls related to Worlds.
 * @description It uses the configured apiClient to communicate with the
 * /projects/:projectId/worlds endpoints on the backend.
 */

import apiClient from './index';
import type { World } from 'aetherquill-common';

type CreateWorldPayload = Omit<World, 'id'>;
type UpdateWorldPayload = Omit<World, 'id'>;

/**
 * Sends a request to create a new world within a specific project.
 *
 * @param projectId The ID of the project to add the world to.
 * @param worldData The data for the new world.
 * @returns A promise that resolves with the newly created World object from the server.
 */
export const createWorld = async (
    projectId: string,
    worldData: CreateWorldPayload,
): Promise<World> => {
    const response = await apiClient.post(
        `/projects/${projectId}/worlds`,
        worldData,
    );
    return response.data;
};

/**
 * Sends a request to update an existing world.
 *
 * @param projectId The ID of the project containing the world.
 * @param worldId The ID of the world to update.
 * @param worldData The new data for the world.
 * @returns A promise that resolves with the fully updated World object.
 */
export const updateWorld = async (
    projectId: string,
    worldId: string,
    worldData: UpdateWorldPayload,
): Promise<World> => {
    const response = await apiClient.put(
        `/projects/${projectId}/worlds/${worldId}`,
        worldData,
    );
    return response.data;
};

/**
 * Sends a request to delete a world.
 *
 * @param projectId The ID of the project containing the world.
 * @param worldId The ID of the world to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteWorld = async (
    projectId: string,
    worldId: string,
): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/worlds/${worldId}`);
};