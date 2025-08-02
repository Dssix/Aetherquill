import React, { useState } from 'react';
import { useWorldStore } from '../stores/useWorldStore';
import { useCharacterStore } from '../stores/useCharacterStore';
import { useWritingStore } from '../stores/useWritingStore';
import { useTimelineEventStore } from '../stores/useTimelineEventStore';
import { type World } from '../types/world';
import WorldForm from '../components/WorldForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const WorldsPage: React.FC = () => {
    // Summon all our librarians
    const { worlds, addWorld, updateWorld, deleteWorld } = useWorldStore();
    const { characters } = useCharacterStore();
    const { writings } = useWritingStore();
    const { events } = useTimelineEventStore();

    // UI state for the panel
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [worldToEdit, setWorldToEdit] = useState<World | null>(null);

    // Handlers to connect the UI to the store's actions
    const handleSave = (data: Omit<World, 'id'>) => {
        if (worldToEdit) {
            updateWorld(worldToEdit.id, data);
        } else {
            addWorld(data);
        }
    };

    const handleDelete = (world: World) => {
        if (window.confirm(`Are you sure you wish to unmake the world of "${world.name}"?`)) {
            deleteWorld(world.id);
        }
    };

    const openPanelForEdit = (world: World) => {
        setWorldToEdit(world);
        setIsPanelOpen(true);
    };

    const openPanelForAdd = () => {
        setWorldToEdit(null);
        setIsPanelOpen(true);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold text-ink-brown">🌍 Realms & Regions</h1>
                    <p className="text-ink-brown/70 italic mt-1">The stages upon which thy sagas unfold.</p>
                </div>
                <Button onClick={openPanelForAdd}>
                    + Forge New World
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worlds.map((world) => {
                    // Look up the names of all linked entities
                    const linkedChars = world.linkedCharacterIds?.map(id => characters.find(c => c.id === id)?.name).filter(Boolean);
                    const linkedWritings = world.linkedWritingIds?.map(id => writings.find(w => w.id === id)?.title).filter(Boolean);
                    const linkedEvents = world.linkedEventIds?.map(id => events.find(e => e.id === id)?.title).filter(Boolean);

                    return (
                        <Card key={world.id} className="animate-fade-in-up flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-ink-brown mb-2">{world.name}</h3>
                                <p className="text-sm text-gold-leaf font-semibold">{world.theme}</p>
                                <p className="text-sm text-ink-brown/70 mb-4">{world.setting}</p>
                                <p className="text-base text-ink-brown/90 leading-relaxed line-clamp-3">{world.description}</p>
                            </div>

                            {/* The new section for displaying links */}
                            {(linkedChars?.length || linkedWritings?.length || linkedEvents?.length) && (
                                <div className="mt-4 pt-4 border-t border-ink-brown/10 text-xs text-ink-brown/70 space-y-1">
                                    {linkedChars && linkedChars.length > 0 && <p><strong>Inhabitants:</strong> {linkedChars.slice(0, 2).join(', ')}{linkedChars.length > 2 ? '...' : ''}</p>}
                                    {linkedWritings && linkedWritings.length > 0 && <p><strong>Lore:</strong> {linkedWritings.slice(0, 2).join(', ')}{linkedWritings.length > 2 ? '...' : ''}</p>}
                                    {linkedEvents && linkedEvents.length > 0 && <p><strong>History:</strong> {linkedEvents.slice(0, 2).join(', ')}{linkedEvents.length > 2 ? '...' : ''}</p>}
                                </div>
                            )}

                            <div className="text-right mt-4 pt-4 border-t border-ink-brown/10 flex justify-end gap-2">
                                <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={() => openPanelForEdit(world)}>Edit</Button>
                                <Button variant="secondary" className="!px-3 !py-1 text-xs !text-red-800/80 !border-red-800/30 hover:!bg-red-500/10" onClick={() => handleDelete(world)}>Delete</Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {worlds.length === 0 && (
                <Card className="text-center opacity-0 animate-fade-in-up col-span-full">
                    <p className="text-lg text-ink-brown/90 my-6">The cosmos is empty. Forge thy first world to begin.</p>
                </Card>
            )}

            <WorldForm
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSave}
                worldToEdit={worldToEdit}
            />
        </div>
    );
};

export default WorldsPage;