# Scroll IV: Feature Deep Dive — The Timeline & Characters

This document provides a detailed architectural overview of the two most complex and unique systems in Aetherquill: the narrative-driven Timeline and the flexible Character creator.

---

## 1. The Chronicle of Eras (Timeline System)

The timeline is not a rigid, absolute calendar. It is a fluid, narrative tool designed to give the writer complete creative control over the flow of their history. This system is referred to as **"Custom Time."**

### Core Philosophy

The fundamental principle is **manual, user-defined ordering**. The application does not assume a universal calendar. Instead, the writer is the ultimate authority on the chronological sequence of both the grand Ages (Eras) and the specific moments (Events) within them.

### Data Structure

This philosophy is reflected directly in the data models:

-   **`Era`:** An Era is not defined by start and end dates. Its position in the chronicle is determined by a single `order: number` property.
-   **`TimelineEvent`:** An Event's position is also determined by its own `order: number` property, which is relative to other events *within the same Era*. Its `displayDate` is a simple, descriptive string (e.g., "First moon of the thaw") and is not used for sorting.

### The Sorting & Display Logic (`TimelinePage.tsx`)

The final, visible order of the chronicle is achieved through a two-stage sorting process, managed by the `sortedErasWithEvents` `useMemo` hook:

1.  **Era Sorting:** The primary list of all `Eras` in the current project is sorted numerically based on each Era's `order` property.
2.  **Event Sorting:** Then, for each Era, the list of `Events` belonging to it is sorted numerically based on each Event's `order` property.

### The User Interface: Effortless Order

To empower the user to control this manual order, the timeline features a comprehensive **drag-and-drop** interface powered by `@dnd-kit`.

-   **Reordering Eras:** The user can physically drag and drop the main `EraDivider` components. On drop, the `reorderEras` action in the `useAppStore` is called. This action receives an array of Era IDs in their new sequence and re-calculates the `order` property for each Era accordingly.
-   **Reordering Events:** Within each Era, the user can also drag and drop the individual `TimelineNode` components. This is managed by a separate, nested `DndContext`. On drop, the `reorderEventsInEra` action is called, which recalculates the `order` property for all events within that specific Era, leaving others untouched.

---

## 2. The Chamber of Souls (Character System)

The character creation system is designed for ultimate flexibility, allowing a writer to track not only a set of core attributes but also any custom detail they can imagine.

### Core Philosophy

The central concept is the separation of a character's **fixed identity** from their **malleable traits**. A character's `name` and `species` are fundamental, but the details that describe them—from their appearance to their deepest fears—are fluid and personal to the writer's process.

### Data Structure (`Character` & `CharacterTrait`)

This philosophy is enabled by a powerful data structure:

-   **`Character`:** The main object holds the fixed identity fields (`id`, `name`, `species`) and the entity links (`linkedWorldId`, etc.).
-   **`traits: CharacterTrait[]`:** The most important property is the `traits` array. This single, ordered array holds **all other descriptive information**.

The `CharacterTrait` interface is a unified blueprint for any attribute:

```ts
export interface CharacterTrait {
  id: string;
  label: string;
  value: string;
  isCustom: boolean;   // A flag to distinguish fixed traits from user-created ones
  isTextarea: boolean; // A flag for rendering hints
}
```

### The User Interface: The Dynamic Forge (`AddCharacterPanel.tsx`)

The character creation panel is the most complex form in the application, designed to manage this flexible structure.

-   **Fixed Fields:** `Name` and `Species` are rendered as simple, static input fields at the top of the panel.
-   **Unified Reorderable List:** All other fields—both the default "fixed" traits (`Appearance`, `Background`, `Notes`) and any user-created **Custom Fields**—are rendered as a single, unified list.
-   **User Control:** Within this list, the user has complete control:
    -   **Reordering:** They can use simple up/down arrow buttons to change the display order of any trait.
    -   **Adding:** They can add any number of new, custom fields (e.g., "Eye Color," "Allegiance").
    -   **Removing:** They can remove any custom field they have added.
-   **Preservation of Order:** Upon saving, the final, user-defined order of the `traits` array is preserved and saved directly to the character object. The display on the `CharacterPage` and `CharacterViewerPage` will always render the traits in this exact order, honoring the writer's preference.