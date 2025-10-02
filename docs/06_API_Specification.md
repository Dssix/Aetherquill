# Scroll VI: The Grand Library's Blueprints - API Specification

This document defines the complete REST API for the Aetherquill Cloud Sanctum. It is the contract between the frontend client and the backend server.

## 1. Core Principles

All endpoints and data transfers will adhere to these fundamental rules.

### Base URL

All API endpoints are prefixed with `/api/v1`. The version `v1` ensures we can evolve the API in the future without breaking older clients.

-   **Example:** `https://api.aetherquill.io/api/v1/projects`

### Authentication

-   All endpoints, except for `POST /auth/register` and `POST /auth/login`, are protected and require authentication.
-   Authentication is handled via a **JSON Web Token (JWT)**.
-   The JWT must be included in the `Authorization` header of every protected request, using the `Bearer` scheme.
    -   **Format:** `Authorization: Bearer <your_jwt_here>`

### Data Format

-   All request bodies must be sent as `application/json`.
-   All response bodies will be returned as `application/json`.

### Standard Response Structure

To ensure predictability, all API responses will follow a consistent structure.

**On Success (HTTP `200 OK`, `201 Created`):**

The response will contain a `data` key with the requested payload.

```json
{
  "data": { ... } // or [ ... ] for a list
}
```

**On Error (HTTP `4xx` or `5xx`):**

The response will contain an `error` key with details about the failure.

```json
{
  "error": {
    "statusCode": 404,
    "message": "Project with ID 'project-123' not found.",
    "details": "..." // Optional additional details
  }
}
```

### Common HTTP Status Codes

-   `200 OK`: The request was successful (e.g., for `GET` or `PUT`).
-   `201 Created`: A new resource was successfully created (for `POST`).
-   `204 No Content`: The request was successful, but there is no data to return (e.g., for `DELETE`).
-   `400 Bad Request`: The request was malformed (e.g., missing required fields).
-   `401 Unauthorized`: The request lacks a valid JWT.
-   `403 Forbidden`: The user is authenticated but does not have permission to access this resource.
-   `404 Not Found`: The requested resource does not exist.
-   `500 Internal Server Error`: A critical error occurred on the server.

---

## 2. Authentication Endpoints (`/auth`)

These endpoints are the gateway to the Grand Library.

### `POST /auth/register`

-   **Description:** Creates a new user account.
-   **Request Body:**
    ```json
    {
      "username": "luna_scribe",
      "password": "a_strong_password"
    }
    ```
-   **Success Response (`201 Created`):**
    ```json
    {
      "data": {
        "message": "User registered successfully."
      }
    }
    ```

### `POST /auth/login`

-   **Description:** Authenticates a user and returns a JWT.
-   **Request Body:**
    ```json
    {
      "username": "luna_scribe",
      "password": "a_strong_password"
    }
    ```
-   **Success Response (`200 OK`):**
    ```json
    {
      "data": {
        "accessToken": "ey...", // The JSON Web Token
        "user": {
          "username": "luna_scribe"
        }
      }
    }
    ```

---

## 3. User Data Endpoint (`/me`)

This endpoint provides all data associated with the currently authenticated user.

### `GET /me/data`

-   **Description:** Fetches the complete `UserData` object for the logged-in user. This single call will be used to populate the Zustand store on application load.
-   **Request Body:** None.
-   **Success Response (`200 OK`):**
    ```json
    {
      "data": {
        // The complete UserData object, matching the TypeScript interface
        "username": "luna_scribe",
        "projects": {
          "project-123": { ... },
          "project-456": { ... }
        }
      }
    }
    ```

---

## 4. Project Endpoints (`/projects`)

Endpoints for managing a user's projects. The user is identified by their JWT.

### `POST /projects`

-   **Description:** Creates a new project for the current user.
-   **Request Body:**
    ```json
    {
      "name": "The Sunstone Chronicle"
    }
    ```
-   **Success Response (`201 Created`):** Returns the newly created `ProjectData` object.
    ```json
    {
      "data": {
        "projectId": "new-project-uuid",
        "name": "The Sunstone Chronicle",
        "eras": [],
        "timeline": [],
        "characters": [],
        "worlds": [],
        "writings": []
      }
    }
    ```

