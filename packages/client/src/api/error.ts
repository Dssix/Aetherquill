// packages/client/src/api/error.ts

/**
 * @file Defines a type-safe structure for handling Axios API errors.
 * @description By creating a specific type for our API errors, we can
 * access properties like `err.response.data.message` without resorting to
 * the unsafe `any` type, satisfying the linter and improving code safety.
 */

import { AxiosError } from 'axios';

/**
 * Represents the structure of the error response body sent from our NestJS backend.
 * This should match the error format defined in our API specification.
 */
interface ApiErrorData {
    statusCode: number;
    message: string;
    error: string;
}

/**
 * Extends the default AxiosError to be aware of our specific API error data structure.
 * This allows us to safely access `error.response.data`.
 */
export type AppAxiosError = AxiosError<ApiErrorData>;