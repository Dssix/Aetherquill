# Scroll III: Core Components & Design System

This document catalogs the reusable components, hooks, and design patterns that create the consistent, vintage aesthetic of Aetherquill. Adherence to this system is crucial for maintaining the application's unique "candlelit scriptorium" feel.

---

## 1. Architectural Components

These components form the very skeleton of the application's user interface.

### `Layout.tsx`

The master container for all authenticated views. It is summoned by a Layout Route in `App.tsx`.

-   **Purpose:** To provide a consistent, application-wide UI shell.
-   **Features:**
    -   Renders the global parchment background (light or dark).
    -   Renders the shared, intelligent `<Header />` component.
    -   Renders a shared `<footer>`.
    -   Contains the `<Outlet />` from `react-router-dom`, which acts as the pedestal where all child page components are displayed.

### `Header.tsx`

The command center of the application, rendered by the `Layout`.

-   **Purpose:** To provide consistent navigation, branding, and session controls.
-   **Features:**
    -   **Intelligent Navigation:** The main project navigation (`Home`, `Chronicle`, `Souls`, etc.) is only rendered if a `currentProjectId` is active in the `useAppStore`.
    -   **Dynamic Breadcrumbs:** Summons the `useBreadcrumbs` hook to render a contextual breadcrumb trail, providing users with a clear sense of place.
    -   **Global Search:** Contains the "Oracle's Mirror" search bar and the floating results panel.
    -   **Theme Toggle:** Renders the sun/moon button to toggle the application's theme.
    -   **Session Control:** Displays the "Logout" button.

---

## 2. The UI Kit (`src/components/ui/`)

This is the scribe's toolkit—a collection of theme-aware, reusable components used to build all user interfaces. They are styled using the semantic color palette defined in `tailwind.config.js` and `index.css`.

### `Card.tsx`

The fundamental building block for displaying content.

-   **Purpose:** To create a distinct, layered "piece of parchment" effect for UI sections.
-   **Styling:** Uses `bg-card`, `text-card-foreground`, and `border-border`. Automatically adapts to light and dark themes. Includes a subtle `backdrop-blur` and `shadow` for depth.

### `Button.tsx`

The standard interactive element for actions.

-   **Purpose:** To provide a consistent look and feel for all buttons.
-   **Variants:**
    -   `primary`: A solid, high-emphasis button (e.g., "Save"). Uses `bg-primary` and `text-primary-foreground`.
    -   `secondary`: An outlined, lower-emphasis button (e.g., "Cancel," "Edit"). Uses `border-primary` and `text-primary`.

### `TraitDisplay.tsx`

A specialized component for elegantly displaying key-value pairs.

-   **Purpose:** To render character traits and other details in a perfectly aligned, two-column format.
-   **Features:** Uses a flexbox layout to ensure all labels and values are aligned, regardless of content length.

### `EntityLinker.tsx`

A powerful, complex component for managing entity relationships.

-   **Purpose:** To provide a user-friendly interface for selecting multiple entities to link.
-   **Features:**
    -   A dedicated section to display already-selected items as removable "pills."
    -   A searchable, filterable list of available, unselected items.
    -   Handles its own internal search state, making it a self-contained and highly reusable tool.

---

## 3. Panels & Forms (`src/components/panels/`)

These are the complex, feature-specific components used for creating and editing entities. They follow a consistent "slide-in panel" design pattern.

-   **Philosophy:** All panel components are designed to be **"dumb" components**. They do not access the global `useAppStore` directly.
-   **Data Flow:**
    1.  They are summoned by a parent `Page` component.
    2.  They receive all the data they need (e.g., the list of worlds for a dropdown, or the data of an entity being edited) as **props**.
    3.  They manage their own internal form state using `useState`.
    4.  Upon submission, they call an `onSave` function (passed down as a prop) with the completed data payload.

-   **Examples:** `AddCharacterPanel.tsx`, `WritingEditorPanel.tsx`, `EventForm.tsx`, `WorldForm.tsx`.

---

## 4. Custom Hooks (`src/hooks/`)

These are reusable pieces of logic that encapsulate complex behaviors.

### `useThemeManager.ts`

The heart of the dark mode system.

-   **Purpose:** To keep the `<html>` element's class in sync with the `theme` state in the `useAppStore`.
-   **Action:** Subscribes to the store and adds/removes the `.dark` class from the document root whenever the theme changes.

### `useBreadcrumbs.ts`

The engine for our navigational aid.

-   **Purpose:** To translate the current URL `pathname` into a human-readable array of breadcrumb objects.
-   **Features:** Accesses the `useAppStore` to look up the names of projects, characters, etc., transforming cryptic IDs in the URL into beautiful, legible titles.

### `useDebounce.ts`

A performance-enhancing utility.

-   **Purpose:** To delay the execution of an effect (like a search query) until the user has stopped typing for a specified duration.
-   **Action:** Used by the Global Search in the `Header` to prevent firing a search query on every single keystroke.