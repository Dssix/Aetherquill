// packages/client/src/api/token.ts

/**
 * @file A simple in-memory store for the JWT.
 * @description This module provides a secure way to handle the access token
 * without constantly interacting with localStorage. It acts as a private,
 * in-memory vault for the user's session token.
 */

// A private variable to hold the token. It is not directly accessible
// from outside this module, providing a layer of encapsulation.
let accessToken: string | null = null;

/**
 * Stores the JWT in the in-memory vault.
 * @param token The JWT string received from the login API.
 */
export const setAuthToken = (token: string | null) => {
    accessToken = token;
};

/**
 * Retrieves the JWT from the in-memory vault.
 * @returns The stored JWT string, or null if none exists.
 */
export const getAuthToken = (): string | null => {
    return accessToken;
};