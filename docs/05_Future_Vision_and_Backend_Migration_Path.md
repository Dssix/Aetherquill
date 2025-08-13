# Scroll V: Future Vision & Backend Migration Path

This document outlines the current state of Aetherquill v1.0 and provides a clear architectural roadmap for its evolution into a full-stack, cloud-backed application ("Version 2.0").

---

## 1. Aetherquill v1.0: A Complete Local-First Scriptorium

As of now, Aetherquill is a **feature-complete, local-first, single-user application.**

-   **Functionality:** It provides a robust and interconnected suite of tools for managing users, projects, characters, worlds, timelines, and writings.
-   **Persistence:** All data is reliably persisted in the browser's `localStorage`, with a data structure that is already designed for a user- and project-scoped world.
-   **User Experience:** The application is polished with a consistent design system, a beautiful dark mode, global search, breadcrumbs, and other quality-of-life enhancements.

The work of building the frontend experience is, for all intents and purposes, **done**.

---

## 2. The Vision for v2.0: The Cloud Sanctum

The next grand milestone is to transform Aetherquill into a full-stack application, allowing for:

-   **Data Synchronization:** A user can access their chronicles from any device.
-   **Data Safety:** User data is safely stored in a secure, remote database, protecting it from accidental browser data clearing.
-   **Collaboration (Future):** The architecture will pave the way for future collaborative features between scribes.

---

## 3. The Path of Migration: A Deliberate Refactoring

The current architecture was explicitly designed to make this future migration as seamless as possible. The core principle is the **separation of concerns**: our UI is almost completely decoupled from the data persistence layer.

The migration will be a focused replacement of the application's "data layer," with minimal changes required for the UI.

### **Step 1: Forge the Backend (The New Master Library)**

A backend server must be created. The recommended path is a **REST API** built with a robust, typed framework.

-   **Recommended Stacks:**
    -   **Node.js with NestJS:** Offers the immense advantage of using TypeScript across the entire stack, allowing for shared types and a smoother development experience.
    -   **Java with Spring Boot:** Offers enterprise-grade robustness, security, and powerful database tools (JPA/Hibernate), making it an excellent choice for a long-term, scalable project.
-   **Database:** A NoSQL database like **Firestore** or **MongoDB** is a natural fit, as their document-based structure perfectly mirrors our existing `UserData` -> `ProjectData` JSON object model.
-   **Authentication:** The backend will be responsible for true user authentication (e.g., email/password or OAuth). Upon successful login, it will issue a **JSON Web Token (JWT)** to the frontend.

### **Step 2: Reforge the Data Utilities (The Messengers)**

The files in `src/utils/` are the primary target for refactoring.

-   **`storage.ts`:** Every function in this file (`loadUserData`, `saveUserData`, `addUsernameToList`) will be **deleted**.
-   **New `api.ts` (or similar):** A new utility file will be created. It will contain asynchronous functions that use `fetch` or `axios` to communicate with the new backend API.
    -   It will be responsible for attaching the user's JWT to the header of every authenticated request.
    -   It will have functions like `fetchUserData(username)`, `createProject(projectData)`, `updateCharacter(characterData)`, etc.

### **Step 3: Upgrade the Librarian (`useAppStore.ts`)**

The `useAppStore` will be transformed from a data owner into a **smart data cache**.

-   **Asynchronous Actions:** Every single data modification action (`addCharacter`, `updateProject`, etc.) will be converted to an `async` function.
-   **The New Spell:**
    1.  The action is called by the UI (e.g., `addCharacter`).
    2.  It immediately makes an `async` API call to the backend using the new `api.ts` utility.
    3.  It will likely set a "loading" state (e.g., `set({ isLoading: true })`).
    4.  **Upon a successful response from the backend**, it then calls `set()` to update the local Zustand state with the new data, which refreshes the UI.
    5.  It will then turn off the loading state.
-   **Initial Load:** The `login` action will no longer call `loadUserData` from `localStorage`. It will call the new `fetchUserData` from our API service.

### **Step 4: The Untouched Fortress (What Does NOT Change)**

This is the most important part. Because of our careful architecture, the vast majority of our work is safe.

-   **All UI Components (`Card`, `Button`, `EntityLinker`, Panels, etc.):** **NO CHANGES NEEDED.** They are "dumb" and receive data as props. They do not care where that data comes from.
-   **All Page Layouts (`CharacterPage`, `DashboardPage`, etc.):** **MINIMAL CHANGES NEEDED.** The only change will be to potentially add UI elements to handle the new "loading" states (e.g., showing a spinner while data is being saved). The overall structure and rendering logic will remain the same.
-   **All Data Blueprints (`character.ts`, `world.ts`, etc.):** **NO CHANGES NEEDED.** These TypeScript interfaces become the shared contract between the frontend and the backend.

The Great Refactoring of v1.0 has already prepared Aetherquill for this future. The path is clear.