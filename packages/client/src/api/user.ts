// packages/client/src/api/user.ts

import apiClient from './index';
import type { UserData } from 'aetherquill-common';

/**
 * Fetches the complete UserData object for the currently authenticated user.
 * The JWT is attached automatically by the Axios interceptor.
 *
 * @returns A promise that resolves with the complete UserData payload.
 */
export const getUserData = async (): Promise<UserData> => {
    const response = await apiClient.get('/me/data');
    return response.data;
};