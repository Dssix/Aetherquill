// packages/client/src/api/timeline.ts

/**
 * @file This file contains all API calls related to Timeline Events.
 * @description It uses the configured apiClient to communicate with the nested
 * timeline event endpoints on the backend.
 */

import apiClient from './index';
import type {TimelineEvent} from 'aetherquill-common';

type CreateEventPayload = Omit<TimelineEvent, 'id' | 'order' | 'eraId'>;
type UpdateEventPayload = Partial<Omit<TimelineEvent, 'id'>>;
interface ReorderEventsPayload {
    orderedIds: string[];
}

/**
 * Sends a request to create a new Timeline Event within a specific Era.
 *
 * @param projectId The ID of the project.
 * @param eraId The ID of the parent Era.
 * @param eventData The data for the new event.
 * @returns A promise that resolves with the newly created TimelineEvent object.
 */
export const createEvent = async (
    projectId: string,
    eraId: string,
    eventData: CreateEventPayload,
): Promise<TimelineEvent> => {
    const response = await apiClient.post(
        `/projects/${projectId}/eras/${eraId}/events`,
        eventData,
    );
    return response.data;
};

/**
 * Sends a request to update an existing Timeline Event.
 *
 * @param projectId The ID of the project.
 * @param eventId The ID of the event to update.
 * @param eventData The new data for the event.
 * @returns A promise that resolves with the fully updated TimelineEvent object.
 */
export const updateEvent = async (
    projectId: string,
    eventId: string,
    eventData: UpdateEventPayload,
): Promise<TimelineEvent> => {
    const response = await apiClient.put(
        `/projects/${projectId}/timeline/${eventId}`,
        eventData,
    );
    return response.data;
};

/**
 * Sends a request to delete a Timeline Event.
 *
 * @param projectId The ID of the project.
 * @param eventId The ID of the event to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteEvent = async (
    projectId: string,
    eventId: string,
): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/timeline/${eventId}`);
};

/**
 * Sends a request to reorder all Events within a specific Era.
 *
 * @param projectId The ID of the project.
 * @param eraId The ID of the Era whose events are to be reordered.
 * @param payload An object containing an array of Event IDs in the new order.
 * @returns A promise that resolves with the array of all timeline events for the project.
 */
export const reorderEventsInEra = async (
    projectId: string,
    eraId: string,
    payload: ReorderEventsPayload,
): Promise<TimelineEvent[]> => {
    const response = await apiClient.post(
        `/projects/${projectId}/eras/${eraId}/events/reorder`,
        payload,
    );
    return response.data;
};