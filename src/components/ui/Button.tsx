import React from 'react';

// The props interface remains the same.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    // --- Step 1: Update the base styles to use semantic colors ---
    // The focus ring now correctly uses the 'ring' and 'background' variables.
    const baseStyles = "px-6 py-2 rounded-md shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";

    // --- Step 2: Update the variants to use our semantic palette ---
    // This is the heart of the correction.
    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
        secondary: "bg-transparent border border-primary text-primary hover:bg-primary/10 focus:ring-primary",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;