import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore.ts';
import { type Character } from 'aetherquill-common';
import AddCharacterPanel from '../components/panels/AddCharacterPanel.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import TraitDisplay from '../components/ui/TraitDisplay.tsx';
import { Link } from 'react-router-dom';
import EmptyGalleryPlaceholder from '../components/ui/placeholders/EmptyGalleryPlaceholder.tsx';

// Icon Define
const CrestIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 21l-8 -4.5v-9l8 -4.5l8 4.5v9z" />
        <path d="M12 12l8 -4.5" />
        <path d="M12 12v9" />
        <path d="M12 12l-8 -4.5" />
    </svg>
);

const CharacterPage: React.FC = () => {
    // Import from the useAppStore
    const { userData, currentProjectId, addCharacter, updateCharacter, deleteCharacter } = useAppStore();


    // This state controls the visibility of our creation panel.
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);


    // Loading the Project specific data
    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);
    const characters = projectData?.characters || [];
    const worlds = projectData?.worlds || [];
    const writings = projectData?.writings || [];


    // --- Handler Function ---
    // This function is passed to the panel. It receives the form data,
    // adds a unique ID, and updates our character list.
    const handleSaveCharacter = (characterData: Omit<Character, 'id'>) => {
        if (characterToEdit) {
            updateCharacter(characterToEdit.id, characterData);
        } else {
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


    // Safety Check in case user navigates here without project
    if (!projectData) {
        return <div className="p-8 text-center">Loading project data or invalid project selected...</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">🧝 Living Souls</h1>
                    <p className="text-foreground/70 italic mt-1">From the chronicle: {projectData.name}</p>
                </div>
                <Button onClick={openPanelForAdd}>
                    + Add New Character
                </Button>
            </div>

            {characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {characters.map(character => {
                        const backgroundTrait = character.traits.find(trait => trait.id === 'background');
                        const worldName = getWorldName(character.linkedWorldId);
                        const writingTitles = getWritingTitles(character.linkedWritingIds);

                        return (
                            <Link to={`/characters/${character.id}`} key={character.id}>
                                <Card key={character.id} className="opacity-0 animate-fade-in-up flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground border-b border-border pb-2 mb-3">{character.name}</h3>
                                        <p className="text-sm text-primary font-semibold">{character.species}</p>
                                        {/* --- Step 5: Display the world name --- */}
                                        {worldName && <p className="text-xs text-foreground/60 mt-1">🌍 {worldName}</p>}
                                        {backgroundTrait && <p className="mt-2 text-foreground/90 italic line-clamp-3">"{backgroundTrait.value}"</p>}
                                    </div>

                                    {/* The unified traits section remains the same */}
                                    {character.traits && character.traits.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <div className="space-y-1">
                                                {character.traits.map((trait) => (
                                                    trait.id !== 'background' && <TraitDisplay key={trait.id} label={trait.label} value={trait.value} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {writingTitles.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <h4 className="text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">✍️ Mentions</h4>
                                            <div className="space-y-1 text-sm text-muted-foreground">
                                                {writingTitles.map(title => <p key={title}>- {title}</p>)}
                                            </div>
                                        </div>
                                    )}

                                    {/* --- Add Edit and Delete buttons --- */}
                                    <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            className="!px-3 !py-1 text-xs"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openPanelForEdit(character);
                                            }}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="!px-3 !py-1 text-xs !text-destructive !border-red-800/30 hover:!bg-red-500/10"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeleteCharacter(character.id);
                                            }}>
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
                ):(
                // Empty State
                <EmptyGalleryPlaceholder
                    icon={<CrestIcon />}
                    title="The Stage is Set"
                    message="The gallery awaits the souls of thy tale. Summon forth a new character to begin their journey."
                />
            )}

            {/* --- The Panel Itself --- */}
            <AddCharacterPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSaveCharacter}
                characterToEdit={characterToEdit}
                worlds={worlds}
                writings={writings}
            />
        </div>
    );
};

export default CharacterPage;