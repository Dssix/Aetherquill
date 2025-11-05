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

/**
 * Defines the shape of the credentials required for registration.
 * For now, it's identical to login, but could be extended in the future
 * with fields like 'email'.
 */
export type RegisterCredentials = LoginCredentials;

/**
 * Sends a registration request to the backend with the provided credentials.
 *
 * @param credentials An object containing the new user's username and password.
 * @returns A promise that resolves with the success message from the server.
 */
export const registerUser = async (
    credentials: RegisterCredentials,
): Promise<{ message: string }> => {
    // Use the apiClient to make a POST request to the /auth/register endpoint.
    const response = await apiClient.post('/auth/register', credentials);
    return response.data;
};

/**
 * Sends a logout request to the backend.
 * This will invalidate the user's session by clearing the auth cookie.
 * @returns A promise that resolves when the logout is successful.
 */
export const logoutUser = async (): Promise<void> => {
    // The cookie is sent automatically by the browser. We just need to hit the endpoint.
    await apiClient.post('/auth/logout');
};