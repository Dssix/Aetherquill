// packages/client/src/api/index.ts

/**
 * @file This file configures and exports the central Axios instance for all API communications.
 * @description By centralizing the Axios configuration, we can easily set base URLs,
 * manage authentication headers, and implement interceptors for logging or error handling
 * in one consistent location.
 */

import axios from 'axios';

// Create a new Axios instance with a custom configuration.
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

// Export the configured instance as the default export.
export default apiClient;