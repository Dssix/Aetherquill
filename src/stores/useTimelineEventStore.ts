import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type TimelineEvent, timelineEvents as initialEvents } from '../data/timelineEvents';

// The blueprint for our store's state and actions.
interface TimelineEventState {
    events: TimelineEvent[];
    addEvent: (data: Omit<TimelineEvent, 'id'>) => void;
    updateEvent: (id: string, data: Partial<Omit<TimelineEvent, 'id'>>) => void;
    deleteEvent: (id: string) => void;
}

// We create the store, wrapping it in the 'persist' middleware.
export const useTimelineEventStore = create<TimelineEventState>()(
    persist(
        (set) => ({
            // The store is initialized with the static data from your file.
            events: initialEvents,

            // Action to add a new event.
            addEvent: (data) => set(state => ({
                events: [...state.events, { id: `evt_${Date.now()}`, ...data }]
            })),

            // Action to update an existing event.
            updateEvent: (id, data) => set(state => ({
                events: state.events.map(e => e.id === id ? { ...e, ...data } : e)
            })),

            // Action to delete an event.
            deleteEvent: (id) => set(state => ({
                events: state.events.filter(e => e.id !== id)
            })),
        }),
        {
            // The key for saving to localStorage.
            name: 'aetherquill-timeline-events-storage',
        }
    )
);