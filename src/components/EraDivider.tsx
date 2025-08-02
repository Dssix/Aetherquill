import React from 'react';
// We now import the full 'Era' type definition.
import { type Era } from '../data/eraManager';

// The component's contract is updated. It now needs the full 'era' object
// and an 'onEdit' function to call when the edit button is clicked.
interface EraDividerProps {
    era: Era;
    onEdit: () => void;
}

const EraDivider: React.FC<EraDividerProps> = ({ era, onEdit }) => {
    return (
        // We add 'group' and 'relative' to the main container.
        // 'relative' allows us to position the edit button inside it.
        // 'group' allows the edit button to appear when we hover over the divider.
        <div className="flex items-center my-6 group relative">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-ink-brown/20 to-transparent"></div>

            <div className="text-center mx-4">
                <h2 className="text-xl font-bold text-gold-leaf tracking-widest uppercase">{era.name}</h2>

                {/* We conditionally render the date range, but only if the dates exist.
            This prevents it from showing for our special "Unassigned Events" group. */}
                {era.startDate && era.endDate && (
                    <p className="text-xs text-ink-brown/60">{`${era.startDate} – ${era.endDate}`}</p>
                )}
            </div>

            <div className="flex-grow h-px bg-gradient-to-l from-transparent via-ink-brown/20 to-transparent"></div>

            {/* This is the new Edit button.
          - It only appears if the era is a real one (not our 'no-era' placeholder).
          - It is positioned on the right side of the container.
          - It starts with 'opacity-0' and becomes visible on 'group-hover'. */}
            {era.id !== 'no-era' && (
                <button
                    onClick={onEdit}
                    className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-parchment-highlight px-2 py-1 rounded border border-ink-brown/20"
                >
                    Edit Era
                </button>
            )}
        </div>
    );
};

export default EraDivider;