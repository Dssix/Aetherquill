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
import { loginUser } from '../api/auth';
import { AxiosError } from 'axios';
import { setAuthToken } from '../api/token';
import { getUserData } from '../api/user';
import {
    createProject,
    updateProject as updateProjectApi, // Use an alias to avoid name clash
    deleteProject as deleteProjectApi, // Use an alias
} from '../api/projects';
import {
    createCharacter,
    updateCharacter as updateCharacterApi,
    deleteCharacter as deleteCharacterApi,
} from '../api/characters';
import type { AppAxiosError } from '../api/error';
import { isAxiosError } from 'axios';
import {
    createWorld,
    updateWorld as updateWorldApi,
    deleteWorld as deleteWorldApi,
} from '../api/worlds';
import {
    createWriting,
    updateWriting as updateWritingApi,
    deleteWriting as deleteWritingApi,
} from '../api/writings';
import {
    createEra,
    updateEra as updateEraApi,
    deleteEra as deleteEraApi,
    reorderEras as reorderErasApi,
} from '../api/eras';
import {
    createEvent,
    updateEvent as updateEventApi,
    deleteEvent as deleteEventApi,
    reorderEventsInEra as reorderEventsInEraApi,
} from '../api/timeline';
import {
    createCatalogueItem,
    updateCatalogueItem as updateCatalogueItemApi,
    deleteCatalogueItem as deleteCatalogueItemApi,
} from '../api/catalogue';

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
    addCharacter: (characterData: Omit<Character, 'id'>) => Promise<void>; // Now async
    updateCharacter: (characterId: string, characterData: Omit<Character, 'id'>) => Promise<void>; // Now async
    deleteCharacter: (characterId: string) => Promise<void>; // Now async

    // Timeline Action
    addTimelineEvent: (eventData: Omit<TimelineEvent, 'id' | 'order'>) => Promise<void>; // Now async
    updateTimelineEvent: (eventId: string, eventData: Partial<Omit<TimelineEvent, 'id'>>) => Promise<void>; // Now async
    deleteTimelineEvent: (eventId: string) => Promise<void>; // Now async

    // Era Action
    addEra: (eraData: Omit<Era, 'id' | 'order'>) => Promise<void>; // Now async
    updateEra: (eraId: string, eraData: Partial<Omit<Era, 'id'>>) => Promise<void>; // Now async
    deleteEra: (eraId: string) => Promise<void>; // Now async
    reorderEras: (eraIds: string[]) => Promise<void>; // Now async
    reorderEventsInEra: (eraId: string, eventIds: string[]) => Promise<void>; // Now async

    // World Action
    addWorld: (worldData: Omit<World, 'id'>) => Promise<void>; // Now async
    updateWorld: (worldId: string, worldData: Partial<Omit<World, 'id'>>) => Promise<void>; // Now async
    deleteWorld: (worldId: string) => Promise<void>; // Now async

    // Writing Page Action
    addWriting: (writingData: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>; // Now async
    updateWriting: (writingId: string, writingData: Partial<Omit<WritingEntry, 'id'>>) => Promise<void>; // Now async
    deleteWriting: (writingId: string) => Promise<void>; // Now async

    // Catalogue
    addCatalogueItem: (itemData: Omit<CatalogueItem, 'id'>) => Promise<void>; // Now async
    updateCatalogueItem: (itemId: string, itemData: Partial<Omit<CatalogueItem, 'id'>>) => Promise<void>; // Now async
    deleteCatalogueItem: (itemId: string) => Promise<void>; // Now async

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
    addCharacter: async (characterData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) {
            toast.error('No active project selected.');
            return;
        }

        try {
            set({ isLoading: true, error: null });
            const newCharacter = await createCharacter(currentProjectId, characterData);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].characters.push(newCharacter);
                return { userData: newUserData };
            });

            toast.success(`Soul "${newCharacter.name}" has been forged.`);
        } catch (err) {
            let errorMessage = 'Failed to create character.';
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

    updateCharacter: async (characterId, characterData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            const updatedCharacter = await updateCharacterApi(
                currentProjectId,
                characterId,
                characterData,
            );

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const projectCharacters = newUserData.projects[currentProjectId].characters;
                const charIndex = projectCharacters.findIndex((c: Character) => c.id === characterId);

                if (charIndex !== -1) {
                    projectCharacters[charIndex] = updatedCharacter;
                }
                return { userData: newUserData };
            });

            toast.success(`Soul "${updatedCharacter.name}" updated.`);
        } catch (err) {
            let errorMessage = 'Failed to update character.';
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

    deleteCharacter: async (characterId) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        const charName = get().userData?.projects[currentProjectId]?.characters.find(c => c.id === characterId)?.name;

        try {
            set({ isLoading: true, error: null });
            await deleteCharacterApi(currentProjectId, characterId);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].characters =
                    newUserData.projects[currentProjectId].characters.filter((c: Character) => c.id !== characterId);
                return { userData: newUserData };
            });

            if (charName) {
                toast.success(`Soul "${charName}" has been banished.`);
            }
        } catch (err) {
            let errorMessage = 'Failed to delete character.';
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


    // TimeLine Actions
    addTimelineEvent: async (eventData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            // The eraId is part of the eventData object.
            const newEvent = await createEvent(
                currentProjectId,
                eventData.eraId,
                eventData,
            );

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].timeline.push(newEvent);
                return { userData: newUserData };
            });

            toast.success(`Event "${newEvent.title}" added to the chronicle.`);
        } catch (err) {
            let errorMessage = 'Failed to add event.';
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

    updateTimelineEvent: async (eventId, eventData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            const updatedEvent = await updateEventApi(
                currentProjectId,
                eventId,
                eventData,
            );

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const projectTimeline = newUserData.projects[currentProjectId].timeline;
                const eventIndex = projectTimeline.findIndex((e: TimelineEvent) => e.id === eventId);

                if (eventIndex !== -1) {
                    projectTimeline[eventIndex] = updatedEvent;
                }
                return { userData: newUserData };
            });

            toast.success(`Event "${updatedEvent.title}" updated.`);
        } catch (err) {
            let errorMessage = 'Failed to update event.';
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

    deleteTimelineEvent: async (eventId) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        const eventTitle = get().userData?.projects[currentProjectId]?.timeline.find(e => e.id === eventId)?.title;

        try {
            set({ isLoading: true, error: null });
            // This line sends the command to the backend.
            await deleteEventApi(currentProjectId, eventId);

            // This part updates the local state AFTER the API call succeeds.
            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const project = newUserData.projects[currentProjectId];
                project.timeline = project.timeline.filter((e: TimelineEvent) => e.id !== eventId);
                return { userData: newUserData };
            });

            if (eventTitle) {
                toast.success(`Event "${eventTitle}" erased from the chronicle.`);
            }
        } catch (err) {
            let errorMessage = 'Failed to delete event.';
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



    // Era Action
    addEra: async (eraData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            const newEra = await createEra(currentProjectId, eraData);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].eras.push(newEra);
                return { userData: newUserData };
            });

            toast.success(`The "${newEra.name}" has begun.`);
        } catch (err) {
            let errorMessage = 'Failed to create era.';
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

    updateEra: async (eraId, eraData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            const updatedEra = await updateEraApi(currentProjectId, eraId, eraData);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const projectEras = newUserData.projects[currentProjectId].eras;
                const eraIndex = projectEras.findIndex((e: Era) => e.id === eraId);

                if (eraIndex !== -1) {
                    projectEras[eraIndex] = updatedEra;
                }
                return { userData: newUserData };
            });

            toast.success(`Era "${updatedEra.name}" has been updated.`);
        } catch (err) {
            let errorMessage = 'Failed to update era.';
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

    deleteEra: async (eraId) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        const eraName = get().userData?.projects[currentProjectId]?.eras.find(e => e.id === eraId)?.name;

        try {
            set({ isLoading: true, error: null });
            // This line sends the command to the backend.
            await deleteEraApi(currentProjectId, eraId);

            // This part updates the local state AFTER the API call succeeds.
            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const project = newUserData.projects[currentProjectId];
                // Also delete all events associated with this era, as the old logic did.
                project.timeline = project.timeline.filter((e: TimelineEvent) => e.eraId !== eraId);
                project.eras = project.eras.filter((e: Era) => e.id !== eraId);
                return { userData: newUserData };
            });

            if (eraName) {
                toast.success(`The "${eraName}" and all its events have ended.`);
            }
        } catch (err) {
            let errorMessage = 'Failed to delete era.';
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


    reorderEras: async (eraIds) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            // The API returns the complete, newly sorted list of eras.
            const reorderedEras = await reorderErasApi(currentProjectId, { orderedIds: eraIds });

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                // We replace the entire eras array with the authoritative new one from the server.
                newUserData.projects[currentProjectId].eras = reorderedEras;
                return { userData: newUserData };
            });

            toast.success("Eras have been reordered.");
        } catch (err) {
            let errorMessage = 'Failed to reorder eras.';
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
    reorderEventsInEra: async (eraId, eventIds) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            // The API returns the complete, newly sorted timeline for the entire project.
            const reorderedTimeline = await reorderEventsInEraApi(currentProjectId, eraId, {
                orderedIds: eventIds,
            });

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                // We replace the entire timeline array with the authoritative new one from the server.
                newUserData.projects[currentProjectId].timeline = reorderedTimeline;
                return { userData: newUserData };
            });

            toast.success("Events have been reordered.");
        } catch (err) {
            let errorMessage = 'Failed to reorder events.';
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


    // World Action
    addWorld: async (worldData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) {
            toast.error('No active project selected.');
            return;
        }

        try {
            set({ isLoading: true, error: null });
            const newWorld = await createWorld(currentProjectId, worldData);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].worlds.push(newWorld);
                return { userData: newUserData };
            });

            toast.success(`Realm "${newWorld.name}" has been forged.`);
        } catch (err) {
            let errorMessage = 'Failed to create world.';
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

    updateWorld: async (worldId, worldData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            // Note: The API expects the full world object for an update.
            // We get the original world to merge with the partial update data.
            const originalWorld = get().userData?.projects[currentProjectId]?.worlds.find(w => w.id === worldId);
            if (!originalWorld) throw new Error("World not found");

            const fullUpdateData = { ...originalWorld, ...worldData };

            const updatedWorld = await updateWorldApi(
                currentProjectId,
                worldId,
                fullUpdateData,
            );

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const projectWorlds = newUserData.projects[currentProjectId].worlds;
                const worldIndex = projectWorlds.findIndex((w: World) => w.id === worldId);

                if (worldIndex !== -1) {
                    projectWorlds[worldIndex] = updatedWorld;
                }
                return { userData: newUserData };
            });

            toast.success(`Realm "${updatedWorld.name}" has been updated.`);
        } catch (err) {
            let errorMessage = 'Failed to update world.';
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

    deleteWorld: async (worldId) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        const worldName = get().userData?.projects[currentProjectId]?.worlds.find(w => w.id === worldId)?.name;

        try {
            set({ isLoading: true, error: null });
            await deleteWorldApi(currentProjectId, worldId);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].worlds =
                    newUserData.projects[currentProjectId].worlds.filter((w: World) => w.id !== worldId);
                return { userData: newUserData };
            });

            if (worldName) {
                toast.success(`Realm "${worldName}" has been unmade.`);
            }
        } catch (err) {
            let errorMessage = 'Failed to delete world.';
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


    // Writing Page
    addWriting: async (writingData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) {
            toast.error('No active project selected.');
            return;
        }

        try {
            set({ isLoading: true, error: null });
            const newWriting = await createWriting(currentProjectId, writingData);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                // Add the new manuscript to the top of the list for immediate visibility.
                newUserData.projects[currentProjectId].writings.unshift(newWriting);
                return { userData: newUserData };
            });

            toast.success(`Manuscript "${newWriting.title}" has been archived.`);
        } catch (err) {
            let errorMessage = 'Failed to create manuscript.';
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

    updateWriting: async (writingId, writingData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            const updatedWriting = await updateWritingApi(
                currentProjectId,
                writingId,
                writingData,
            );

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const projectWritings = newUserData.projects[currentProjectId].writings;
                const writingIndex = projectWritings.findIndex((w: WritingEntry) => w.id === writingId);

                if (writingIndex !== -1) {
                    projectWritings[writingIndex] = updatedWriting;
                }
                return { userData: newUserData };
            });

            toast.success(`Manuscript "${updatedWriting.title}" has been updated.`);
        } catch (err) {
            let errorMessage = 'Failed to update manuscript.';
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

    deleteWriting: async (writingId) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        const writingTitle = get().userData?.projects[currentProjectId]?.writings.find(w => w.id === writingId)?.title;

        try {
            set({ isLoading: true, error: null });
            await deleteWritingApi(currentProjectId, writingId);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].writings =
                    newUserData.projects[currentProjectId].writings.filter((w: WritingEntry) => w.id !== writingId);
                return { userData: newUserData };
            });

            if (writingTitle) {
                toast.success(`Manuscript "${writingTitle}" consigned to the flames.`);
            }
        } catch (err) {
            let errorMessage = 'Failed to delete manuscript.';
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



    // Catalogue Actions
    addCatalogueItem: async (itemData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            const newItem = await createCatalogueItem(currentProjectId, itemData);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                if (!newUserData.projects[currentProjectId].catalogue) {
                    newUserData.projects[currentProjectId].catalogue = [];
                }
                newUserData.projects[currentProjectId].catalogue.push(newItem);
                return { userData: newUserData };
            });

            toast.success(`Curiosity "${newItem.name}" added to the catalogue.`);
        } catch (err) {
            let errorMessage = 'Failed to add item to catalogue.';
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

    updateCatalogueItem: async (itemId, itemData) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        try {
            set({ isLoading: true, error: null });
            const updatedItem = await updateCatalogueItemApi(
                currentProjectId,
                itemId,
                itemData,
            );

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                const projectCatalogue = newUserData.projects[currentProjectId].catalogue;
                const itemIndex = projectCatalogue.findIndex((i: CatalogueItem) => i.id === itemId);

                if (itemIndex !== -1) {
                    projectCatalogue[itemIndex] = updatedItem;
                }
                return { userData: newUserData };
            });

            toast.success(`Curiosity "${updatedItem.name}" updated.`);
        } catch (err) {
            let errorMessage = 'Failed to update item.';
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

    deleteCatalogueItem: async (itemId) => {
        const { currentProjectId } = get();
        if (!currentProjectId) return;

        const itemName = get().userData?.projects[currentProjectId]?.catalogue.find(i => i.id === itemId)?.name;

        try {
            set({ isLoading: true, error: null });
            await deleteCatalogueItemApi(currentProjectId, itemId);

            set((state) => {
                if (!state.userData) return state;
                const newUserData = JSON.parse(JSON.stringify(state.userData));
                newUserData.projects[currentProjectId].catalogue =
                    newUserData.projects[currentProjectId].catalogue.filter((i: CatalogueItem) => i.id !== itemId);
                return { userData: newUserData };
            });

            if (itemName) {
                toast.success(`Curiosity "${itemName}" removed from the catalogue.`);
            }
        } catch (err) {
            let errorMessage = 'Failed to delete item.';
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

}));