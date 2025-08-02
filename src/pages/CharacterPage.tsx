import React, { useState } from 'react';
import { useCharacterStore } from '../stores/useCharacterStore';
import { useWorldStore } from '../stores/useWorldStore';
import { type Character } from '../types/character';
import AddCharacterPanel from '../components/panels/AddCharacterPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TraitDisplay from '../components/ui/TraitDisplay';
import {useWritingStore} from "../stores/useWritingStore.ts";

const CharacterPage: React.FC = () => {
    const { characters, addCharacter, updateCharacter, deleteCharacter } = useCharacterStore();
    const { worlds } = useWorldStore();
    const { writings } = useWritingStore();

    // This state controls the visibility of our creation panel.
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);

    // --- Handler Function ---
    // This function is passed to the panel. It receives the form data,
    // adds a unique ID, and updates our character list.
    const handleSaveCharacter = (characterData: Omit<Character, 'id'>) => {
        if (characterToEdit) {
            // If we were editing, call the update action.
            updateCharacter(characterToEdit.id, characterData);
        } else {
            // Otherwise, call the add action.
            addCharacter(characterData);
        }
        setCharacterToEdit(null);
    };

    const handleDeleteCharacter = (characterId: string) => {
        if (window.confirm("Are you sure you wish to banish this soul from the chronicle?")) {
            deleteCharacter(characterId);
        }
    };

    const openPanelForEdit = (character: Character) => {
        setCharacterToEdit(character);
        setIsPanelOpen(true);
    };

    const openPanelForAdd = () => {
        setCharacterToEdit(null);
        setIsPanelOpen(true);
    };

    const getWorldName = (worldId: string | null) => {
        if (!worldId) return null;
        return worlds.find(w => w.id === worldId)?.name;
    };

    const getWritingTitles = (writingIds: string[] | undefined) => {
        if (!writingIds || writingIds.length === 0) return [];
        return writingIds.map(id => writings.find(w => w.id === id)?.title).filter(Boolean) as string[];
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold text-ink-brown">🧝 Living Souls</h1>
                    <p className="text-ink-brown/70 italic mt-1">The heroes, villains, and folk of thy realm.</p>
                </div>
                <Button onClick={openPanelForAdd}>
                    + Add New Character
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map(character => {
                    const backgroundTrait = character.traits.find(trait => trait.id === 'background');
                    const worldName = getWorldName(character.linkedWorldId);
                    const writingTitles = getWritingTitles(character.linkedWritingIds);

                    return (
                        <Card key={character.id} className="animate-fade-in-up opacity-0 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-ink-brown border-b border-ink-brown/10 pb-2 mb-3">{character.name}</h3>
                                <p className="text-sm text-gold-leaf font-semibold">{character.species}</p>
                                {/* --- Step 5: Display the world name --- */}
                                {worldName && <p className="text-xs text-ink-brown/60 mt-1">🌍 {worldName}</p>}
                                {backgroundTrait && <p className="mt-2 text-ink-brown/90 italic line-clamp-3">"{backgroundTrait.value}"</p>}
                            </div>

                            {/* The unified traits section remains the same */}
                            {character.traits && character.traits.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-ink-brown/10">
                                    <div className="space-y-1">
                                        {character.traits.map((trait) => (
                                            trait.id !== 'background' && <TraitDisplay key={trait.id} label={trait.label} value={trait.value} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {writingTitles.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-ink-brown/10">
                                    <h4 className="text-xs font-bold text-ink-brown/70 uppercase tracking-wider mb-2">✍️ Mentions</h4>
                                    <div className="space-y-1 text-sm text-ink-brown/80">
                                        {writingTitles.map(title => <p key={title}>- {title}</p>)}
                                    </div>
                                </div>
                            )}

                            {/* --- Add Edit and Delete buttons --- */}
                            <div className="mt-4 pt-4 border-t border-ink-brown/10 flex justify-end gap-2">
                                <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={() => openPanelForEdit(character)}>Edit</Button>
                                <Button variant="secondary" className="!px-3 !py-1 text-xs !text-red-800/80 !border-red-800/30 hover:!bg-red-500/10" onClick={() => handleDeleteCharacter(character.id)}>Delete</Button>
                            </div>
                        </Card>
                    );
                })}
            </div>


            {/* --- Empty State Message --- */}
            {characters.length === 0 && (
                <Card className="text-center mb-12 md:mb-16 opacity-0 animate-fade-in-up">
                    <p className="text-lg text-ink-brown/90 my-6 leading-relaxed">
                        The gallery is empty.
                        <br />
                        Summon forth a new soul to begin thy cast.
                    </p>
                </Card>
            )}

            {/* --- The Panel Itself --- */}
            <AddCharacterPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSaveCharacter}
                characterToEdit={characterToEdit}
            />
        </div>
    );
};

export default CharacterPage;