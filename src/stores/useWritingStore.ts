import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The blueprint for a single manuscript.
export interface WritingEntry {
    id: string;
    title: string;
    content: string;
    tags?: string[];
    linkedCharacterIds?: string[];
    linkedWorldId?: string | null;
    linkedEventIds?: string[];
    createdAt: number;
    updatedAt: number;
}

// The shape of our library's state and the actions of our librarian.
interface WritingState {
    writings: WritingEntry[];
    addWriting: (data: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateWriting: (id: string, data: Partial<Omit<WritingEntry, 'id'>>) => void;
    deleteWriting: (id: string) => void;
}

export const useWritingStore = create<WritingState>()(
    persist(
        (set) => ({
            // The library starts empty.
            writings: [],

            // Add a new manuscript.
            addWriting: (data) => {
                const now = Date.now();
                const newWriting: WritingEntry = {
                    id: `writing_${now}`,
                    ...data,
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({ writings: [newWriting, ...state.writings] })); // Add to the top of the list
            },

            // Update an existing manuscript.
            updateWriting: (id: string, data: Partial<Omit<WritingEntry, 'id'>>) => {
                set((state) => ({
                    writings: state.writings.map((entry) =>
                        entry.id === id ? { ...entry, ...data, updatedAt: Date.now() } : entry
                    ),
                }));
            },

            // Remove a manuscript from the library.
            deleteWriting: (id) => {
                set((state) => ({
                    writings: state.writings.filter((entry) => entry.id !== id),
                }));
            },
        }),
        {
            name: 'aetherquill-writings-storage', // The key for our library in localStorage.
        }
    )
);