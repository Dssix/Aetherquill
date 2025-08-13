# Scroll II: Data Models & Type Blueprints

This document serves as the canonical source of truth for all data structures within the Aetherquill application. All data persisted in `localStorage` and managed by the `useAppStore` conforms to these TypeScript interfaces.

---

## 1. Top-Level Architecture

The entire data model is hierarchical, designed for user and project scoping.

### `UserData`

This is the highest-level object, representing all data associated with a single user profile.

```ts
export interface UserData {
  username: string;
  projects: {
    // A dictionary of ProjectData objects, keyed by their unique projectId.
    [projectId: string]: ProjectData;
  };
}
```

### `ProjectData`

This object is a self-contained universe for a single creative project or "chronicle." It holds all the entities that belong to that story.

```ts
export interface ProjectData {
  projectId: string;
  name: string;
  eras: Era[];
  timeline: TimelineEvent[];
  characters: Character[];
  worlds: World[];
  writings: WritingEntry[];
}
```

---

## 2. Core Entity Blueprints

These are the fundamental building blocks of the writer's lore, stored within each `ProjectData` object.

### `Character`

Represents a single character. Its most powerful feature is the `traits` array, which allows for a flexible, user-defined structure.

```ts
export interface Character {
  id: string;
  name: string;
  species: string;

  // --- Interlinking ---
  linkedWorldId: string | null;
  linkedEventIds?: string[];
  linkedWritingIds?: string[];

  // --- Dynamic Traits ---
  // Contains all reorderable fixed fields and all user-created custom fields.
  // The order of this array is defined by the user and must be preserved.
  traits: CharacterTrait[];
}

// Represents a single, reorderable trait within a Character.
export interface CharacterTrait {
  id: string;       // e.g., 'appearance' for a fixed trait, or 'custom_12345' for a custom one
  label: string;    // The display name, e.g., "Appearance" or "Eye Color"
  value: string;
  isCustom: boolean;
  isTextarea: boolean;
}
```

### `World`

Represents a single world, realm, or location.

```ts
export interface World {
  id: string;
  name: string;
  theme: string;
  setting: string;
  description: string;

  // --- Interlinking ---
  linkedCharacterIds?: string[];
  linkedWritingIds?: string[];
  linkedEventIds?: string[];
}
```

### `WritingEntry`

Represents a single manuscript, note, or piece of lore written in the "Heart's Library."

```ts
export interface WritingEntry {
  id: string;
  title: string;
  content: string; // Stored as raw Markdown
  tags?: string[];
  createdAt: number; // JavaScript timestamp
  updatedAt: number; // JavaScript timestamp

  // --- Interlinking ---
  linkedCharacterIds?: string[];
  linkedWorldId?: string | null;
  linkedEventIds?: string[];
}
```

### `TimelineEvent` & `Era`

These two entities work together to form the "Chronicle of Eras," a system of manually ordered, narrative-driven time.

```ts
// Represents a historical period with a user-defined order.
export interface Era {
  id: string;
  name: string;
  description?: string;
  order: number; // Defines the display order relative to other Eras.
}

// Represents a single event within the timeline.
export interface TimelineEvent {
  id: string;
  eraId: string; // A mandatory link to an Era.
  displayDate: string; // A narrative-friendly date string, e.g., "15th Day of the Sun's Height".
  order: number; // Defines the display order relative to other Events within the same Era.
  title: string;
  description: string;
  tags?: string[];

  // --- Interlinking ---
  linkedCharacterIds?: string[];
  linkedWritingIds?: string[];
}
```