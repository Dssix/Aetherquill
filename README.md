# Aetherquill 🖋️

*A digital scriptorium where worlds are born and tales are woven.*

---

### 📖 About the Scriptorium

Welcome, fellow scribe. Aetherquill is a **local-first, browser-based application** designed for novelists and world-builders. It is a private, immersive sanctuary for your stories, with no cloud servers, no subscriptions, and no distractions. Forged with a vintage parchment aesthetic, it aims to evoke the feeling of working in a candlelit chamber, crafting your lore upon an eternal scroll.

The core philosophy of Aetherquill is the **"Web of Echoes"**—the idea that every character, world, event, and piece of writing is interconnected. This tool is designed not just to store your notes, but to help you discover the hidden threads that bind them together.

### ✨ Features & Capabilities

*   **🛡️ Multi-Project Sanctum:** Aetherquill is your personal library. Create and manage multiple, distinct projects or "chronicles," each with its own isolated collection of lore. A simple, name-based login system keeps your work private and organized.
*   **📜 Custom, Narrative-Driven Timeline:** Chronicle the history of your world with a fully interactive timeline built for storytellers. Create custom **Eras** with their own names and descriptions, and manually order them to fit your narrative. Events are defined with poetic, relative dates (e.g., "15th Day of the Sun's Height") and can be **dragged and dropped** to perfect their chronological flow.
*   **🧝 Deep Character Creation:** Forge the souls of your story with a powerful character creator. Define core traits like species, and add your own **custom, reorderable fields** to track anything you can imagine, from "Eye Color" to "Greatest Fear."
*   **🌍 World-Building Atlas:** Create and manage the realms, cities, and regions of your saga, each with its own detailed description and attributes.
*   **✍️ The Heart's Library:** A dedicated writing room featuring a beautiful **Markdown editor with a live side-by-side preview**. Write your lore, scenes, or notes and see them beautifully formatted as you type.
*   **🕸️ The Web of Echoes:** The true magic of Aetherquill. Every entity can be linked to any other within a project. A **Character** can inhabit a **World** and be mentioned in multiple **Writings**. A **Timeline Event** can list the **Characters** who participated. A **Writing** can reference the **Events** it describes.
*   **🔮 The Oracle's Mirror (Global Search):** A powerful, project-scoped search bar is always at your command. Instantly find any character, world, event, or writing by its name, tags, or content using fuzzy search.
*   **🧭 Immersive Detail Pages & Navigation:** Dive deep into your lore with dedicated, read-only "viewer" pages for your Characters, Worlds, and Writings. A dynamic **breadcrumb trail** in the header ensures you never lose your place in your own creation.
*   **🎨 Dual-Theme Atmosphere:** Switch between a classic, sun-bleached **Light Mode** and a magical, moonlit **Dark Mode** at the click of a button. The entire UI transforms, with the theme system built on a semantic color palette for perfect consistency.
*   **🧠 The Eternal Scroll:** All your work—every user, every project, every entity, and your chosen theme—is automatically saved to your browser's `localStorage`. Your scriptorium will be exactly as you left it every time you return.

### 🛠️ The Craftsman's Tools (Tech Stack)

*   **Frontend:** React, TypeScript, React Router
*   **Build Tool:** Vite
*   **State Management:** Zustand (A single, unified store with automatic persistence)
*   **Styling:** TailwindCSS (with a custom semantic, theme-aware color system and the Typography plugin)
*   **Drag & Drop:** `@dnd-kit/core` & `@dnd-kit/sortable`
*   **Searching:** Fuse.js (for lightweight fuzzy searching)
*   **Markdown:** `react-markdown`

### 📜 Getting Started: Lighting the First Candle

To summon Aetherquill in your own local workshop, follow these simple incantations.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/aetherquill.git
    ```

2.  **Navigate to the Scriptorium:**
    ```bash
    cd aetherquill
    ```

3.  **Install the Arcane Tomes (Dependencies):**
    ```bash
    npm install
    ```

4.  **Kindle the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open the Portal:**
    Open your web browser and navigate to the local address provided by Vite (usually `http://localhost:5173`). The scriptorium awaits. The first time you arrive, simply enter a name to create your scribe profile. Your old data (if any) will be automatically migrated into your new "default" user profile.

### 🗺️ Navigating the Scriptorium (Project Structure)

The project is organized to be clean and scalable:

    aetherquill/
    ├── public/ # Static assets (fonts, background textures)
    └── src/
    ├── components/ # Reusable components (Layout, Panels, UI elements, DND)
    ├── dataModels/ # Core data blueprints (UserData, ProjectData)
    ├── hooks/ # Reusable React hooks (useDebounce, useBreadcrumbs, useThemeManager)
    ├── pages/ # Top-level components for each main route
    ├── stores/ # The single, unified Zustand store (useAppStore)
    ├── types/ # Entity-specific TypeScript interfaces (Character, World, etc.)
    └── utils/ # Helper functions (storage, search, migration)

### 🔮 The Path Forward (Future Vision)

Aetherquill Version 1.0 is a complete and polished local-first application. The next grand milestone is **"The Cloud Sanctum."**

*   **☁️ Backend Integration:** The current architecture, with its user-scoped data model and centralized store actions, is designed for a seamless transition. The next phase of development will focus on building a backend (e.g., with Node.js/NestJS or Java/Spring Boot) and replacing the `localStorage` utilities with asynchronous API calls to allow for data synchronization across multiple devices.

---

*May your ink never run dry.*