import { create } from 'zustand';
import { type UserData, type ProjectData } from '../dataModels/userData';
import { saveUserData } from '../utils/storage';
// import { type Character } from '../types/character'; // Assuming you'll add addCharacter later

// This is the blueprint for our entire application's state.
interface AppState {
    currentUser: string | null;
    userData: UserData | null; // The full data object for the logged-in user.
    currentProjectId: string | null;

    // Actions
    login: (username: string, userData: UserData) => void;
    logout: () => void;
    setCurrentProject: (projectId: string) => void;
    addProject: (projectData: ProjectData) => void;
    // We will add actions like addCharacter here later.
    updateProject: (projectId: string, newName: string) => void;
    deleteProject: (projectId: string) => void;

    saveCurrentUser: () => void;
}

// --- THIS IS THE CORRECTED STORE CREATION ---
// We must include 'get' in the function signature to be able to use it.
export const useAppStore = create<AppState>((set, get) => ({
    currentUser: null,
    userData: null,
    currentProjectId: null,

    // --- Session Actions ---
    login: (username, userData) => {
        localStorage.setItem('aetherquill__current_user', username);
        set({
            currentUser: username,
            userData: userData,
            currentProjectId: null // Always reset the current project on a new login
        });
    },

    logout: () => {
        localStorage.removeItem('aetherquill__current_user');
        set({
            currentUser: null,
            userData: null,
            currentProjectId: null
        });
    },

    setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId });
    },

    // --- Data Modification Actions ---
    addProject: (projectData) => {
        // We use 'set' and receive the current 'state'.
        set(state => {
            // Safety checks: ensure a user is logged in and their data is loaded.
            if (!state.currentUser || !state.userData) {
                return state; // Return the current state unmodified if checks fail.
            }

            // This is the correct, safe, and immutable way to add a new project.
            const newUserData: UserData = {
                ...state.userData, // Copy all existing user data
                projects: {
                    ...state.userData.projects, // Copy all existing projects
                    [projectData.projectId]: projectData, // Add the new project
                },
            };

            // Return the new state.
            return { userData: newUserData };
        });
    },

    updateProject: (projectId, newName) => {
        set(state => {
            if (!state.currentUser || !state.userData) return state;

            // Create a deep, immutable copy to safely modify.
            const newUserData = JSON.parse(JSON.stringify(state.userData));

            // Check if the project exists before trying to update it.
            if (newUserData.projects[projectId]) {
                newUserData.projects[projectId].name = newName;
            }

            return { userData: newUserData };
        });
    },

    deleteProject: (projectId) => {
        set(state => {
            if (!state.currentUser || !state.userData) return state;

            const newUserData = JSON.parse(JSON.stringify(state.userData));

            // Delete the project from the projects object.
            delete newUserData.projects[projectId];

            // If the deleted project was the currently active one, deselect it.
            const newCurrentProjectId = state.currentProjectId === projectId ? null : state.currentProjectId;
            if (newCurrentProjectId === null) {
                localStorage.removeItem('aetherquill__last_project');
            }

            return { userData: newUserData, currentProjectId: newCurrentProjectId };
        });
    },

    // --- Persistence Action ---
    saveCurrentUser: () => {
        // We use 'get()' to read the latest state without causing a re-render.
        const { currentUser, userData } = get();
        if (currentUser && userData) {
            saveUserData(userData);
        }
    },
}));

useAppStore.subscribe(
    // The listener function receives the entire current state.
    (state) => {
        // We can now access the parts we need directly from the state.
        const { currentUser, userData } = state;

        // The logic remains the same: if a user is logged in and their data exists, save it.
        // This will automatically be called on ANY state change, which is exactly what we want.
        // Every time addProject, updateProject, etc., is called, this subscription will fire
        // after the state has been updated, and it will save the new userData.
        if (currentUser && userData) {
            console.log("State changed, persisting user data to localStorage...");
            saveUserData(userData);
        }
    }
);