import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div
            className={`
        bg-parchment-highlight/60 backdrop-blur-sm border border-ink-brown/20 
        rounded-lg shadow-lg transition-all duration-300
        hover:shadow-xl hover:border-gold-leaf/30
        ${className}
      `}
        >
            {title && (
                <header className="p-4 border-b border-ink-brown/10">
                    <h2 className="text-xl font-bold text-ink-brown">{title}</h2>
                </header>
            )}
            <div className="p-4 sm:p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;