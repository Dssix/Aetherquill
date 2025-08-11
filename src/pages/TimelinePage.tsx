import React, { useState, useMemo, useEffect } from 'react';
import { type TimelineEvent } from '../data/timelineEvents';
import {type Era} from '../data/eraManager'; // We'll need to refactor Eras next
import { useAppStore } from '../stores/useAppStore';
import { EraForm } from '../components/EraForm';
import { getUniqueTags } from '../utils/tagUtils';
import TimelineNode from '../components/TimelineNode';
import TagFilter from '../components/TagFilter';
import { EventForm } from '../components/EventForm';
import EraDivider from '../components/EraDivider';
import Button from '../components/ui/Button';

const TimelinePage: React.FC = () => {
    const {
        userData,
        currentProjectId,
        addTimelineEvent,
        updateTimelineEvent,
        deleteTimelineEvent,
        addEra,
        updateEra,
        // deleteEra // We will add a delete button for eras later
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
        const sortedEras = [...eras].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        const eventsByEra = filteredEvents.reduce((acc, event) => {
            const key = event.eraId || 'no-era'; // Use 'no-era' for unassigned events.
            if (!acc[key]) { acc[key] = []; }
            acc[key].push(event);
            return acc;
        }, {} as Record<string, TimelineEvent[]>);

        const result = sortedEras.map(era => ({
            ...era,
            events: eventsByEra[era.id] || [] // Default to an empty array if an era has no events.
        }));

        if (eventsByEra['no-era']) {
            result.push({
                id: 'no-era',
                name: 'Unassigned Events',
                startDate: '',
                endDate: '',
                events: eventsByEra['no-era']
            });
        }
        return result;
    }, [eras, filteredEvents]); // This hook now depends on both 'eras' and 'filteredEvents'.

    useEffect(() => {
        if (activeEventIdentifier) {
            const isActiveEventVisible = filteredEvents.some(event => event.id === activeEventIdentifier);
            if (!isActiveEventVisible) {
                setActiveEventIdentifier(null);
            }
        }
    }, [filteredEvents, activeEventIdentifier]);

    // Helper Function: Finds the correct era for a given event date.
    const findEraIdForDate = (eventDate: string, allEras: Era[]): string | null => {
        if (!eventDate) return null;
        const date = new Date(eventDate);
        // Find the first era where the event date falls within its range.
        const matchingEra = allEras.find(era => {
            const start = new Date(era.startDate);
            const end = new Date(era.endDate);
            return date >= start && date <= end;
        });
        return matchingEra ? matchingEra.id : null;
    };

    const handleAddEvent = (data: Omit<TimelineEvent, 'id' | 'eraId'>) => {
        const eraId = findEraIdForDate(data.date, eras);
        addTimelineEvent({ ...data, eraId }); // Call new store action
        setIsEventFormOpen(false);
    };

    const handleUpdateEvent = (data: Omit<TimelineEvent, 'id' | 'eraId'>) => {
        if (!editingEvent) return;
        const eraId = findEraIdForDate(data.date, eras);
        updateTimelineEvent(editingEvent.id, { ...data, eraId }); // Call new store action
        setEditingEvent(null);
        setIsEventFormOpen(false);
    };

    const handleDeleteEvent = (id: string) => {
        if (window.confirm("Are you sure you wish to erase this entry?")) {
            deleteTimelineEvent(id); // Call new store action
        }
    };

    // Era Handlers
    const handleAddEra = (data: Omit<Era, 'id'>) => {
        addEra(data); // Call new store action
        setIsEraFormOpen(false);
    };

    const handleUpdateEra = (data: Omit<Era, 'id'>) => {
        if (!editingEra) return;
        updateEra(editingEra.id, data); // Call new store action
        setEditingEra(null);
        setIsEraFormOpen(false);
    };

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
                        // The 'gap-x' now reads its value directly from our CSS variable.
                        className="grid grid-cols-[auto_1fr] gap-x-[var(--timeline-gap)]"

                        style={{
                            '--timeline-gap': '1.46rem',      // The space between the line and the text content (e.g., 24px)
                            '--timeline-dot-offset': '1.49rem', // How far the dot should move left to land on the line
                        } as React.CSSProperties}
                    >
                        {/* Column 1: The Master Spine (no changes needed here) */}
                        <div className="w-0.5 h-full opacity-0 animate-reveal-up bg-muted mt-16"></div>

                        {/* Column 2: The Content Flow (no changes needed here) */}
                        <div className="space-y-8">
                            {sortedErasWithEvents.length > 0 ? (
                                sortedErasWithEvents.map((eraWithEvents, index) => (
                                    // ... the rest of your rendering logic remains exactly the same ...
                                    eraWithEvents.events.length > 0 && (
                                        <div key={eraWithEvents.id} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${500 + index * 200}ms` }}>
                                            <EraDivider era={eraWithEvents} onEdit={() => handleOpenEraFormForEdit(eraWithEvents)} />
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
                                        </div>
                                    )
                                ))
                            ) : (
                                <div className="text-center py-16 opacity-0 animate-fade-in-up" style={{animationDelay: '500ms'}}>
                                    <p className="text-foreground/70">No entries match thy filter...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEventFormOpen && (
                <EventForm
                    onClose={() => setIsEventFormOpen(false)}
                    onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent}
                    initialData={editingEvent}
                    // The EventForm correctly needs characters and writings for linking.
                    characters={characters}
                    writings={writings}
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