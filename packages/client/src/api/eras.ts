// packages/client/src/api/eras.ts

/**
 * @file This file contains all API calls related to Eras.
 * @description It uses the configured apiClient to communicate with the
 * /projects/:projectId/eras endpoints on the backend.
 */

import apiClient from './index';
import type { Era } from 'aetherquill-common';

type CreateEraPayload = Omit<Era, 'id' | 'order'>;
type UpdateEraPayload = Partial<Omit<Era, 'id'>>;
interface ReorderErasPayload {
    orderedIds: string[];
}

/**
 * Sends a request to create a new Era within a specific project.
 *
 * @param projectId The ID of the project to add the Era to.
 * @param eraData The data for the new Era.
 * @returns A promise that resolves with the newly created Era object from the server.
 */
export const createEra = async (
    projectId: string,
    eraData: CreateEraPayload,
): Promise<Era> => {
    const response = await apiClient.post(`/projects/${projectId}/eras`, eraData);
    return response.data;
};

/**
 * Sends a request to update an existing Era.
 *
 * @param projectId The ID of the project containing the Era.
 * @param eraId The ID of the Era to update.
 * @param eraData The new data for the Era.
 * @returns A promise that resolves with the fully updated Era object.
 */
export const updateEra = async (
    projectId: string,
    eraId: string,
    eraData: UpdateEraPayload,
): Promise<Era> => {
    const response = await apiClient.put(
        `/projects/${projectId}/eras/${eraId}`,
        eraData,
    );
    return response.data;
};

/**
 * Sends a request to delete an Era.
 *
 * @param projectId The ID of the project containing the Era.
 * @param eraId The ID of the Era to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteEra = async (
    projectId: string,
    eraId: string,
): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/eras/${eraId}`);
};

/**
 * Sends a request to reorder all Eras in a project.
 *
 * @param projectId The ID of the project whose Eras are to be reordered.
 * @param payload An object containing an array of Era IDs in the new order.
 * @returns A promise that resolves with the array of all Eras in their new, updated order.
 */
export const reorderEras = async (
    projectId: string,
    payload: ReorderErasPayload,
): Promise<Era[]> => {
    const response = await apiClient.post(
        `/projects/${projectId}/eras/reorder`,
        payload,
    );
    return response.data;
};