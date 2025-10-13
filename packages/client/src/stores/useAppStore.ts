import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
    type UserData,
    type Character,
    type TimelineEvent,
    type Era,
    type World,
    type WritingEntry,
    type CatalogueItem,
} from 'aetherquill-common';
import { saveUserData } from '../utils/storage.ts';
import { loginUser } from '../api/auth';
import { AxiosError } from 'axios';
import { setAuthToken } from '../api/token';
import { getUserData } from '../api/user';
import {
    createProject,
    updateProject as updateProjectApi, // Use an alias to avoid name clash
    deleteProject as deleteProjectApi, // Use an alias
} from '../api/projects';
import type { AppAxiosError } from '../api/error';
import { isAxiosError } from 'axios';

// Defining the theme type
type Theme = 'light' | 'dark';

// Login Credentials type
export interface LoginCredentials {
    username: string;
    password: string;
}

// This is the blueprint for our entire application's state.
interface AppState {
    currentUser: string | null;
    userData: UserData | null; // The full data object for the logged-in user.
    currentProjectId: string | null;
    theme: Theme;
    isLoading: boolean; // To track when an API call is in progress
    error: string | null; // To store any error messages from the API

    // Login Action
    login: (credentials: LoginCredentials) => Promise<void>; // It now accepts credentials and returns a Promise
    logout: () => void;

    // Theme Toggle
    toggleTheme: () => void;

    // Project Action
    setCurrentProject: (projectId: string) => void;
    addProject: (projectData: { name: string }) => Promise<void>; // Now async
    updateProject: (projectId: string, newName: string) => Promise<void>; // Now async
    deleteProject: (projectId: string) => Promise<void>; // Now async

    // Character Action
    addCharacter: (characterData: Omit<Character, 'id'>) => void;
    updateCharacter: (characterId: string, characterData: Omit<Character, 'id'>) => void;
    deleteCharacter: (characterId: string) => void;

    // Timeline Action
    addTimelineEvent: (eventData: Omit<TimelineEvent, 'id' | 'order'>) => void;
    updateTimelineEvent: (eventId: string, eventData: Partial<Omit<TimelineEvent, 'id'>>) => void;
    deleteTimelineEvent: (eventId: string) => void;

    // Era Action
    addEra: (eraData: Omit<Era, 'id' | 'order'>) => void;
    updateEra: (eraId: string, eraData: Partial<Omit<Era, 'id'>>) => void;
    deleteEra: (eraId: string) => void;
    reorderEras: (eraIds: string[]) => void;
    reorderEventsInEra: (eraId: string, eventIds: string[]) => void;

    // World Action
    addWorld: (worldData: Omit<World, 'id'>) => void;
    updateWorld: (worldId: string, worldData: Partial<Omit<World, 'id'>>) => void;
    deleteWorld: (worldId: string) => void;

