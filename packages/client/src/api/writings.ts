// packages/client/src/api/writings.ts

/**
 * @file This file contains all API calls related to Writing Entries.
 * @description It uses the configured apiClient to communicate with the
 * /projects/:projectId/writings endpoints on the backend.
 */

import apiClient from './index';
import type { WritingEntry } from 'aetherquill-common';

// Define the shape of the data sent when creating a new writing entry.
type CreateWritingPayload = Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>;

// Define the shape of the data sent when updating an existing entry.
type UpdateWritingPayload = Partial<Omit<WritingEntry, 'id'>>;

/**
 * Sends a request to create a new writing entry within a specific project.
 *
 * @param projectId The ID of the project to add the entry to.
 * @param writingData The data for the new entry (title, content, tags).
 * @returns A promise that resolves with the newly created WritingEntry object from the server.
 */
export const createWriting = async (
    projectId: string,
    writingData: CreateWritingPayload,
): Promise<WritingEntry> => {
    const response = await apiClient.post(
        `/projects/${projectId}/writings`,
        writingData,
    );
    return response.data;
};

/**
 * Sends a request to update an existing writing entry.
 *
 * @param projectId The ID of the project containing the entry.
 * @param writingId The ID of the entry to update.
 * @param writingData The new data for the entry.
 * @returns A promise that resolves with the fully updated WritingEntry object.
 */
export const updateWriting = async (
    projectId: string,
    writingId: string,
    writingData: UpdateWritingPayload,
): Promise<WritingEntry> => {
    const response = await apiClient.put(
        `/projects/${projectId}/writings/${writingId}`,
        writingData,
    );
    return response.data;
};

/**
 * Sends a request to delete a writing entry.
 *
 * @param projectId The ID of the project containing the entry.
 * @param writingId The ID of the entry to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteWriting = async (
    projectId: string,
    writingId: string,
): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/writings/${writingId}`);
};