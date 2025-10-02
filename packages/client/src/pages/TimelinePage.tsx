import React, { useState, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type TimelineEvent } from '../data/timelineEvents.ts';
import {type Era} from '../data/eraManager.ts'; // We'll need to refactor Eras next
import { useAppStore } from '../stores/useAppStore.ts';
import { EraForm } from '../components/EraForm.tsx';
import { getUniqueTags } from '../utils/tagUtils.ts';
import TimelineNode from '../components/TimelineNode.tsx';
import TagFilter from '../components/TagFilter.tsx';
import { EventForm } from '../components/EventForm.tsx';
import EraDivider from '../components/EraDivider.tsx';
import Button from '../components/ui/Button.tsx';

const TimelinePage: React.FC = () => {
    const {
        userData, currentProjectId,
        addTimelineEvent, updateTimelineEvent, deleteTimelineEvent,
        addEra, updateEra, deleteEra, reorderEras, reorderEventsInEra
    } = useAppStore();


    // Project Specific Data
    const projectData = useMemo(() => {
        if (!userData || !currentProjectId) return null;
        return userData.projects[currentProjectId];
    }, [userData, currentProjectId]);
    const events = useMemo(() => projectData?.timeline || [], [projectData]);
    const eras = useMemo(() => projectData?.eras || [], [projectData]);
    const characters = useMemo(() => projectData?.characters || [], [projectData]);
    const writings = useMemo(() => projectData?.writings || [], [projectData]);

    const [activeEventIdentifier, setActiveEventIdentifier] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isEventFormOpen, setIsEventFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
    const [isEraFormOpen, setIsEraFormOpen] = useState(false);
    const [editingEra, setEditingEra] = useState<Era | null>(null);

    const uniqueTags = useMemo(() => getUniqueTags(events), [events]);

    const filteredEvents = useMemo(() => {
        if (selectedTags.length === 0) return events;
        return events.filter(event =>
            event.tags?.some(tag => selectedTags.includes(tag))
        );
    }, [events, selectedTags]);

    const sortedErasWithEvents = useMemo(() => {
        // 1. Sort the Eras themselves based on their 'order' property.
        const sortedEras = [...eras].sort((a, b) => a.order - b.order);

        // 2. Group all filtered events by their mandatory 'eraId'.
        const eventsByEra = filteredEvents.reduce((acc, event) => {
            const key = event.eraId;
            if (!acc[key]) { acc[key] = []; }
            acc[key].push(event);
            return acc;
        }, {} as Record<string, TimelineEvent[]>);

        // 3. For each sorted Era, get its events and sort THEM by their own 'order' property.
        return sortedEras.map(era => ({
            ...era,
            events: (eventsByEra[era.id] || []).sort((a, b) => a.order - b.order)
        }));

    }, [eras, filteredEvents]);

    useEffect(() => {
        if (activeEventIdentifier) {
            const isActiveEventVisible = filteredEvents.some(event => event.id === activeEventIdentifier);
            if (!isActiveEventVisible) {
                setActiveEventIdentifier(null);
            }
        }
    }, [filteredEvents, activeEventIdentifier]);

    // Sensor for Drag-and-Drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // handle drag for era
    const handleEraDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sortedErasWithEvents.findIndex(era => era.id === active.id);
            const newIndex = sortedErasWithEvents.findIndex(era => era.id === over.id);

            // Use the arrayMove utility to get the new array
            const reorderedErasArray = arrayMove(sortedErasWithEvents, oldIndex, newIndex);
            // Extract just the IDs in the new order
            const reorderedEraIds = reorderedErasArray.map(era => era.id);

            // Call the store action to persist the new order
            reorderEras(reorderedEraIds);
        }
    };


    // handle drag for events
    const handleEventDragEnd = (event: DragEndEvent, eraId: string) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            // Find the events for the current era to get their current order
            const currentEra = sortedErasWithEvents.find(e => e.id === eraId);
            if (!currentEra) return;

            const oldIndex = currentEra.events.findIndex(e => e.id === active.id);
            const newIndex = currentEra.events.findIndex(e => e.id === over.id);

            const reorderedEventsArray = arrayMove(currentEra.events, oldIndex, newIndex);
            const reorderedEventIds = reorderedEventsArray.map(e => e.id);

            // Call the store action to persist the new order for this specific era
            reorderEventsInEra(eraId, reorderedEventIds);
        }
    };

    const handleAddEvent = (data: Omit<TimelineEvent, 'id' | 'order'>) => {
        // The 'data' object from the form now includes the correct 'eraId'.
        // The store action will automatically handle setting the 'order'.
        addTimelineEvent(data);
        setIsEventFormOpen(false);
    };
    const handleUpdateEvent = (data: Omit<TimelineEvent, 'id' | 'order'>) => {
        if (!editingEvent) return;
        // The 'data' from the form has all the updated info.
        updateTimelineEvent(editingEvent.id, data);
        setEditingEvent(null);
        setIsEventFormOpen(false);
    };

    const handleDeleteEvent = (id: string) => {
        if (window.confirm("Are you sure you wish to erase this entry?")) {
            deleteTimelineEvent(id); // Call new store action
        }
    };

    // Era Handlers
    const handleAddEra = (data: Omit<Era, 'id' | 'order'>) => {
        // The handler now takes the simple data from the form
        // and adds the 'order' property itself before sending it to the store.
        // (The store will still assign the final 'id').
        addEra(data);
        setIsEraFormOpen(false);
    };
    const handleUpdateEra = (data: Omit<Era, 'id' | 'order'>) => {
        if (!editingEra) return;
        // We now only pass the data that has changed. The store will handle merging it.
        updateEra(editingEra.id, data);
        setEditingEra(null);
        setIsEraFormOpen(false);
    };
    const handleDeleteEra = (era: Era) => {
        if (window.confirm(`Delete the era "${era.name}" and all its events? This cannot be undone.`)) {
            deleteEra(era.id);
        }
    }

    const handleOpenEventFormForEdit = (event: TimelineEvent) => { setEditingEvent(event); setIsEventFormOpen(true); };
    const handleOpenEventFormForAdd = () => { setEditingEvent(null); setIsEventFormOpen(true); };
    const handleOpenEraFormForEdit = (era: Era) => { setEditingEra(era); setIsEraFormOpen(true); };
    const handleOpenEraFormForAdd = () => { setEditingEra(null); setIsEraFormOpen(true); };


    const handleTagChange = (tag: string) => {
        setSelectedTags(prevTags =>
            prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
        );
    };

    const handleNodeClick = (identifier: string) => {
        setActiveEventIdentifier(prevIdentifier => (prevIdentifier === identifier ? null : identifier));
    };


    // Security Check
    if (!projectData) {
        return <div className="p-8 text-center">Loading project data...</div>;
    }

    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-8">
            <h1 className="text-4xl font-bold text-foreground text-center mb-2">Chronicle of Eras</h1>
            <p className="text-foreground/70 italic text-center mb-8">For the chronicle: {projectData.name}</p>
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-center items-center gap-4 mb-8 opacity-0 animate-fade-in-up" style={{animationDelay: '300ms'}}>
                    <Button onClick={handleOpenEventFormForAdd}>
                        + Add New Entry
                    </Button>
                    <Button onClick={handleOpenEraFormForAdd} variant="secondary">
                        Define New Era
                    </Button>
                </div>
                <TagFilter
                    className="opacity-0 animate-fade-in-up"
                    allTags={uniqueTags}
                    selectedTags={selectedTags}
                    onTagChange={handleTagChange}
                    onClear={() => setSelectedTags([])}
                />

                <div className="mt-12">
                    {/* --- THIS IS THE RESTORED MASTER BLUEPRINT --- */}
                    <div
                        className="grid grid-cols-[auto_1fr] gap-x-[var(--timeline-gap)]"
                        style={{
                            '--timeline-gap': '1.46rem',      // The space between the line and the text content (e.g., 24px)
                            '--timeline-dot-offset': '3.25rem', // How far the dot should move left to land on the line
                        } as React.CSSProperties}
                    >
                        {/* Column 1: The Master Spine  */}
                        <div className="w-0.5 h-full opacity-0 animate-reveal-up bg-muted mt-16"></div>

                        {/* Column 2: The Content Flow  */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleEraDragEnd}
                        >
                            <SortableContext
                                // Provide the IDs of the eras that can be sorted
                                items={sortedErasWithEvents.map(era => era.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-8">
                                    {sortedErasWithEvents.length > 0 ? (
                                        sortedErasWithEvents.map((eraWithEvents, index) => (
                                            // ... the rest of your rendering logic remains exactly the same ...
                                            eraWithEvents.events.length > 0 && (
                                                <div key={eraWithEvents.id} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${500 + index * 200}ms` }}>
                                                    <EraDivider
                                                        era={eraWithEvents}
                                                        onEdit={() => handleOpenEraFormForEdit(eraWithEvents)}
                                                        onDelete={() => handleDeleteEra(eraWithEvents)}
                                                    />
                                                    <DndContext
                                                        sensors={sensors}
                                                        collisionDetection={closestCenter}
                                                        // We pass the eraId to the handler to know which list we're sorting
                                                        onDragEnd={(e) => handleEventDragEnd(e, eraWithEvents.id)}
                                                    >
                                                        <SortableContext
                                                            items={eraWithEvents.events.map(e => e.id)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            <div className="space-y-8 mt-6">
                                                                {eraWithEvents.events.map(event => (
                                                                    <TimelineNode
                                                                        key={event.id}
                                                                        event={event}
                                                                        isActive={activeEventIdentifier === event.id}
                                                                        onClick={() => handleNodeClick(event.id)}
                                                                        onEdit={() => handleOpenEventFormForEdit(event)}
                                                                        onDelete={() => handleDeleteEvent(event.id)}
                                                                        characters={characters}
                                                                        writings={writings}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </SortableContext>
                                                    </DndContext>
                                                </div>
                                            )
                                        ))
                                    ) : (
                                        <div className="text-center py-16 opacity-0 animate-fade-in-up" style={{animationDelay: '500ms'}}>
                                            <p className="text-foreground/70">The chronicle is blank. Define thy first Era to begin.</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>

            {isEventFormOpen && (
                <EventForm
                    onClose={() => setIsEventFormOpen(false)}
                    onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
                    initialData={editingEvent}
                    characters={characters}
                    writings={writings}
                    eras={eras} // Pass the eras for the dropdown
                />
            )}
            {isEraFormOpen && (
                <EraForm
                    onClose={() => setIsEraFormOpen(false)}
                    onSubmit={editingEra ? handleUpdateEra : handleAddEra}
                    initialData={editingEra}
                    // The EraForm does NOT need characters or writings. We remove them.
                />
            )}
        </div>
    );
};

export default TimelinePage;