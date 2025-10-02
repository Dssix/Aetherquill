import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        // --- THIS IS THE CRITICAL CHANGE ---
        // We replace the old, hardcoded colors with our new semantic Tailwind classes.
        <div
            className={`
                bg-card/60 text-card-foreground backdrop-blur-sm border border-border 
                rounded-lg shadow-lg transition-all duration-300
                hover:shadow-xl hover:border-accent/50
                ${className}
            `}
        >
            {title && (
                // The header inside the card also uses the new semantic colors.
                <header className="p-4 border-b border-border/50">
                    <h2 className="text-xl font-bold text-foreground">{title}</h2>
                </header>
            )}
            <div className="p-4 sm:p-6">
                {children}
            </div>
        </div>
    );
};

export default Card;