import React from 'react';

// We extend the standard button attributes to allow passing props like 'onClick', 'disabled', etc.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
    // Base styles shared by all button variants.
    const baseStyles = "px-6 py-2 rounded-md shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-parchment";

    // Specific styles for each variant.
    const variants = {
        primary: "bg-gold-leaf text-white hover:opacity-90 focus:ring-gold-leaf",
        secondary: "bg-transparent border border-gold-leaf text-gold-leaf hover:bg-gold-leaf/10 focus:ring-gold-leaf",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;