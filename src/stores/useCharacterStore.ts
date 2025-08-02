import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Character } from '../types/character';

// This defines the shape of our store's state and its actions.
interface CharacterState {
    characters: Character[];
    addCharacter: (characterData: Omit<Character, 'id'>) => void;
    deleteCharacter: (characterId: string) => void;
    updateCharacter: (characterId: string, updatedData: Omit<Character, 'id'>) => void;
}

// We create the store, wrapping it in the 'persist' middleware to save to localStorage.
export const useCharacterStore = create<CharacterState>()(
    persist(
        (set) => ({
            // The initial state is an empty array.
            characters: [],

            // Action to add a new character.
            addCharacter: (characterData) => {
                const newCharacter: Character = { id: `char_${Date.now()}`, ...characterData };
                set((state) => ({ characters: [...state.characters, newCharacter] }));
            },

            // Action to delete a character by their ID.
            deleteCharacter: (characterId) => {
                set((state) => ({
                    characters: state.characters.filter((char) => char.id !== characterId),
                }));
            },

            // Action to update an existing character.
            updateCharacter: (characterId, updatedData) => {
                set((state) => ({
                    characters: state.characters.map((char) =>
                        char.id === characterId ? { ...char, ...updatedData, id: char.id } : char
                    ),
                }));
            },
        }),
        {
            name: 'aetherquill-characters-storage', // The key for localStorage
        }
    )
);