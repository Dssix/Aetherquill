import React from 'react';

interface TraitDisplayProps {
    label: string;
    value: string;
}

const TraitDisplay: React.FC<TraitDisplayProps> = ({ label, value }) => {
    // --- A Defensive Check ---
    if (!value?.trim()) {
        return null;
    }

    return (
        // --- The Alignment Magic ---
        // We use a flexbox container. 'justify-between' pushes the label and value to opposite ends.
        // 'items-start' ensures they align at the top if one wraps to a new line.
        // 'gap-2' ensures a minimum space between them.
        <div className="flex justify-between items-start gap-2 text-sm">

            {/* Column 1: The Label */}
            {/* 'flex-shrink-0' prevents the label from shrinking if the value is very long.
          'w-2/5' gives the label a consistent width (40% of the container).
          'text-right' aligns the text (and the colon) to the right edge of this column. */}
            <span className="w-2/5 flex-shrink-0 pr-2 text-right font-semibold text-muted-foreground">
        {label}:
      </span>

            {/* Column 2: The Value */}
            {/* 'w-3/5' gives the value the remaining width (60%).
          This ensures that the start of every value text aligns perfectly. */}
            <span className="w-3/5 text-left text-foreground">
        {value}
      </span>
        </div>
    );
};

export default TraitDisplay;