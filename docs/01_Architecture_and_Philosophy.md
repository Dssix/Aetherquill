# Scroll I: Architecture & Philosophy of Aetherquill

## 📖 The Scribe's Sanctum: Core Philosophy

Aetherquill is conceived as a **local-first, private, and immersive digital scriptorium** for novelists and world-builders. Its design is guided by three core principles:

1.  **The Sanctum:** The writer's work is sacred and private. The application operates entirely within the browser, persisting all data to `localStorage`. There are no cloud servers, no accounts, and no distractions. It is a personal tool for thought and creation.
2.  **The Atmosphere:** The user interface is crafted to feel like a vintage, candlelit workspace. Every element, from the parchment backgrounds to the serif fonts, is chosen to enhance immersion and inspire creativity, avoiding modern, sterile design trends.
3.  **The Web of Echoes:** The most critical principle. A story's lore is not a collection of isolated lists, but an interconnected web. Aetherquill is architected from the ground up to create, manage, and visualize the links between its core entities: Characters, Worlds, Timeline Events, Writings, and Catalogue Items.

---

## 🏗️ The Grand Architecture: User & Project Scoping

The entire application is built upon a robust, hierarchical data architecture designed for both single-user privacy and future multi-user scalability.

The fundamental structure is **User -> Project -> Entities**.

-   **User:** A "user" is simply a profile name that acts as a key for a top-level data object in `localStorage` (e.g., `aetherquill__user__luna`). This provides perfect data isolation.
-   **Project:** Within each user's data, they can have multiple, distinct projects (or "chronicles"). Each project is a self-contained universe, holding its own set of characters, worlds, etc.
-   **Entities:** All core data objects (characters, worlds, writings, timeline events, eras) belong to one and only one project.

This structure is managed by a single, unified global state store.

---

## 🧠 The Master Librarian: Zustand Global Store (`useAppStore.ts`)

Aetherquill employs a **single, unified global store** powered by Zustand as its central nervous system. This store (`useAppStore`) is the single source of truth for all application-wide state and user data.

-   **Centralized State:** It holds the `currentUser`, the full `userData` object for that user, and the `currentProjectId`.
-   **Scoped Actions:** All data modification actions (e.g., `addCharacter`, `updateWorld`) are defined within this store. These actions are inherently "scoped," meaning they contain the logic to operate only on the data within the `currentUser`'s `currentProjectId`.
-   **Data Flow:** The application follows a strict, unidirectional data flow:
    1.  **Pages** are the only components that speak directly to the `useAppStore` to read data and get actions.
    2.  **Pages** then pass this data and these actions down to child components (like panels and UI elements) as **props**.
    3.  **Child Components** are "dumb." They do not access the global store directly. They receive data and functions as props, perform their task, and call the functions to notify their parent of changes.

---

## 💾 The Eternal Scroll: Data Persistence

All user work is automatically and instantly preserved.

-   **Mechanism:** The `useAppStore` uses a `subscribe` function. This function listens for any change to the `userData` state.
-   **On Change:** Whenever any data is modified (a character is added, a project is renamed, etc.), the subscription is triggered.
-   **Action:** It calls the `saveCurrentUser` action, which takes the entire updated `userData` object and writes it to the appropriate key in `localStorage` using the `saveUserData` utility.
-   **On Load:** When the application starts, a `useEffect` in `App.tsx` checks `localStorage` for a `aetherquill__current_user` key. If found, it loads the corresponding user data back into the Zustand store, seamlessly restoring the user's session.

---

## 🧭 The Guarded Halls: Routing Architecture (`App.tsx`)

Navigation is managed by `react-router-dom` using a sophisticated system of nested and protected routes to ensure a logical and secure user journey.

-   **Layout Route:** A shared `<Layout />` component provides the consistent Header, Footer, and background for all internal pages. It uses an `<Outlet />` to render the specific page content.
-   **Guardian Components:**
    -   **`<ProtectedRoute />`:** Wraps all routes except `/login`. It checks for a `currentUser` in the `useAppStore`. If none exists, it redirects to `/login`.
    -   **`<ProjectScopeRoute />`:** Wraps all routes that deal with specific project data (e.g., `/timeline`, `/characters`). It checks for a `currentProjectId`. If none is set, it redirects to the dashboard (`/`) to force the user to select a project.
-   **The Flow:**
    1.  User lands at `/login`.
    2.  Upon login, they are sent to the Dashboard (`/`).
    3.  Upon selecting a project, `currentProjectId` is set, and they can now access the inner pages like `/project`, `/timeline`, etc.

---

## 🎨 The Spell of Moonlight: Semantic Theming System

Aetherquill features a complete, application-wide light/dark mode system built on a semantic, CSS variable-driven architecture.

-   **`tailwind.config.js`:** The Tailwind color palette is defined with **semantic names** (e.g., `background`, `foreground`, `primary`, `accent`, `border`). These names are mapped to CSS variables (e.g., `bg-background` becomes `background-color: hsl(var(--background))`).
-   **`index.css`:** This file is the single source of truth for all color values. It defines two blocks of CSS variables:
    -   `:root { ... }` defines the HSL values for the default **light theme**.
    -   `.dark { ... }` defines the HSL values for the **dark theme**.
-   **`useAppStore.ts`:** The store holds the current `theme` ('light' or 'dark') and a `toggleTheme` action. The user's preference is persisted to `localStorage`.
-   **`useThemeManager.ts`:** A custom hook runs in `App.tsx`. It subscribes to the `theme` state in the store and is responsible for adding or removing the `.dark` class from the root `<html>` element.
-   **Component Implementation:** All reusable components (`Card`, `Button`, etc.) and pages are styled using only the semantic Tailwind classes (e.g., `bg-card`, `text-foreground`). They **do not** use `dark:` prefixes, making them automatically theme-aware.
---

## 📦 The Grand Scriptorium: Monorepo Architecture

Aetherquill is structured as a **monorepo** using NPM Workspaces. This means the entire project—both the frontend client and the future backend server—lives within a single top-level repository. This approach was chosen for several key benefits:

-   **Unified Workspace:** The entire application can be managed from a single IntelliJ IDEA project and a single terminal, streamlining the development workflow.
-   **Shared Code:** Most importantly, this structure allows for the easy sharing of code between different parts of the application. A dedicated `packages/common` directory can be created to hold shared TypeScript types (e.g., `Character`, `World`), ensuring that the frontend and backend are always speaking the exact same data language.
-   **Simplified Dependency Management:** A single `npm install` command from the root directory installs all dependencies for all workspaces.

The project is organized as follows:

-   `/` (Root): Contains the master `package.json` that defines the workspaces. All development commands (e.g., `npm run dev`) should be run from here.
-   `/packages/client/`: Contains the entire React + Vite frontend application (The **View**).
-   `/packages/server/`: A reserved space for the future NestJS backend application (The **Model** and **Controller**).