# Scroll VII: The Forge's Foundation - Backend Principles

This document codifies the core architectural decisions, tools, and workflows that will govern the construction of the Aetherquill backend. It is a binding agreement to ensure a smooth, secure, and maintainable development process.

---

## 1. The Database Foundation: MongoDB

The official database for the Aetherquill Cloud Sanctum will be **MongoDB**.

-   **Rationale:** As a document-based NoSQL database, MongoDB's data model is a near-perfect mirror of our existing JSON-based `UserData` and `ProjectData` structures. This choice avoids the complexities of object-relational mapping (ORM) and allows for a more natural and efficient persistence of our core entities.
-   **Development Environment:** For local development, we will use a **Docker container** running a MongoDB instance. This provides a free, isolated, and consistent database environment that works offline and perfectly replicates a production setup.
-   **Production Environment:** When the time comes to deploy, we will utilize a managed cloud service such as **MongoDB Atlas**. This provides a clear and scalable path from local development to a globally available, production-grade database.

---

## 2. The Workshop's Layout: NestJS Standard Architecture

The backend server's directory structure will strictly adhere to the best practices and conventions established by the NestJS framework. This ensures our "workshop" is always clean, organized, and easy to navigate.

-   **Core Principle:** The application will be divided into distinct **Modules**, each responsible for a specific domain (e.g., `auth`, `projects`, `characters`).
-   **Separation of Concerns:** Within each module, responsibilities will be clearly separated into three primary file types:
    -   **Controllers (`*.controller.ts`):** The "Gatekeepers." They are responsible for handling incoming HTTP requests, validating incoming data, and returning responses. They define our API endpoints.
    -   **Services (`*.service.ts`):** The "Master Craftsmen." They contain the core business logic. They are responsible for interacting with the database and performing the actual work (e.g., creating a character, fetching a project).
    -   **Modules (`*.module.ts`):** The "Chamber Blueprints." They bundle the controllers and services of a specific feature together into a cohesive unit.
  -   **Example Structure (`/packages/server/src/`):**
      ```
      src/
      ├── app.module.ts         # The root module of the application
      ├── main.ts               # The application entry point
      │
      ├── auth/                 # Feature module for Authentication
      │   ├── auth.controller.ts
      │   ├── auth.module.ts
      │   └── auth.service.ts
      │
      └── projects/             # The main feature module for managing all projects AND their contents
          ├── projects.controller.ts      # Handles /projects, /projects/{id}/characters, /projects/{id}/catalogue, etc.
          ├── projects.module.ts
          └── projects.service.ts         # Contains all business logic for projects, characters, worlds, catalogue, etc.
      ```
      
---

## 3. The Master Templates: Shared `common` Package

To ensure absolute type safety and consistency between the frontend and backend, we will create a dedicated, shared workspace.

-   **Location:** A new directory will be created at `/packages/common`.
-   **Purpose:** This package will be the **single source of truth** for all shared data structures. It will contain the TypeScript `interface` definitions for our core models (`UserData`, `ProjectData`, `Character`, `World`, etc.).
-   **Implementation:** Both the `/packages/client` and `/packages/server` workspaces will list `/packages/common` as a local dependency. This allows both applications to import types from the same source, eliminating the possibility of data structure mismatches.

---

## 4. The Keeper of Secrets: Environment Variables

All sensitive information, such as database credentials and cryptographic secrets, will be managed securely and will **never** be committed to the source code repository.

-   **Mechanism:** We will use **environment variables** loaded from a `.env` file.
-   **Location:** A file named `.env` will be created in the root of the `/packages/server` directory.
-   **Security:** The `.env` file **must** be added to the project's root `.gitignore` file to prevent it from ever being checked into version control.
-   **Implementation:** The `@nestjs/config` package will be used within our NestJS application to load and provide these variables in a type-safe manner.
-   **Example `.env` File:**
    ```
    # Database Configuration
    DATABASE_URL="mongodb://localhost:27017/aetherquill"

    # JWT Authentication Secrets
    JWT_SECRET="a_very_long_and_cryptographically_random_secret_string"
    JWT_EXPIRES_IN="7d"
    ```

---

## 5. The City Gates: Cross-Origin Resource Sharing (CORS)

To allow our browser-based frontend to communicate with our backend server (which run on different origins/ports), we must configure a CORS policy.

-   **Rationale:** Web browsers enforce a "Same-Origin Policy" for security. Our server must explicitly grant permission to the browser to accept requests from the frontend's domain.
-   **Implementation:** CORS will be enabled in the NestJS application's entry point (`main.ts`).
-   **Environment-Specific Configuration:** The allowed origin **must not** be hard-coded. It will be controlled by an environment variable to allow for different settings in development and production without code changes.
-   **Configuration via `.env`:** We will add a new variable to our `.env` file for this purpose.
    -   **For Local Development:**
        ```
        # CORS Configuration
        CLIENT_URL="http://localhost:5173"
        ```
    -   **For Production (Example):**
        ```
        # CORS Configuration
        CLIENT_URL="https://aetherquill.io"
        ```