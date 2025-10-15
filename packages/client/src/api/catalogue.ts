// packages/client/src/api/catalogue.ts

/**
 * @file This file contains all API calls related to Catalogue Items.
 * @description It uses the configured apiClient to communicate with the
 * /projects/:projectId/catalogue endpoints on the backend.
 */

import apiClient from './index';
import type { CatalogueItem } from 'aetherquill-common';

type CreateCatalogueItemPayload = Omit<CatalogueItem, 'id'>;
type UpdateCatalogueItemPayload = Partial<Omit<CatalogueItem, 'id'>>;

/**
 * Sends a request to create a new Catalogue Item within a specific project.
 *
 * @param projectId The ID of the project to add the item to.
 * @param itemData The data for the new item.
 * @returns A promise that resolves with the newly created CatalogueItem object from the server.
 */
export const createCatalogueItem = async (
    projectId: string,
    itemData: CreateCatalogueItemPayload,
): Promise<CatalogueItem> => {
    const response = await apiClient.post(
        `/projects/${projectId}/catalogue`,
        itemData,
    );
    return response.data;
};

/**
 * Sends a request to update an existing Catalogue Item.
 *
 * @param projectId The ID of the project containing the item.
 * @param itemId The ID of the item to update.
 * @param itemData The new data for the item.
 * @returns A promise that resolves with the fully updated CatalogueItem object.
 */
export const updateCatalogueItem = async (
    projectId: string,
    itemId: string,
    itemData: UpdateCatalogueItemPayload,
): Promise<CatalogueItem> => {
    const response = await apiClient.put(
        `/projects/${projectId}/catalogue/${itemId}`,
        itemData,
    );
    return response.data;
};

/**
 * Sends a request to delete a Catalogue Item.
 *
 * @param projectId The ID of the project containing the item.
 * @param itemId The ID of the item to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteCatalogueItem = async (
    projectId: string,
    itemId: string,
): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/catalogue/${itemId}`);
};