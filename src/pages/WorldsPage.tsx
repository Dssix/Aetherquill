import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { type World } from '../types/world';
import WorldForm from '../components/WorldForm';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import EmptyGalleryPlaceholder from '../components/ui/placeholders/EmptyGalleryPlaceholder';

// Icon Define
const WorldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <circle cx="12" cy="12" r="9" />
        <line x1="3.6" y1="9" x2="20.4" y2="9" />
        <line x1="3.6" y1="15" x2="20.4" y2="15" />
        <path d="M11.5 3a17 17 0 0 0 0 18" />
        <path d="M12.5 3a17 17 0 0 1 0 18" />
    </svg>
);

const WorldsPage: React.FC = () => {
    const { userData, currentProjectId, addWorld, updateWorld, deleteWorld } = useAppStore();

    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);

    const worlds = useMemo(() => projectData?.worlds || [], [projectData]);
    const characters = useMemo(() => projectData?.characters || [], [projectData]);
    const writings = useMemo(() => projectData?.writings || [], [projectData]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);

    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [worldToEdit, setWorldToEdit] = useState<World | null>(null);

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

    if (!projectData) {
        return <div className="p-8 text-center">Loading project data...</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">🌍 Realms & Regions</h1>
                    <p className="text-foreground/70 italic mt-1">From the chronicle: {projectData.name}</p>
                </div>
                <Button onClick={openPanelForAdd}>
                    + Forge New World
                </Button>
            </div>

            {worlds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {worlds.map((world) => {
                        // Look up the names of all linked entities
                        const linkedChars = world.linkedCharacterIds?.map(id => characters.find(c => c.id === id)?.name).filter(Boolean);
                        const linkedWritings = world.linkedWritingIds?.map(id => writings.find(w => w.id === id)?.title).filter(Boolean);
                        const linkedEvents = world.linkedEventIds?.map(id => events.find(e => e.id === id)?.title).filter(Boolean);

                        return (
                            <Link to={`/worlds/${world.id}`} key={world.id}>
                                <Card key={world.id} className="opacity-0 animate-fade-in-up flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">{world.name}</h3>
                                        <p className="text-sm text-primary font-semibold">{world.theme}</p>
                                        <p className="text-sm text-foreground/70 mb-4">{world.setting}</p>
                                        <p className="text-base text-foreground/90 leading-relaxed line-clamp-3">{world.description}</p>
                                    </div>

                                    {(linkedChars?.length || linkedWritings?.length || linkedEvents?.length) && (
                                        <div className="mt-4 pt-4 border-t border-border text-xs text-foreground/70 space-y-1">
                                            {linkedChars && linkedChars.length > 0 && <p><strong>Inhabitants:</strong> {linkedChars.slice(0, 2).join(', ')}{linkedChars.length > 2 ? '...' : ''}</p>}
                                            {linkedWritings && linkedWritings.length > 0 && <p><strong>Lore:</strong> {linkedWritings.slice(0, 2).join(', ')}{linkedWritings.length > 2 ? '...' : ''}</p>}
                                            {linkedEvents && linkedEvents.length > 0 && <p><strong>History:</strong> {linkedEvents.slice(0, 2).join(', ')}{linkedEvents.length > 2 ? '...' : ''}</p>}
                                        </div>
                                    )}

                                    <div className="text-right mt-4 pt-4 border-t border-border flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            className="!px-3 !py-1 text-xs"
                                            onClick={(e) => {
                                                e.preventDefault(); // Cast the spell of prevention
                                                openPanelForEdit(world);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="!px-3 !py-1 text-xs !text-destructive !border-red-800/30 hover:!bg-red-500/10"
                                            onClick={(e) => {
                                                e.preventDefault(); // Cast the spell of prevention
                                                handleDelete(world);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
                ) : (
                // If no worlds exist, we render our beautiful new placeholder.
                <EmptyGalleryPlaceholder
                    icon={<WorldIcon />}
                    title="The Uncharted Cosmos"
                    message="Every story needs a stage. Forge thy first realm to give thy tale a home."
                />
            )}

            <WorldForm
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSave}
                worldToEdit={worldToEdit}
                characters={characters}
                writings={writings}
                events={events}
            />
        </div>
    );
};

export default WorldsPage;