// packages/client/src/api/projects.ts

/**
 * @file This file contains all the API calls related to Projects.
 * @description It uses the configured apiClient to communicate with the /projects
 * endpoints on the backend, handling creation, updates, and deletion of projects.
 * The JWT is automatically attached to these requests by the axios interceptor.
 */

import apiClient from './index';
import type { ProjectData } from 'aetherquill-common';

/**
 * Represents the data required to create a new project.
 */
interface CreateProjectPayload {
    name: string;
}

/**
 * Sends a request to the backend to create a new project.
 *
 * @param projectData An object containing the new project's name.
 * @returns A promise that resolves with the newly created ProjectData object from the server.
 */
export const createProject = async (
    projectData: CreateProjectPayload,
): Promise<ProjectData> => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
};

/**
 * Represents the data required to update a project.
 */
interface UpdateProjectPayload {
    name: string;
}

/**
 * Sends a request to the backend to update an existing project.
 *
 * @param projectId The ID of the project to update.
 * @param projectData An object containing the project's new name.
 * @returns A promise that resolves with the fully updated ProjectData object.
 */
export const updateProject = async (
    projectId: string,
    projectData: UpdateProjectPayload,
): Promise<ProjectData> => {
    const response = await apiClient.put(`/projects/${projectId}`, projectData);
    return response.data;
};

/**
 * Sends a request to the backend to delete a project.
 *
 * @param projectId The ID of the project to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteProject = async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`);
};