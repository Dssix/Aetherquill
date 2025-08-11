import React from 'react';

export type ZoomLevel = 'all' | 'era';

interface ZoomControlProps {
    currentZoom: ZoomLevel;
    onZoomChange: (level: ZoomLevel) => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ currentZoom, onZoomChange }) => {
    const baseStyle = "px-4 py-2 rounded-md text-sm transition-all duration-200";
    const activeStyle = "bg-ink-brown/80 text-parchment-highlight shadow-inner";
    const inactiveStyle = "bg-card/60 hover:bg-card";

    return (
        <div className="bg-card/60 p-1 rounded-lg border border-border flex gap-1">
            <button
                onClick={() => onZoomChange('all')}
                className={`${baseStyle} ${currentZoom === 'all' ? activeStyle : inactiveStyle}`}
            >
                All Events
            </button>
            <button
                onClick={() => onZoomChange('era')}
                className={`${baseStyle} ${currentZoom === 'era' ? activeStyle : inactiveStyle}`}
            >
                Era Overview
            </button>
        </div>
    );
};

export default ZoomControl;