    // Writing Page Action
    addWriting: (writingData: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateWriting: (writingId: string, writingData: Partial<Omit<WritingEntry, 'id'>>) => void;
    deleteWriting: (writingId: string) => void;

    // Catalogue
    addCatalogueItem: (itemData: Omit<CatalogueItem, 'id'>) => void;
    updateCatalogueItem: (itemId: string, itemData: Partial<Omit<CatalogueItem, 'id'>>) => void;
    deleteCatalogueItem: (itemId: string) => void;

    saveCurrentUser: () => void;
}

// --- THIS IS THE CORRECTED STORE CREATION ---
// We must include 'get' in the function signature to be able to use it.
export const useAppStore = create<AppState>((set, get) => ({
    currentUser: null,
    userData: null,
    currentProjectId: null,
    isLoading: false,
    error: null,

    // Initialize the theme state
    theme: (localStorage.getItem('aetherquill__theme') as Theme) || 'light',


    // Login Actions
    // --- Session Actions ---
    login: async (credentials) => {
        try {
            set({ isLoading: true, error: null });
            // --- ACT I: AUTHENTICATION ---
            // First, we authenticate and get the signet ring (token).
            const loginResponse = await loginUser(credentials);
            setAuthToken(loginResponse.accessToken); // Store the ring in our secure box.

            // --- ACT II: DATA FETCHING ---
            // Now that we have the ring, our messenger is automatically authenticated.
            // We immediately fetch the user's entire world.
            const userDataPayload = await getUserData();

            // --- SUCCESS ---
            // We have the token AND all the user's data. The login is fully complete.
            set({
                currentUser: userDataPayload.username,
                userData: userDataPayload, // Set the REAL data from the API.
                isLoading: false,
            });

            localStorage.setItem('aetherquill__current_user', userDataPayload.username);
        } catch (err) {
            // We initialize a default error message.
            let errorMessage = 'An unexpected login error occurred.';
            setAuthToken(null);

            // Now, we check if the error is an AxiosError. This is our type guard.
            if (err instanceof AxiosError) {
                // If it is, we know it has a 'response' property.
                // We can safely access err.response.data to get the message from our backend.
                // The optional chaining (?.) provides an extra layer of safety.
                errorMessage =
                    err.response?.data?.message || 'An error occurred during login.';
            }

            // Update the store with the determined error message.
            set({ error: errorMessage, isLoading: false });

            // Re-throw the error so the UI component can react to the failure.
            throw new Error(errorMessage);
        }
    },
    logout: () => {
        localStorage.removeItem('aetherquill__current_user');
        // In the future, we will also remove the JWT here.
        set({
            currentUser: null,
            userData: null,
            currentProjectId: null,
        });
    },



    // Theme Action
    toggleTheme: () => {
        set(state => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            // Save the new preference to localStorage.
            localStorage.setItem('aetherquill__theme', newTheme);
            // Update the state.
            return { theme: newTheme };
        });
    },


    // Project Actions
    setCurrentProject: (projectId) => {
        // This action remains synchronous as it only affects local UI state.
        localStorage.setItem('aetherquill__last_project', projectId);
        set({ currentProjectId: projectId });
    },
    // --- Data Modification Actions ---
    addProject: async (projectData) => {
        try {
            set({ isLoading: true, error: null });
            // The API now returns a perfect ProjectData object.
            const newProject = await createProject(projectData);

            // Now, newProject.projectId is guaranteed to be the correct string ID.
            set((state) => {
                if (!state.userData) return state;
                const newUserData: UserData = {
                    ...state.userData,
                    projects: {
                        ...state.userData.projects,
                        [newProject.projectId]: newProject, // This now works perfectly.
                    },
                };
                return { userData: newUserData };
            });

            toast.success(`Chronicle "${newProject.name}" created!`);
        } catch (err) { // 1. Remove the ': any'
            // 2. Use the isAxiosError type guard to check the error type
            let errorMessage = 'Failed to create project.';
            if (isAxiosError(err)) {
                // Now TypeScript knows err is an AxiosError and has a .response property
                const appErr = err as AppAxiosError; // Cast to our specific type
                errorMessage = appErr.response?.data?.message || errorMessage;
            }
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    updateProject: async (projectId, newName) => {
        try {
            set({ isLoading: true, error: null });
            const updatedProject = await updateProjectApi(projectId, { name: newName });

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[projectId] = updatedProject;
                return { userData: newUserData };
            });

            toast.success(`Chronicle renamed to "${newName}".`);
        } catch (err) { // Remove ': any'
            let errorMessage = 'Failed to rename project.';
            if (isAxiosError(err)) {
                const appErr = err as AppAxiosError;
                errorMessage = appErr.response?.data?.message || errorMessage;
            }
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteProject: async (projectId) => {
        const projectName = get().userData?.projects[projectId]?.name;
        try {
            set({ isLoading: true, error: null });
            await deleteProjectApi(projectId);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                delete newUserData.projects[projectId];
                const newCurrentProjectId = state.currentProjectId === projectId ? null : state.currentProjectId;
                if (newCurrentProjectId === null) {
                    localStorage.removeItem('aetherquill__last_project');
                }
                return { userData: newUserData, currentProjectId: newCurrentProjectId };
            });

            if (projectName) {
                toast.success(`Chronicle "${projectName}" consigned to the void.`);
            }
        } catch (err) { // Remove ': any'
            let errorMessage = 'Failed to delete project.';
            if (isAxiosError(err)) {
                const appErr = err as AppAxiosError;
                errorMessage = appErr.response?.data?.message || errorMessage;
            }
            set({ error: errorMessage });
            toast.error(errorMessage);
            throw err;
        } finally {
            set({ isLoading: false });
        }
    },


    // Character Actions
    addCharacter: (characterData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const newCharacter: Character = { id: `char_${Date.now()}`, ...characterData };

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            newUserData.projects[currentProjectId].characters.push(newCharacter);
            return { userData: newUserData };
        });
        toast.success(`Soul "${characterData.name}" has been forged.`);
    },
    updateCharacter: (characterId, characterData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const projectCharacters = newUserData.projects[currentProjectId].characters;
            const charIndex = projectCharacters.findIndex((c: Character) => c.id === characterId);

            if (charIndex !== -1) {
                projectCharacters[charIndex] = { ...projectCharacters[charIndex], ...characterData };
            }
            return { userData: newUserData };
        });
        toast.success(`Soul "${characterData.name}" updated.`);
    },
    deleteCharacter: (characterId) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const charName = get().userData?.projects[currentProjectId]?.characters.find(c => c.id === characterId)?.name;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            newUserData.projects[currentProjectId].characters =
                newUserData.projects[currentProjectId].characters.filter((c: Character) => c.id !== characterId);
            return { userData: newUserData };
        });
        if (charName) {
            toast.success(`Soul "${charName}" has been banished.`);
        }
    },


    // TimeLine Actions
    addTimelineEvent: (eventData) => {
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;

            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];

            // Automatically set the order to be the last in its era
            const eventsInEra = project.timeline.filter((e: TimelineEvent) => e.eraId === eventData.eraId);
            const newOrder = eventsInEra.length > 0 ? Math.max(...eventsInEra.map((e: TimelineEvent) => e.order)) + 1 : 1;

            const newEvent: TimelineEvent = { id: `evt_${Date.now()}`, ...eventData, order: newOrder };
            project.timeline.push(newEvent);

            toast.success(`Event "${newEvent.title}" added to the chronicle.`);
            return { userData: newUserData };
        });
    },
    updateTimelineEvent: (eventId, eventData) => {
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];
            const eventIndex = project.timeline.findIndex((e: TimelineEvent) => e.id === eventId);

            if (eventIndex !== -1) {
                project.timeline[eventIndex] = { ...project.timeline[eventIndex], ...eventData };
                toast.success(`Event "${project.timeline[eventIndex].title}" updated.`);
            }
            return { userData: newUserData };
        });
    },
    deleteTimelineEvent: (eventId) => {
        const eventTitle = get().userData?.projects[get().currentProjectId!]?.timeline.find(e => e.id === eventId)?.title;
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];
            project.timeline = project.timeline.filter((e: TimelineEvent) => e.id !== eventId);

            if (eventTitle) toast.success(`Event "${eventTitle}" erased from the chronicle.`);
            return { userData: newUserData };
        });
    },


    // Era Action
    addEra: (eraData) => {
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];

            // Automatically set the order to be the last era
            const newOrder = project.eras.length > 0 ? Math.max(...project.eras.map((e: Era) => e.order)) + 1 : 1;
            const newEra: Era = { id: `era_${Date.now()}`, ...eraData, order: newOrder };
            project.eras.push(newEra);

            toast.success(`The "${newEra.name}" has begun.`);
            return { userData: newUserData };
        });
    },
    updateEra: (eraId, eraData) => {
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];
            const eraIndex = project.eras.findIndex((e: Era) => e.id === eraId);

            if (eraIndex !== -1) {
                project.eras[eraIndex] = { ...project.eras[eraIndex], ...eraData };
                toast.success(`Era "${project.eras[eraIndex].name}" has been updated.`);
            }
            return { userData: newUserData };
        });
    },
    deleteEra: (eraId) => {
        const eraName = get().userData?.projects[get().currentProjectId!]?.eras.find(e => e.id === eraId)?.name;
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];

            // Also delete all events associated with this era
            project.timeline = project.timeline.filter((e: TimelineEvent) => e.eraId !== eraId);
            project.eras = project.eras.filter((e: Era) => e.id !== eraId);

            if (eraName) toast.success(`The "${eraName}" and all its events have ended.`);
            return { userData: newUserData };
        });
    },
    reorderEras: (eraIds) => {
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];
            // Create a map for quick lookups
            const eraMap = new Map(project.eras.map((e: Era) => [e.id, e]));
            // Recreate the eras array in the new order
            project.eras = eraIds.map(id => eraMap.get(id)!).filter(Boolean).map((era, index) => ({...era, order: index + 1}));

            toast.success("Eras have been reordered.");
            return { userData: newUserData };
        });
    },
    reorderEventsInEra: (eraId, eventIds) => {
        set(state => {
            if (!state.currentUser || !state.userData || !state.currentProjectId) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const project = newUserData.projects[state.currentProjectId];

            // Create a map of the events being reordered for quick lookups
            const eventMap = new Map(project.timeline.filter((e: TimelineEvent) => e.eraId === eraId).map((e: TimelineEvent) => [e.id, e]));
            const reorderedEvents = eventIds.map(id => eventMap.get(id)!).filter(Boolean).map((event, index) => ({...event, order: index + 1}));

            // Get all other events that were not part of this reordering
            const otherEvents = project.timeline.filter((e: TimelineEvent) => e.eraId !== eraId);

            // Combine them back into the main timeline array
            project.timeline = [...otherEvents, ...reorderedEvents];

            toast.success("Events have been reordered.");
            return { userData: newUserData };
        });
    },


    // World Action
    addWorld: (worldData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const newWorld: World = { id: `world_${Date.now()}`, ...worldData };

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            newUserData.projects[currentProjectId].worlds.push(newWorld);
            return { userData: newUserData };
        });
        toast.success(`Realm "${worldData.name}" has been forged.`);
    },
    updateWorld: (worldId, worldData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const projectWorlds = newUserData.projects[currentProjectId].worlds;
            const worldIndex = projectWorlds.findIndex((w: World) => w.id === worldId);

            if (worldIndex !== -1) {
                projectWorlds[worldIndex] = { ...projectWorlds[worldIndex], ...worldData };
            }
            return { userData: newUserData };
        });
        toast.success(`Realm "${worldData.name}" has been updated.`);
    },
    deleteWorld: (worldId) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const worldName = get().userData?.projects[currentProjectId]?.worlds.find(w => w.id === worldId)?.name;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            newUserData.projects[currentProjectId].worlds =
                newUserData.projects[currentProjectId].worlds.filter((w: World) => w.id !== worldId);
            return { userData: newUserData };
        });
        if (worldName) {
            toast.success(`Realm "${worldName}" has been unmade.`);
        }
    },


    // Writing Page
    addWriting: (writingData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const now = Date.now();
        const newWriting: WritingEntry = {
            id: `writing_${now}`,
            ...writingData,
            createdAt: now,
            updatedAt: now,
        };

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            newUserData.projects[currentProjectId].writings.unshift(newWriting); // Add to top
            return { userData: newUserData };
        });
        toast.success(`Manuscript "${writingData.title}" has been archived.`);
    },
    updateWriting: (writingId, writingData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const projectWritings = newUserData.projects[currentProjectId].writings;
            const writingIndex = projectWritings.findIndex((w: WritingEntry) => w.id === writingId);

            if (writingIndex !== -1) {
                projectWritings[writingIndex] = {
                    ...projectWritings[writingIndex],
                    ...writingData,
                    updatedAt: Date.now(),
                };
            }
            return { userData: newUserData };
        });
        toast.success(`Manuscript "${writingData.title}" has been updated.`);
    },
    deleteWriting: (writingId) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const writingTitle = get().userData?.projects[currentProjectId]?.writings.find(w => w.id === writingId)?.title;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            newUserData.projects[currentProjectId].writings =
                newUserData.projects[currentProjectId].writings.filter((w: WritingEntry) => w.id !== writingId);
            return { userData: newUserData };
        });
        if (writingTitle) {
            toast.success(`Manuscript "${writingTitle}" consigned to the flames.`);
        }
    },


    // Catalogue Actions
    addCatalogueItem: (itemData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const newItem: CatalogueItem = { id: `cat_${Date.now()}`, ...itemData };

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            // Ensure the catalogue array exists before pushing
            if (!newUserData.projects[currentProjectId].catalogue) {
                newUserData.projects[currentProjectId].catalogue = [];
            }
            newUserData.projects[currentProjectId].catalogue.push(newItem);
            toast.success(`Curiosity "${itemData.name}" added to the catalogue.`);
            return { userData: newUserData };
        });
    },
    updateCatalogueItem: (itemId, itemData) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            const projectCatalogue = newUserData.projects[currentProjectId].catalogue;
            const itemIndex = projectCatalogue.findIndex((i: CatalogueItem) => i.id === itemId);

            if (itemIndex !== -1) {
                projectCatalogue[itemIndex] = { ...projectCatalogue[itemIndex], ...itemData };
                toast.success(`Curiosity "${projectCatalogue[itemIndex].name}" updated.`);
            }
            return { userData: newUserData };
        });
    },
    deleteCatalogueItem: (itemId) => {
        const { currentUser, currentProjectId } = get();
        if (!currentUser || !currentProjectId) return;

        const itemName = get().userData?.projects[currentProjectId]?.catalogue.find(i => i.id === itemId)?.name;

        set(state => {
            if (!state.userData) return state;
            const newUserData = JSON.parse(JSON.stringify(state.userData));
            newUserData.projects[currentProjectId].catalogue =
                newUserData.projects[currentProjectId].catalogue.filter((i: CatalogueItem) => i.id !== itemId);

            if (itemName) toast.success(`Curiosity "${itemName}" removed from the catalogue.`);
            return { userData: newUserData };
        });
    },


    // Save Current User Action
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