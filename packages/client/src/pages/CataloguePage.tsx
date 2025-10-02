import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore.ts';
import { type CatalogueItem } from '../types/catalogue.ts';
import AddCatalogueItemPanel from '../components/panels/AddCatalogueItemPanel.tsx';
import Card from '../components/ui/Card.tsx';
import Button from '../components/ui/Button.tsx';
import EmptyGalleryPlaceholder from '../components/ui/placeholders/EmptyGalleryPlaceholder.tsx';
import { Link } from 'react-router-dom';

// A fitting icon for our empty state.
const MagnifyingGlassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const CataloguePage: React.FC = () => {
    // --- Step 1: Summon all necessary data and actions from the master store ---
    const {
        userData, currentProjectId,
        addCatalogueItem, updateCatalogueItem, deleteCatalogueItem
    } = useAppStore();

    // --- Step 2: Derive all project-specific data ---
    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);

    const catalogue = useMemo(() => projectData?.catalogue || [], [projectData]);
    const characters = useMemo(() => projectData?.characters || [], [projectData]);
    const worlds = useMemo(() => projectData?.worlds || [], [projectData]);
    const writings = useMemo(() => projectData?.writings || [], [projectData]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);

    // --- Step 3: UI State for the panel and filters ---
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<CatalogueItem | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    // --- Step 4: Memoized logic for filtering and categories ---
    const categories = useMemo(() => {
        const allCats = catalogue.map(item => item.category);
        return ['All', ...Array.from(new Set(allCats)).sort()];
    }, [catalogue]);

    const filteredCatalogue = useMemo(() => {
        if (activeCategory === 'All') return catalogue;
        return catalogue.filter(item => item.category === activeCategory);
    }, [catalogue, activeCategory]);

    // --- Step 5: Handlers to connect UI to store actions ---
    const handleSave = (data: Omit<CatalogueItem, 'id'>) => {
        if (itemToEdit) {
            updateCatalogueItem(itemToEdit.id, data);
        } else {
            addCatalogueItem(data);
        }
    };
    const handleDelete = (item: CatalogueItem) => {
        if (window.confirm(`Remove "${item.name}" from the catalogue?`)) {
            deleteCatalogueItem(item.id);
        }
    };
    const openPanelForEdit = (item: CatalogueItem) => { setItemToEdit(item); setIsPanelOpen(true); };
    const openPanelForAdd = () => { setItemToEdit(null); setIsPanelOpen(true); };

    if (!projectData) {
        return <div className="p-8 text-center">Loading project data...</div>;
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-4xl font-bold text-foreground">📦 Catalogue of Curiosities</h1>
                    <p className="text-muted-foreground italic mt-1">From the chronicle: {projectData.name}</p>
                </div>
                <Button onClick={openPanelForAdd}>+ Add Curiosity</Button>
            </div>

            {/* --- Category Filter Bar --- */}
            <div className="mb-8 flex flex-wrap gap-2 animate-fade-in-down">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            activeCategory === category
                                ? 'bg-primary text-primary-foreground font-semibold'
                                : 'bg-card hover:bg-primary/10'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* --- Gallery Grid --- */}
            {catalogue.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCatalogue.map((item) => {
                        const worldName = worlds.find(w => w.id === item.linkedWorldId)?.name;
                        return (
                            <Link to={`/catalogue/${item.id}`} key={item.id}>
                                <Card className="opacity-0 animate-fade-in-up flex flex-col justify-between h-full hover:!border-accent">
                                    <div>
                                        <p className="text-xs text-primary font-semibold uppercase tracking-wider">{item.category}</p>
                                        <h3 className="text-xl font-bold text-foreground mb-2">{item.name}</h3>
                                        {worldName && <p className="text-xs text-muted-foreground mb-4">🌍 {worldName}</p>}
                                        <p className="prose prose-sm text-muted-foreground leading-relaxed line-clamp-4">{item.description}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            className="!px-3 !py-1 text-xs"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                openPanelForEdit(item);
                                            }}>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="!px-3 !py-1 text-xs !text-destructive !border-red-800/30 hover:!bg-red-500/10"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDelete(item)
                                            }}>
                                            Delete
                                        </Button>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <EmptyGalleryPlaceholder
                    icon={<MagnifyingGlassIcon />}
                    title="The Shelves are Bare"
                    message="The catalogue is empty. Add your first curiosity—a creature, an artifact, a plant—to begin."
                />
            )}

            <AddCatalogueItemPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={handleSave}
                itemToEdit={itemToEdit}
                characters={characters}
                worlds={worlds}
                writings={writings}
                events={events}
            />
        </div>
    );
};

export default CataloguePage;