import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type World } from '../types/world';

// The state now includes the full World type.
interface WorldState {
    worlds: World[];
    addWorld: (worldData: Omit<World, 'id'>) => void;
    deleteWorld: (worldId: string) => void;
    updateWorld: (worldId: string, updatedData: Partial<Omit<World, 'id'>>) => void;
}

export const useWorldStore = create<WorldState>()(
    persist(
        (set) => ({
            // The initial state remains an empty array.
            worlds: [],

            // --- Update the actions to handle the new properties ---
            addWorld: (worldData) => {
                // The '...worldData' spread will now correctly include all the linked...Ids arrays.
                const newWorld: World = { id: `world_${Date.now()}`, ...worldData };
                set((state) => ({ worlds: [...state.worlds, newWorld] }));
            },

            deleteWorld: (worldId) => {
                set((state) => ({
                    worlds: state.worlds.filter((world) => world.id !== worldId),
                }));
            },

            updateWorld: (worldId, updatedData) => {
                set((state) => ({
                    worlds: state.worlds.map((world) =>
                        // The '...updatedData' spread will correctly overwrite the linked...Ids arrays.
                        world.id === worldId ? { ...world, ...updatedData } : world
                    ),
                }));
            },
        }),
        {
            name: 'aetherquill-worlds-storage',
        }
    )
);