### `PUT /projects/{projectId}`

-   **Description:** Updates a project's details (e.g., renaming it).
-   **URL Parameters:**
    -   `projectId`: The ID of the project to update.
-   **Request Body:**
    ```json
    {
      "name": "The Moonstone Chronicle"
    }
    ```
-   **Success Response (`200 OK`):** Returns the fully updated `ProjectData` object.

### `DELETE /projects/{projectId}`

-   **Description:** Deletes an entire project and all its associated data.
-   **URL Parameters:**
    -   `projectId`: The ID of the project to delete.
-   **Success Response (`204 No Content`):** No body content.

---

## 5. Entity Endpoints (Scoped by Project)

These endpoints manage the core entities within a specific project. All are prefixed with `/projects/{projectId}`.

### Characters (`.../characters`)

-   **`GET /projects/{projectId}/characters`**: Get a list of all characters in a project.
-   **`POST /projects/{projectId}/characters`**: Create a new character.
    -   *Request Body:* A partial `Character` object (e.g., `{ name, species, traits }`). The server generates the `id`.
    -   *Success Response (`201 Created`):* The complete, newly created `Character` object.
-   **`PUT /projects/{projectId}/characters/{characterId}`**: Update an existing character.
    -   *Request Body:* A partial `Character` object with the fields to update.
    -   *Success Response (`200 OK`):* The complete, updated `Character` object.
-   **`DELETE /projects/{projectId}/characters/{characterId}`**: Delete a character.
    -   *Success Response (`204 No Content`)*

### Worlds (`.../worlds`)

-   **`GET /projects/{projectId}/worlds`**: Get a list of all worlds.
-   **`POST /projects/{projectId}/worlds`**: Create a new world.
-   **`PUT /projects/{projectId}/worlds/{worldId}`**: Update a world.
-   **`DELETE /projects/{projectId}/worlds/{worldId}`**: Delete a world.
    *(Request/Response structures follow the same pattern as Characters, using the `World` data model.)*

### Writings (`.../writings`)

-   **`GET /projects/{projectId}/writings`**: Get a list of all writing entries.
-   **`POST /projects/{projectId}/writings`**: Create a new writing entry.
-   **`PUT /projects/{projectId}/writings/{writingId}`**: Update a writing entry.
-   **`DELETE /projects/{projectId}/writings/{writingId}`**: Delete a writing entry.
    *(Request/Response structures follow the same pattern as Characters, using the `WritingEntry` data model.)*

### Timeline: Eras (`.../eras`)

-   **`GET /projects/{projectId}/eras`**: Get a list of all eras.
-   **`POST /projects/{projectId}/eras`**: Create a new era.
-   **`PUT /projects/{projectId}/eras/{eraId}`**: Update an era.
-   **`DELETE /projects/{projectId}/eras/{eraId}`**: Delete an era.
-   **`POST /projects/{projectId}/eras/reorder`**: Reorders all eras in a project.
    -   **Description:** A special endpoint to handle the drag-and-drop reordering.
    -   **Request Body:** An array of era IDs in their new, desired order.
        ```json
        {
          "orderedIds": ["era-3", "era-1", "era-2"]
        }
        ```
    -   **Success Response (`200 OK`):** Returns the updated list of all eras with their new `order` properties.

### Timeline: Events (`.../timeline`)

-   **`GET /projects/{projectId}/timeline`**: Get a list of all timeline events.
-   **`POST /projects/{projectId}/timeline`**: Create a new timeline event.
-   **`PUT /projects/{projectId}/timeline/{eventId}`**: Update a timeline event.
-   **`DELETE /projects/{projectId}/timeline/{eventId}`**: Delete a timeline event.
-   **`POST /projects/{projectId}/eras/{eraId}/events/reorder`**: Reorders all events within a specific era.
    -   **Description:** A special endpoint to handle reordering events within one era.
    -   **Request Body:** An array of event IDs in their new order.
        ```json
        {
          "orderedIds": ["event-c", "event-a", "event-b"]
        }
        ```
    -   **Success Response (`200 OK`):** Returns the updated list of events for that era.