// packages/client/src/api/index.ts

/**
 * @file This file configures and exports the central Axios instance for all API communications.
 * @description By centralizing the Axios configuration, we can easily set base URLs,
 * manage authentication headers, and implement interceptors for logging or error handling
 * in one consistent location.
 */

import axios from 'axios';
import { getAuthToken } from './token';

// 1. Create a new Axios instance with a custom configuration.
const apiClient = axios.create({
    /**
     * The base URL for all API requests.
     * This is read from the environment variables, ensuring that the application
     * can be pointed to different backends for development, staging, and production
     * without changing the codebase.
     */
    baseURL: import.meta.env.VITE_API_URL,

    /**
     * This setting is crucial for allowing the browser to send cookies
     * and authentication headers with cross-origin requests.
     */
    withCredentials: true,
});

// --- The Interceptor Enchantment ---
// 2. We add an interceptor that runs before each request is sent.
apiClient.interceptors.request.use(
    (config) => {
        // Retrieve the token from our in-memory vault.
        const token = getAuthToken();

        // If a token exists, we add the 'Authorization' header to the request.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // The modified config is returned for axios to use.
        return config;
    },
    (error) => {
        // If an error occurs during the request setup, we reject the promise.
        return Promise.reject(error);
    },
);

// 2. Export the configured instance as the default export.
export default apiClient;