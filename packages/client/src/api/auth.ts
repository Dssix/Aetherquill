// packages/client/src/api/auth.ts

/**
 * @file This file contains all the API calls related to user authentication.
 * @description It uses the configured apiClient to communicate with the /auth
 * endpoints on the backend, handling user registration and login.
 */

import apiClient from './index';
import type { LoginCredentials } from '../stores/useAppStore'; // We will use the type from the store

/**
 * Represents the structure of the data returned from a successful login request.
 */
interface LoginResponse {
    accessToken: string;
    user: {
        username: string;
    };
}

/**
 * Sends a login request to the backend with the provided user credentials.
 *
 * @param credentials An object containing the user's username and password.
 * @returns A promise that resolves with the login response data, including the JWT.
 */
export const loginUser = async (
    credentials: LoginCredentials,
): Promise<LoginResponse> => {
    // Use the apiClient to make a POST request to the /auth/login endpoint.
    // The response.data will be automatically parsed from JSON.
    const response = await apiClient.post('/auth/login', credentials);

    // We return the data part of the response, which matches our LoginResponse interface.
    return response.data;
};